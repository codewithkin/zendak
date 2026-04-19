import nodemailer from "nodemailer";

import { env } from "@zendak/env/server";
import { type PlanName, PLANS, formatLimit } from "@zendak/plans";

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

export async function sendDriverWelcomeEmail(opts: {
	to: string;
	driverName: string;
	workspaceName: string;
	temporaryPassword: string;
}) {
	const loginUrl = env.CORS_ORIGIN;

	await transporter.sendMail({
		from: `"Zendak" <${env.NOREPLY_SMTP_FROM}>`,
		to: opts.to,
		subject: `Welcome to Zendak — Your driver account is ready`,
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
      <p class="greeting">Welcome, ${opts.driverName}!</p>
      <p class="text">
        You've been added as a driver in the <strong>${opts.workspaceName}</strong> workspace on Zendak, the logistics business control center. You can now view your assigned trips, track deliveries, and stay connected with your operations team.
      </p>
      <div class="creds">
        <div class="creds-row">
          <span class="creds-label">Email</span>
          <span class="creds-value">${opts.to}</span>
        </div>
        <div class="creds-row">
          <span class="creds-label">Password</span>
          <span class="creds-value">${opts.temporaryPassword}</span>
        </div>
      </div>
      <p class="text">
        Sign in below to start. We recommend changing your password after your first login for security.
      </p>
      <a href="${loginUrl}/sign-in" class="btn">Sign in to Zendak</a>
    </div>
    <div class="footer">
      <p>You received this email because you were added as a driver to ${opts.workspaceName} on Zendak. If you believe this was sent in error, contact your administrator.</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
	});
}

export async function sendSubscriptionEmail(opts: {
	to: string;
	recipientName: string;
	planName: PlanName;
}) {
	const plan = PLANS[opts.planName];
	const dashboardUrl = `${env.CORS_ORIGIN}/dashboard/admin`;

	const featuresList = plan.features
		.map((f) => f.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
		.map((f) => `<li style="margin-bottom: 6px; font-size: 13px; color: #18181b;">${f}</li>`)
		.join("");

	await transporter.sendMail({
		from: `"Zendak" <${env.NOREPLY_SMTP_FROM}>`,
		to: opts.to,
		subject: `Subscription confirmed -- ${plan.label} plan`,
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
    .plan-box { background: #f4f4f5; border-radius: 8px; padding: 20px; margin-bottom: 24px; border: 1px solid #e4e4e7; }
    .plan-name { font-size: 18px; font-weight: 700; color: #09090b; margin-bottom: 4px; }
    .plan-price { font-size: 14px; color: #52525b; margin-bottom: 16px; }
    .limits { font-size: 13px; color: #52525b; margin-bottom: 4px; }
    .features-title { font-size: 14px; font-weight: 600; color: #18181b; margin-bottom: 8px; }
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
      <p class="greeting">Thank you for subscribing, ${opts.recipientName}.</p>
      <p class="text">
        Your subscription to the <strong>${plan.label}</strong> plan is now active. Here is a summary of your plan.
      </p>
      <div class="plan-box">
        <div class="plan-name">${plan.label} Plan</div>
        <div class="plan-price">$${plan.price}/month</div>
        <div class="limits">Trucks: ${formatLimit(plan.limits.maxTrucks)}</div>
        <div class="limits">Users: ${formatLimit(plan.limits.maxUsers)}</div>
        <div class="limits">Trips/month: ${formatLimit(plan.limits.maxTripsPerMonth)}</div>
      </div>
      <p class="features-title">Features included:</p>
      <ul style="padding-left: 20px; margin-bottom: 24px;">
        ${featuresList}
      </ul>
      <a href="${dashboardUrl}" class="btn">Go to Dashboard</a>
    </div>
    <div class="footer">
      <p>You received this email because you subscribed to Zendak. If you have questions, contact support.</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
	});
}
