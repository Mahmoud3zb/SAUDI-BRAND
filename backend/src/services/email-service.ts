import fs from "fs/promises";
import path from "path";
import nodemailer from "nodemailer";
import { MailOptions } from "nodemailer/lib/json-transport";
import dotenv from "dotenv";

dotenv.config();
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});


async function sendEmail(options: {
    to: string;
    subject: string;
    html: string;
}) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("Email warning: EMAIL_USER or EMAIL_PASS not set in environment. Skipping email dispatch.");
        return;
    }
    const mailOptions: MailOptions = {
        from: process.env.EMAIL_USER,
        ...options,
    };
    const info = await transporter.sendMail(mailOptions);

    console.log("email sent to ", info.accepted);
}

async function sendGoogleWelcomeEmail(email: string, name: string) {
    try {
        const templatePath = path.resolve(__dirname, "templates/continue-W-google.html");
        let emailTemplate = await fs.readFile(templatePath, "utf-8");
        emailTemplate = emailTemplate.replace("{name}", name);

        await sendEmail({
            to: email,
            subject: "Welcome to SAUDI BRAND 👋",
            html: emailTemplate,
        });
    } catch (err) {
        console.error("Failed to read google welcome template:", err);
    }
}

async function sendEmailVerificationLink(email: string, token: string) {
    try {
        const templatePath = path.resolve(__dirname, "templates/register.html");
        let emailTemplate = "";
        try {
            emailTemplate = await fs.readFile(templatePath, "utf-8");
            emailTemplate = emailTemplate.replace("{name}", email.split("@")[0]);
        } catch {
            emailTemplate = `<h2>Welcome to SAUDI BRAND!</h2><p>Your verification token is: ${token}</p>`;
        }

        await sendEmail({
            to: email,
            subject: "Verify Your Email - SAUDI BRAND",
            html: emailTemplate,
        });
    } catch (err) {
        console.error("Failed to send verification email:", err);
    }
}

export const emailService = {
    sendEmail,
    sendGoogleWelcomeEmail,
    sendEmailVerificationLink
};
