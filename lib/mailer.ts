import nodemailer from "nodemailer";
import type { NodemailerConfig } from "next-auth/providers/nodemailer";
import { getSiteUrl } from "@/lib/site";
import { prisma } from "@/lib/db";

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
  // The email links to our own /auth/confirm page rather than straight to
  // Auth.js's callback URL, which is a single-use, sign-in-completing GET
  // request. Institutional email (uwo.ca runs on Microsoft 365) commonly
  // scans/rewrites links in incoming mail before the user ever opens the
  // message, silently consuming that token.
  //
  // The real URL is stored server-side and referenced by an opaque id
  // (NOT passed as a `?url=` query param) — several mail security
  // scanners specifically detect and auto-follow redirect-shaped
  // parameters like that as an anti-phishing measure, which would defeat
  // this the same way a bare link did. See PendingMagicLink in the schema.
  const pending = await prisma.pendingMagicLink.create({ data: { targetUrl: url } });
  const confirmUrl = `${getSiteUrl()}/auth/confirm?id=${pending.id}`;

  if (process.env.NODE_ENV !== "production") {
    console.log(`\n[dev] Magic sign-in link for ${email}:\n${confirmUrl}\n`);
    return;
  }

  const transport = nodemailer.createTransport(provider.server);
  await transport.sendMail({
    to: email,
    from: provider.from,
    subject: "Sign in to Purpleprint",
    text: `Sign in to Purpleprint by opening this link:\n${confirmUrl}\n\nIf you didn't request this, you can ignore this email.`,
    html: `<p>Sign in to Purpleprint by opening this link:</p><p><a href="${confirmUrl}">${confirmUrl}</a></p><p>If you didn't request this, you can ignore this email.</p>`,
  });
}
