import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const { data, error } = await resend.emails.send({
      from: options.from || "noreply@xprotrading.com",
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error("Email send error:", error);
      return false;
    }

    console.log("Email sent successfully:", data);
    return true;
  } catch (error) {
    console.error("Email service error:", error);
    return false;
  }
};

export const sendVerificationEmail = async (
  email: string,
  token: string,
): Promise<boolean> => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const html = `
    <h1>Verify Your Email</h1>
    <p>Please click the link below to verify your email address:</p>
    <a href="${verificationUrl}">Verify Email</a>
    <p>This link will expire in 24 hours.</p>
  `;

  return sendEmail({
    to: email,
    subject: "Verify Your Email - XPro Trading",
    html,
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  token: string,
): Promise<boolean> => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const html = `
    <h1>Reset Your Password</h1>
    <p>Please click the link below to reset your password:</p>
    <a href="${resetUrl}">Reset Password</a>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  return sendEmail({
    to: email,
    subject: "Reset Your Password - XPro Trading",
    html,
  });
};
