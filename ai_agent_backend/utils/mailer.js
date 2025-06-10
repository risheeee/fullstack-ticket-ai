import nodemailer from "nodemailer";

export const sendMail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_SMTP_HOST,
      port: MAILTRAP_SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: MAILTRAP_SMTP_USER,
        pass: MAILTRAP_SMTP_PASS,
      },
    });
    const info = await transporter.sendMail({
      from: "Inngest TMS",
      to,
      subject,
      text,
    });

    console.log("message sent: ", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ mail error: ", error.message);
    throw error;
  }
};
