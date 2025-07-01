import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});


export const sendGuestCredentialsMail = async (to, name, password) => {
    const mailOptions = {
        from: `"AI-Powered Psychometric Test" <${process.env.EMAIL_USER}>`,
        to,
        subject: "🎉 Your Guest Access to AI-powered psychometric testing",
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                <h2>Welcome to <span style="color:#4A90E2;">AI-powered psychometric testing</span>, ${name}!</h2>
                <p>We're excited to have you try our <strong>AI-powered psychometric testing platform</strong>.</p>
                
                <p>Here are your guest login credentials:</p>
                <ul>
                    <li><strong>Email:</strong> ${to}</li>
                    <li><strong>Password:</strong> ${password}</li>
                </ul>

                <p>🔒 Please make sure to change your password after logging in.</p>

                <p>Explore cognitive insights and discover your strengths.</p>

                <p>Cheers,<br/>
                The <strong>AI-Powered Psychometric Test</strong> Team</p>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};


export const sendRegisterWelcomeMail = async (to, name) => {
    const mailOptions = {
        from: `"AI-Powered Psychometric Test" <${process.env.EMAIL_USER}>`,
        to,
        subject: "🎉 Welcome to AI-Powered Psychometric Test !",
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                <h2>Hi ${name},</h2>
                <p>Welcome to <strong>AI-Powered Psychometric Test</strong> – your personalized platform for AI-powered psychometric testing and cognitive insights.</p>
                
                <p>You’ve successfully registered and can now begin exploring your psychological strengths and mental models using our cutting-edge tools.</p>

                <p>🔐 You can securely log in using your email and password on our platform.</p>

                <p>If you need any assistance, feel free to reply to this email.</p>

                <p>Enjoy the experience!</p>

                <p>Best regards,<br/>
                The <strong>AI-Powered Psychometric Test</strong> Team</p>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};


export const sendResetEmail = async (to, token) => {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
        from: `"AI-Powered Psychometric Test" <${process.env.EMAIL_USER}>`,
        to,
        subject: "🔐 Reset Your Password - AI-Powered Psychometric Test",
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; padding: 20px;">
                <h2 style="color: #4A90E2;">Reset Your Password</h2>
                
                <p>We received a request to reset your password for your AI-Powered Psychometric Test account associated with <strong>${to}</strong>.</p>
                
                <p>Click the button below to reset your password. This link is valid for one hour:</p>

                <a href="${resetLink}" 
                   style="display: inline-block; padding: 12px 20px; background-color: #4A90E2; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">
                   Reset Password
                </a>

                <p>If you didn’t request a password reset, please ignore this email. Your password will remain unchanged.</p>

                <p>Need help? Just reply to this email—we’re here for you.</p>

                <p>Warm regards,<br/>
                The <strong>AI-Powered Psychometric Test</strong> Team</p>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};


export const sendPasswordResetSuccessEmail = async (to, name) => {
    const mailOptions = {
        from: `"AI-Powered Psychometric Test" <${process.env.EMAIL_USER}>`,
        to,
        subject: "✅ Your Password Has Been Successfully Reset",
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; padding: 20px;">
                <h2 style="color: #4A90E2;">Hi ${name},</h2>
                
                <p>We're confirming that your password for <strong>AI-Powered Psychometric Test</strong> has been successfully changed.</p>
                
                <p>If you made this change, no further action is needed.</p>

                <p>If you didn’t change your password, please <a href="mailto:${process.env.EMAIL_USER}" style="color: #d32f2f; text-decoration: underline;">contact our support team</a> immediately.</p>

                <p>🔐 Always ensure your account is protected by using a strong, unique password.</p>

                <p>Thanks for using AI-Powered Psychometric Test!</p>

                <p>Best regards,<br/>
                The <strong>AI-Powered Psychometric Test</strong> Team</p>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};
