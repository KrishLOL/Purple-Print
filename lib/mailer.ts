import crypto from "node:crypto";
import nodemailer from "nodemailer";
import type { NodemailerConfig } from "next-auth/providers/nodemailer";
import { prisma } from "@/lib/db";

type SendVerificationRequestParams = Parameters<NodemailerConfig["sendVerificationRequest"]>[0];

const CODE_LENGTH = 6;
const CODE_MAX_AGE_MS = 15 * 60 * 1000;

function generateCode(): string {
  return String(crypto.randomInt(0, 10 ** CODE_LENGTH)).padStart(CODE_LENGTH, "0");
}

/** Peppered with AUTH_SECRET so a database-only leak doesn't hand over usable codes directly. */
function hashCode(code: string, email: string): string {
  return crypto.createHash("sha256").update(`${code}:${email}:${process.env.AUTH_SECRET}`).digest("hex");
}

/**
 * Emails a 6-digit sign-in code instead of a magic link.
 *
 * Three link-based approaches (a plain magic link, one gated behind a
 * confirm-page click, then one behind an opaque id instead of a `?url=`
 * param) were each defeated in turn — confirmed live, step by step
 * against the database — by whatever scans uwo.ca mail (Microsoft 365/
 * Defender): the real token was being consumed at mail-delivery time,
 * before the user had even opened the message, regardless of how the
 * link was shaped. A link is fundamentally the wrong primitive for this
 * inbox: anything reachable by an HTTP GET can be visited by something
 * other than the user.
 *
 * A code has no such surface. It isn't a URL, isn't clickable, and can
 * only be "used" by a human reading it out of the email and typing it
 * into /auth/verify-code, which looks it up, checks it server-side, and
 * only then fetches the real (still fully Auth.js-generated and
 * -validated) callback URL itself — see verifySignInCode in
 * app/auth/actions.ts.
 */
export async function sendSignInCodeEmail({
  identifier: email,
  url,
  provider,
}: SendVerificationRequestParams) {
  const code = generateCode();
  const isProduction = process.env.NODE_ENV === "production";

  // Only one live code per email at a time, so there's never ambiguity
  // about which one is current.
  await prisma.signInCode.deleteMany({ where: { email } });
  await prisma.signInCode.create({
    data: {
      email,
      codeHash: hashCode(code, email),
      targetUrl: url,
      expires: new Date(Date.now() + CODE_MAX_AGE_MS),
      // Dev/test only -- see the devCode field's comment in schema.prisma.
      devCode: isProduction ? null : code,
    },
  });

  if (!isProduction) {
    console.log(`\n[dev] Sign-in code for ${email}: ${code}\n`);
    return;
  }

  const transport = nodemailer.createTransport(provider.server);
  await transport.sendMail({
    to: email,
    from: provider.from,
    subject: "Your Purpleprint sign-in code",
    text: `Your Purpleprint sign-in code is: ${code}\n\nEnter it at the sign-in page. It expires in 15 minutes.\n\nIf you didn't request this, you can ignore this email.`,
    html: `<p>Your Purpleprint sign-in code is:</p><p style="font-size:28px;font-weight:bold;letter-spacing:4px;">${code}</p><p>Enter it at the sign-in page. It expires in 15 minutes.</p><p>If you didn't request this, you can ignore this email.</p>`,
  });
}
