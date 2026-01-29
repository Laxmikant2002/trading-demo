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

export const sendTradeConfirmationEmail = async (
  userId: number,
  order: any,
): Promise<boolean> => {
  // In a real application, you'd look up the user's email from the database
  // For now, we'll use a placeholder email
  const userEmail = `user${userId}@example.com`;

  const orderType = order.type.toUpperCase();
  const side = order.side.toUpperCase();
  const symbol = order.symbol;
  const quantity = order.quantity;
  const price = order.filled_price || order.price || "Market";

  const html = `
    <h1>Trade Confirmation</h1>
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <h2>${orderType} Order Executed</h2>
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Symbol:</strong> ${symbol}</p>
      <p><strong>Side:</strong> ${side}</p>
      <p><strong>Quantity:</strong> ${quantity}</p>
      <p><strong>Price:</strong> ${price}</p>
      <p><strong>Status:</strong> ${order.status.toUpperCase()}</p>
      <p><strong>Timestamp:</strong> ${new Date(order.timestamp).toLocaleString()}</p>
    </div>
    <p>Thank you for trading with XPro Trading!</p>
    <p>If you have any questions, please contact our support team.</p>
  `;

  return sendEmail({
    to: userEmail,
    subject: `Trade Confirmation - ${orderType} ${symbol} ${side}`,
    html,
  });
};
