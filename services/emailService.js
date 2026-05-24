const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

exports.sendAgentWelcomeEmail = async (email, name, password) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px;">
        <h2 style="color: #1976d2;">Welcome to RiYo Holidays, ${name}!</h2>
        <p>Your agent account has been successfully created.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Login URL:</strong> <a href="http://localhost:5173/login">http://localhost:5173/login</a></p>
          <p style="margin: 5px 0 0 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 5px 0 0 0;"><strong>Temporary Password:</strong> ${password}</p>
        </div>
        <p>Please log in and change your password as soon as possible.</p>
        <p>Best regards,<br>The RiYo Holidays Team</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"RiYo Holidays" <${process.env.SMTP_MAIL}>`,
      to: email,
      subject: "Welcome to RiYo Holidays - Agent Account Created",
      html: html,
    });

    console.log("[Email Debug Nodemailer] Welcome email sent successfully. MessageId: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("[Email Debug Nodemailer Error] Error sending welcome email:", error);
    return false;
  }
};

exports.sendAgentStatusChangeEmail = async (email, name, status) => {
  try {
    const isActive = status === 'active';
    const statusColor = isActive ? '#4caf50' : '#f44336';
    const statusText = isActive ? 'Activated' : 'Deactivated';
    
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px;">
        <h2 style="color: #1976d2;">Account Status Update</h2>
        <p>Hello ${name},</p>
        <p>Your RiYo Holidays agent account status has been updated.</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="background-color: ${statusColor}; color: white; padding: 10px 20px; border-radius: 20px; font-weight: bold; font-size: 16px;">
            Account ${statusText}
          </span>
        </div>
        ${isActive 
          ? '<p>You can now log in to the dashboard and manage your bookings.</p>' 
          : '<p>Your access to the agent dashboard has been temporarily suspended. Please contact the administrator for more details.</p>'
        }
        <p>Best regards,<br>The RiYo Holidays Team</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"RiYo Holidays" <${process.env.SMTP_MAIL}>`,
      to: email,
      subject: `Your Agent Account is now ${statusText}`,
      html: html,
    });

    console.log("[Email Debug Nodemailer] Status change email sent successfully. MessageId: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("[Email Debug Nodemailer Error] Error sending status email:", error);
    return false;
  }
};
