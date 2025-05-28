import 'dotenv/config';
import nodemailer from 'nodemailer'
import { ResetPasswordHtml } from '../html/reset-password.html.js';
import { VerifyEmailHtml } from '../html/verify-email-html.js';

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendResetPasswordLink = async (email, token) => {
    const resetUrl = `http://localhost:3000/reset-password/${token}`;
    try {
        // Only log minimal info, not the entire response
        const info = await transporter.sendMail({
            from: '"Talk App" <mhmdsayed90031@gmail.com>',
            to: email,
            subject: "Reset Your Password",
            html: ResetPasswordHtml(resetUrl)
        });
        return info.messageId;
    } catch (error) {
        throw error;
    }

}

const sendVerifyEmail = async (email, code) => {
    await transporter.sendMail({
        from: '"Talk App" <mhmdsayed90031@gmail.com>',
        to: email,
        subject: "Verify your email",
        html: VerifyEmailHtml(code)
    })
}

export {
    sendResetPasswordLink,
    sendVerifyEmail
}