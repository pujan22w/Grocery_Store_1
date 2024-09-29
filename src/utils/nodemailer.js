import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for port 465, false for other ports
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

export async function sendmail(to, sub, msg) {
  try {
    const info = await transporter.sendMail({
      from: process.env.NODEMAILER_EMAIL, // Make sure to specify the 'from' address
      to: to,
      subject: sub,
      html: msg,
    });
    console.log("Email sent:", info.response);
    return info; // Optionally return info for further processing
  } catch (error) {
    console.log("Error occurred:", error);
    throw error; // Rethrow the error to handle it further up the call stack if needed
  }
}
