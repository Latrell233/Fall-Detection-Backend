const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');

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
      const { username, password } = req.body;
      
      console.log('Registration attempt:', { username });
      
      // Check if user already exists
      const existingUser = await req.app.locals.db.User.findOne({
        where: { username }
      });
      
      if (existingUser) {
        console.log('User already exists:', username);
        return res.status(400).json({
          error: 'Registration failed',
          details: 'Username already exists'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      console.log('Password hashed successfully');

      // Create new user
      console.log('Attempting to create new user...');
      const user = await req.app.locals.db.User.create({
        username,
        password_hash: hashedPassword
      });
      console.log('User created successfully:', user.user_id);

      res.status(201).json({
        success: true,
        user_id: user.user_id
      });
    } catch (err) {
      console.error('Registration error details:', err);
      res.status(500).json({
        error: 'Registration failed',
        details: err.message
      });
    }
  },

  async login(req, res) {
    try {
      const { username, password } = req.body;
      console.log('Login attempt:', { username });

      // Get user from database
      const user = await req.app.locals.db.User.findOne({
        where: { username },
        attributes: ['user_id', 'username', 'password_hash']
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
            username: user.username
          },
          ...tokens
        }
      });
    } catch (err) {
      console.error('Login error details:', err);
      res.status(500).json({
        error: 'Login failed',
        details: err.message
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
      const user = await req.app.locals.db.User.findOne({
        where: { username },
        attributes: ['user_id', 'username']
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

      res.json({ 
        success: true,
        message: 'Password reset token generated',
        resetToken
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
      await req.app.locals.db.User.update(
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