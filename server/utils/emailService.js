const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

// Send verification email
const sendVerificationEmail = async (email, name, token) => {
    try {
        const transporter = createTransporter();

        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${token}`;

        const mailOptions = {
            from: process.env.EMAIL_FROM || `"Smart Expense Splitter" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify your email - Smart Expense Splitter',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .container {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            padding: 40px;
                            border-radius: 10px;
                        }
                        .content {
                            background: white;
                            padding: 30px;
                            border-radius: 8px;
                        }
                        h1 {
                            color: #667eea;
                            margin-top: 0;
                        }
                        .button {
                            display: inline-block;
                            padding: 15px 30px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            text-decoration: none;
                            border-radius: 5px;
                            margin: 20px 0;
                            font-weight: bold;
                        }
                        .footer {
                            margin-top: 20px;
                            font-size: 12px;
                            color: #666;
                        }
                        .warning {
                            background: #fff3cd;
                            border-left: 4px solid #ffc107;
                            padding: 10px;
                            margin: 20px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="content">
                            <h1>🎉 Welcome to Smart Expense Splitter!</h1>
                            <p>Hi <strong>${name}</strong>,</p>
                            <p>Thanks for signing up! We're excited to have you on board.</p>
                            <p>Please verify your email address by clicking the button below:</p>
                            
                            <center>
                                <a href="${verificationUrl}" class="button">Verify Email Address</a>
                            </center>
                            
                            <p>Or copy and paste this link into your browser:</p>
                            <p style="background: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all;">
                                ${verificationUrl}
                            </p>
                            
                            <div class="warning">
                                <strong>⏰ Important:</strong> This link will expire in 24 hours.
                            </div>
                            
                            <p>If you didn't create an account with Smart Expense Splitter, please ignore this email.</p>
                            
                            <div class="footer">
                                <p>Best regards,<br>
                                <strong>Smart Expense Splitter Team</strong></p>
                                <p style="color: #999; font-size: 11px;">
                                    This is an automated email. Please do not reply to this message.
                                </p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Verification email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Failed to send verification email');
    }
};

// Send password reset email (for future use)
const sendPasswordResetEmail = async (email, name, token) => {
    try {
        const transporter = createTransporter();

        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;

        const mailOptions = {
            from: process.env.EMAIL_FROM || `"Smart Expense Splitter" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Reset your password - Smart Expense Splitter',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .container {
                            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                            padding: 40px;
                            border-radius: 10px;
                        }
                        .content {
                            background: white;
                            padding: 30px;
                            border-radius: 8px;
                        }
                        h1 {
                            color: #f5576c;
                            margin-top: 0;
                        }
                        .button {
                            display: inline-block;
                            padding: 15px 30px;
                            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                            color: white;
                            text-decoration: none;
                            border-radius: 5px;
                            margin: 20px 0;
                            font-weight: bold;
                        }
                        .warning {
                            background: #fff3cd;
                            border-left: 4px solid #ffc107;
                            padding: 10px;
                            margin: 20px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="content">
                            <h1>🔐 Reset Your Password</h1>
                            <p>Hi <strong>${name}</strong>,</p>
                            <p>We received a request to reset your password. Click the button below to create a new password:</p>
                            
                            <center>
                                <a href="${resetUrl}" class="button">Reset Password</a>
                            </center>
                            
                            <div class="warning">
                                <strong>⏰ Important:</strong> This link will expire in 1 hour.
                            </div>
                            
                            <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Failed to send password reset email');
    }
};

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail
};
