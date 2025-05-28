const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const { User } = require('../db/models');
const { sendResetEmail } = require('../services/emailService');

const saltRounds = 10;

function generateTokens(userId) {
  const accessToken = jwt.sign(
    { userId },
    config.server.jwtSecret,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { userId },
    config.server.jwtSecret,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
}

module.exports = {
  async register(req, res) {
    try {
      const { username, password, name, contact_info } = req.body;
      
      console.log('Registration attempt:', { username, name, contact_info });
      
      // Check if user already exists
      const userExists = await User.findOne({
        where: { username }
      });
      
      if (userExists) {
        console.log('User already exists:', username);
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      console.log('Password hashed successfully');

      // Create new user
      console.log('Attempting to create new user...');
      const newUser = await User.create({
        username,
        password_hash: hashedPassword,
        name,
        contact_info
      });
      console.log('User created successfully:', newUser.user_id);

      res.status(201).json({
        success: true,
        user_id: newUser.user_id
      });
    } catch (err) {
      console.error('Registration error details:', {
        message: err.message,
        stack: err.stack,
        code: err.code,
        detail: err.detail
      });
      res.status(500).json({ 
        error: 'Registration failed',
        details: err.message,
        code: err.code
      });
    }
  },

  async login(req, res) {
    try {
      const { username, password } = req.body;
      console.log('Login attempt:', { username });

      // Get user from database
      const user = await User.findOne({
        where: { username },
        attributes: ['user_id', 'username', 'password_hash', 'name', 'contact_info']
      });

      if (!user) {
        console.log('User not found:', username);
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(
        password, 
        user.password_hash
      );

      if (!isValidPassword) {
        console.log('Invalid password for user:', username);
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      console.log('Login successful for user:', username);

      // Generate tokens
      const tokens = generateTokens(user.user_id);

      res.json({
        success: true,
        data: {
          user: {
            id: user.user_id,
            username: user.username,
            name: user.name,
            contact_info: user.contact_info
          },
          ...tokens
        }
      });
    } catch (err) {
      console.error('Login error details:', {
        message: err.message,
        stack: err.stack,
        code: err.code,
        detail: err.detail
      });
      res.status(500).json({ 
        error: 'Login failed',
        details: err.message,
        code: err.code
      });
    }
  },

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.server.jwtSecret);
      
      // Generate new access token
      const accessToken = jwt.sign(
        { userId: decoded.userId }, 
        config.server.jwtSecret, 
        { expiresIn: '15m' }
      );

      res.json({ 
        success: true,
        data: { accessToken }
      });
    } catch (err) {
      console.error('Token refresh error details:', {
        message: err.message,
        stack: err.stack
      });
      res.status(401).json({ 
        error: 'Invalid refresh token',
        details: err.message
      });
    }
  },

  async requestPasswordReset(req, res) {
    try {
      const { username } = req.body;
      console.log('Password reset request for user:', username);

      // Check if user exists
      const user = await User.findOne({
        where: { username },
        attributes: ['user_id', 'username', 'contact_info']
      });

      if (!user) {
        console.log('User not found for password reset:', username);
        return res.status(404).json({ error: 'User not found' });
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user.user_id }, 
        config.server.jwtSecret, 
        { expiresIn: '1h' }
      );

      // Save reset token to database
      await user.update({ reset_token: resetToken });

      // Send reset email
      await sendResetEmail(user.contact_info, resetToken);
      console.log('Password reset email sent to:', user.contact_info);

      res.json({ 
        success: true,
        message: 'Password reset email sent' 
      });
    } catch (err) {
      console.error('Password reset request error details:', {
        message: err.message,
        stack: err.stack,
        code: err.code,
        detail: err.detail
      });
      res.status(500).json({ 
        error: 'Password reset failed',
        details: err.message,
        code: err.code
      });
    }
  },

  async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;
      console.log('Password reset attempt with token');

      // Verify token
      const decoded = jwt.verify(token, config.server.jwtSecret);

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password and clear reset token
      await User.update(
        {
          password_hash: hashedPassword,
          reset_token: null
        },
        {
          where: { user_id: decoded.userId }
        }
      );
      console.log('Password reset successful for user ID:', decoded.userId);

      res.json({ 
        success: true,
        message: 'Password reset successful' 
      });
    } catch (err) {
      console.error('Password reset error details:', {
        message: err.message,
        stack: err.stack,
        code: err.code,
        detail: err.detail
      });
      res.status(400).json({ 
        error: 'Invalid or expired token',
        details: err.message,
        code: err.code
      });
    }
  }
};