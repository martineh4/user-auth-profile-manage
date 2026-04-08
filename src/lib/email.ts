import nodemailer from "nodemailer";

const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
const FROM = process.env.SMTP_FROM ?? '"AuthProfile" <noreply@authprofile.app>';

async function createTransporter() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }

  // Dev fallback: Ethereal fake SMTP — preview emails at the logged URL
  const testAccount = await nodemailer.createTestAccount();
  console.log("\n📧 Dev SMTP:", testAccount.user, "/", testAccount.pass);
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
}

function emailTemplate(title: string, bodyHtml: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fff5f8;font-family:system-ui,-apple-system,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px">
      <table width="100%" style="max-width:520px;background:#fff;border-radius:12px;border:1px solid #fce7f3;overflow:hidden">
        <tr><td style="background:#db2777;padding:24px 32px;text-align:center">
          <span style="font-size:20px;font-weight:700;color:#fff">AuthProfile</span>
        </td></tr>
        <tr><td style="padding:32px">
          <h2 style="margin:0 0 16px;font-size:20px;color:#111">${title}</h2>
          ${bodyHtml}
          <p style="margin:24px 0 0;font-size:12px;color:#9ca3af">
            If you didn't request this, you can safely ignore this email.
          </p>
        </td></tr>
        <tr><td style="padding:16px 32px;border-top:1px solid #fce7f3;text-align:center">
          <span style="font-size:12px;color:#9ca3af">© ${new Date().getFullYear()} AuthProfile</span>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendVerificationEmail(to: string, token: string) {
  const url = `${BASE_URL}/verify-email?token=${token}`;
  const transport = await createTransporter();

  const info = await transport.sendMail({
    from: FROM,
    to,
    subject: "Verify your email — AuthProfile",
    html: emailTemplate(
      "Verify your email address",
      `<p style="margin:0 0 24px;color:#4b5563;line-height:1.6">
        Thanks for signing up! Click the button below to verify your email address and activate your account.
      </p>
      <a href="${url}" style="display:inline-block;background:#db2777;color:#fff;font-weight:600;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none">
        Verify Email
      </a>
      <p style="margin:16px 0 0;font-size:13px;color:#6b7280">
        Or copy this link: <a href="${url}" style="color:#db2777">${url}</a>
      </p>
      <p style="margin:12px 0 0;font-size:12px;color:#9ca3af">This link expires in 24 hours.</p>`
    ),
  });

  if (process.env.NODE_ENV !== "production") {
    console.log(`\n📧 Verify email preview: ${nodemailer.getTestMessageUrl(info)}`);
    console.log(`🔗 Direct link: ${url}\n`);
  }
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const url = `${BASE_URL}/reset-password?token=${token}`;
  const transport = await createTransporter();

  const info = await transport.sendMail({
    from: FROM,
    to,
    subject: "Reset your password — AuthProfile",
    html: emailTemplate(
      "Reset your password",
      `<p style="margin:0 0 24px;color:#4b5563;line-height:1.6">
        We received a request to reset your password. Click the button below to choose a new one.
      </p>
      <a href="${url}" style="display:inline-block;background:#db2777;color:#fff;font-weight:600;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none">
        Reset Password
      </a>
      <p style="margin:16px 0 0;font-size:13px;color:#6b7280">
        Or copy this link: <a href="${url}" style="color:#db2777">${url}</a>
      </p>
      <p style="margin:12px 0 0;font-size:12px;color:#9ca3af">This link expires in 1 hour.</p>`
    ),
  });

  if (process.env.NODE_ENV !== "production") {
    console.log(`\n📧 Reset email preview: ${nodemailer.getTestMessageUrl(info)}`);
    console.log(`🔗 Direct link: ${url}\n`);
  }
}
