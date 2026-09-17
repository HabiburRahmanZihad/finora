import nodemailer from "nodemailer";

const smtpConfigured = Boolean(
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS,
);

// Lazily created so builds/tests that never send an email don't need SMTP env
// vars set, and so we don't open a connection until one is actually needed.
let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!smtpConfigured) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

export async function sendPasswordResetEmail(to: string, url: string) {
  const mailer = getTransporter();

  if (!mailer) {
    // No SMTP configured (e.g. local dev) — log the link so the reset flow
    // stays testable without needing real email credentials.
    console.log(`[finora] Password reset link for ${to}: ${url}`);
    return;
  }

  await mailer.sendMail({
    from: process.env.EMAIL_FROM ?? process.env.SMTP_USER,
    to,
    subject: "Reset your Finora password",
    text: `Reset your Finora password by visiting this link:\n\n${url}\n\nIf you didn't request this, you can safely ignore this email — your password won't change.`,
    html: `
      <div style="font-family: -apple-system, Segoe UI, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #111;">Reset your Finora password</h2>
        <p style="color: #444;">Click the button below to choose a new password. This link expires shortly for your security.</p>
        <p style="margin: 24px 0;">
          <a href="${url}" style="background: #16a34a; color: #fff; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: 600;">
            Reset password
          </a>
        </p>
        <p style="color: #888; font-size: 13px;">If you didn't request this, you can safely ignore this email — your password won't change.</p>
      </div>
    `,
  });
}
