import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendEmail = async (to, subject, html) => {
    const mailOptions = {
        from: `Event Planner <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
    };
    await transporter.sendMail(mailOptions);
};

export const sendRegisterWelcomeMail = async (to, name) => {
    const mailOptions = {
        from: `"Event Planner" <${process.env.EMAIL_USER}>`,
        to,
        subject: "🎉 Welcome to Event Planner!",
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                <h2>Hi ${name},</h2>
                <p>Welcome to <strong>Event Planner</strong> – your go-to platform for discovering, booking, and attending amazing events!</p>

                <p>You’ve successfully registered and can now explore concerts, workshops, exhibitions, and more.</p>

                <p>🔐 Log in using your registered email and password to get started.</p>

                <p>Need help? Just reply to this email or visit our Help Center.</p>

                <p>We’re excited to have you on board!</p>

                <p>Cheers,<br/>
                The <strong>Event Planner</strong> Team</p>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};


export const sendResetEmail = async (to, token) => {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
        from: `"Event Planner" <${process.env.EMAIL_USER}>`,
        to,
        subject: "🔐 Reset Your Password - Event Planner",
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; padding: 20px;">
                <h2 style="color: #4A90E2;">Reset Your Password</h2>
                
                <p>We received a request to reset your password for your <strong>Event Planner</strong> account associated with <strong>${to}</strong>.</p>
                
                <p>Click the button below to reset your password. This link is valid for one hour:</p>

                <a href="${resetLink}" 
                   style="display: inline-block; padding: 12px 20px; background-color: #4A90E2; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">
                   Reset Password
                </a>

                <p>If you didn’t request this, you can safely ignore the email — your password will remain unchanged.</p>

                <p>Need assistance? Just reply to this email.</p>

                <p>Warm regards,<br/>
                The <strong>Event Planner</strong> Team</p>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};


export const sendPasswordResetSuccessEmail = async (to, name) => {
    const mailOptions = {
        from: `"Event Planner" <${process.env.EMAIL_USER}>`,
        to,
        subject: "✅ Your Event Planner Password Was Reset",
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; padding: 20px;">
                <h2 style="color: #4A90E2;">Hi ${name},</h2>
                
                <p>This is a confirmation that your password for <strong>Event Planner</strong> has been successfully changed.</p>
                
                <p>If this was you, you’re all set. If not, please <a href="mailto:${process.env.EMAIL_USER}" style="color: #d32f2f; text-decoration: underline;">contact support</a> immediately.</p>

                <p>🔐 For better security, always use a strong and unique password.</p>

                <p>Thanks for using Event Planner!</p>

                <p>Best,<br/>
                The <strong>Event Planner</strong> Team</p>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};


export const bookingConfirmationTemplate = ({ name, event, booking }) => `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color:#4A90E2;">Hi ${name},</h2>
        <p>Thank you for booking <strong>${event.title}</strong> on <strong>${new Date(event.eventDate).toDateString()}</strong> in <strong>${event.city}</strong>.</p>
        <h3>🎫 Booking Summary</h3>
        <ul>
            <li><strong>Ticket Category:</strong> ${booking.ticketCategory}</li>
            <li><strong>Quantity:</strong> ${booking.quantity}</li>
            <li><strong>Total Paid:</strong> ₹${booking.amount}</li>
        </ul>
        <p>Your QR code is available in your dashboard.</p>
        <p>We look forward to seeing you at the event!</p>
        <p>Cheers,<br/><strong>Event Planner</strong> Team</p>
    </div>
`;

export const orderConfirmationTemplate = ({ name, order }) => `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color:#4A90E2;">Hi ${name},</h2>
        <p>Thank you for shopping with <strong>Event Planner</strong>!</p>
        <h3>🛍️ Order Summary</h3>
        <ul>
            ${order.products.map(p => `<li>${p.quantity} × ${p.product.name} — ₹${p.price}</li>`).join('')}
        </ul>
        <p><strong>Total Paid:</strong> ₹${order.totalAmount}</p>
        <p>Your order is confirmed. Our team will reach out soon.</p>
        <p>Regards,<br/><strong>Event Planner</strong> Team</p>
    </div>
`;