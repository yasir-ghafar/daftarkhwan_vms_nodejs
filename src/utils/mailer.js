const nodemailer = require("nodemailer");

class Mailer {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT, // standard Gmail SMTP port
      secure: process.env.MAIL_SECURE, // true for 465, false for 587
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendEmail(to, subject, text, html = null) {
    try {
      const mailOptions = {
        from: process.env.EMAIL,
        to,
        subject,
        text,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("✅ Email sent:", info.messageId);
      return info;
    } catch (error) {
      console.error("❌ Error sending email:", error);
      throw new Error("Email sending failed!");
    }
  }
}

const mailer = new Mailer();
module.exports = { mailer };
