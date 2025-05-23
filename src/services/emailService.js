const nodemailer = require('nodemailer');
const config = require('../../config/config');

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'username',
    pass: process.env.SMTP_PASS || 'password'
  }
});

module.exports = {
  async sendResetEmail(email, token) {
    try {
      const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password/${token}`;
      
      // Email content
      const mailOptions = {
        from: `"Fall Detection System" <${process.env.EMAIL_FROM || 'no-reply@example.com'}>`,
        to: email,
        subject: 'Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Password Reset</h2>
            <p>You requested a password reset for your Fall Detection System account.</p>
            <p>Please click the button below to reset your password:</p>
            <p style="margin: 20px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #3498db; color: white; padding: 10px 20px; 
                        text-decoration: none; border-radius: 5px;">
                Reset Password
              </a>
            </p>
            <p>If you didn't request this, please ignore this email.</p>
            <p style="margin-top: 30px; color: #7f8c8d; font-size: 0.9em;">
              This link will expire in 1 hour.
            </p>
          </div>
        `
      };

      // Send email
      await transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${email}`);
    } catch (err) {
      console.error('Error sending reset email:', err);
      throw err;
    }
  }
};