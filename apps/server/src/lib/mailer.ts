import nodemailer from "nodemailer";

import { env } from "@zendak/env/server";

const transporter = nodemailer.createTransport({
	host: env.NOREPLY_SMTP_HOST,
	port: env.NOREPLY_SMTP_PORT,
	secure: env.NOREPLY_SMTP_PORT === 465,
	auth: {
		user: env.NOREPLY_SMTP_USER,
		pass: env.NOREPLY_SMTP_PASS,
	},
});

export async function sendInviteEmail(opts: {
	to: string;
	recipientName: string;
	adminName: string;
	workspaceName: string;
	temporaryPassword: string;
}) {
	const loginUrl = env.CORS_ORIGIN;

	await transporter.sendMail({
		from: `"Zendak" <${env.NOREPLY_SMTP_FROM}>`,
		to: opts.to,
		subject: `You've been invited to ${opts.workspaceName} on Zendak`,
		html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4f4f5; margin: 0; padding: 0; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e4e4e7; }
    .header { background: #09090b; padding: 32px; text-align: center; }
    .header span { color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
    .body { padding: 32px; }
    .greeting { font-size: 16px; color: #18181b; font-weight: 600; margin-bottom: 12px; }
    .text { font-size: 14px; color: #52525b; line-height: 1.6; margin-bottom: 20px; }
    .creds { background: #f4f4f5; border-radius: 8px; padding: 20px; margin-bottom: 24px; border: 1px solid #e4e4e7; }
    .creds-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
    .creds-label { color: #71717a; }
    .creds-value { color: #09090b; font-weight: 600; font-family: monospace; }
    .btn { display: inline-block; background: #09090b; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; }
    .footer { padding: 24px 32px; border-top: 1px solid #f4f4f5; }
    .footer p { font-size: 12px; color: #a1a1aa; margin: 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <span>Zendak</span>
    </div>
    <div class="body">
      <p class="greeting">Hi ${opts.recipientName},</p>
      <p class="text">
        <strong>${opts.adminName}</strong> has invited you to join the
        <strong>${opts.workspaceName}</strong> workspace on Zendak — a logistics business control center.
      </p>
      <div class="creds">
        <div class="creds-row">
          <span class="creds-label">Email</span>
          <span class="creds-value">${opts.to}</span>
        </div>
        <div class="creds-row">
          <span class="creds-label">Temporary password</span>
          <span class="creds-value">${opts.temporaryPassword}</span>
        </div>
      </div>
      <p class="text">
        Use the credentials above to sign in. We recommend changing your password after your first login.
      </p>
      <a href="${loginUrl}/sign-in" class="btn">Sign in to Zendak</a>
    </div>
    <div class="footer">
      <p>You received this email because you were invited to join ${opts.workspaceName} on Zendak. If you believe this was sent in error, you can ignore it.</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
	});
}
