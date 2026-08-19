import nodemailer from "nodemailer";
import type { NodemailerConfig } from "next-auth/providers/nodemailer";

type SendVerificationRequestParams = Parameters<NodemailerConfig["sendVerificationRequest"]>[0];

/**
 * Sends the magic-link email. In development (no real SMTP server to talk
 * to — this project deliberately has no mail-catcher/Docker dependency),
 * the link is logged to the server console instead so the auth flow stays
 * fully testable. Swap in a real transactional-email provider before
 * deploying — see .env.example.
 */
export async function sendMagicLinkEmail({
  identifier: email,
  url,
  provider,
}: SendVerificationRequestParams) {
  if (process.env.NODE_ENV !== "production") {
    console.log(`\n[dev] Magic sign-in link for ${email}:\n${url}\n`);
    return;
  }

  const transport = nodemailer.createTransport(provider.server);
  await transport.sendMail({
    to: email,
    from: provider.from,
    subject: "Sign in to Western Eng Insider",
    text: `Sign in to Western Eng Insider by opening this link:\n${url}\n\nIf you didn't request this, you can ignore this email.`,
    html: `<p>Sign in to Western Eng Insider by opening this link:</p><p><a href="${url}">${url}</a></p><p>If you didn't request this, you can ignore this email.</p>`,
  });
}
