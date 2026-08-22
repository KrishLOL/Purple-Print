import NextAuth from "next-auth";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import Nodemailer from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { sendSignInCodeEmail } from "@/lib/mailer";
import { isRateLimited } from "@/lib/rate-limit";
import { emailDomain, hashEmail } from "@/lib/anonymize";

const UWO_DOMAIN = "uwo.ca";
const CODE_SEND_MAX_PER_IP = 5;
const CODE_SEND_WINDOW_MS = 15 * 60 * 1000;

function isUwoEmail(email: string | null | undefined): email is string {
  return Boolean(email && email.toLowerCase().endsWith(`@${UWO_DOMAIN}`));
}

// The Prisma adapter only ever sends the standard AdapterUser shape
// ({ email, emailVerified, ... }) to createUser — it has no idea about our
// emailHash/emailDomain columns, which are required (and derived from
// email, so always computable). Wrap createUser to fill them in.
const baseAdapter = PrismaAdapter(prisma);
const adapter: Adapter = {
  ...baseAdapter,
  async createUser(user: Omit<AdapterUser, "id">) {
    const email = user.email.toLowerCase();
    return baseAdapter.createUser!({
      ...user,
      email,
      emailHash: hashEmail(email),
      emailDomain: emailDomain(email),
      // The base adapter destructures `id` back out and lets Prisma's
      // @default(cuid()) generate it — this cast just satisfies the
      // AdapterUser-shaped signature.
    } as unknown as AdapterUser);
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter,
  session: { strategy: "database" },
  pages: {
    signIn: "/auth/signin",
    // The user never actually lands here via a redirect — sendSignInCodeEmail
    // (lib/mailer.ts) sends a code instead of a link, and app/auth/actions.ts
    // sets its own pending-signin-email cookie and points people at
    // /auth/verify-code directly. This still has to point somewhere valid
    // for Auth.js's internal typing/config, but functionally it's unused.
    verifyRequest: "/auth/verify-code",
    error: "/auth/error",
    newUser: "/onboarding",
  },
  providers: [
    // Still the Nodemailer/Email provider under the hood — it's what
    // generates and validates the real single-use verification token.
    // sendVerificationRequest just doesn't email that token/URL directly
    // (see lib/mailer.ts for why); the token gets redeemed via a
    // server-to-server fetch once the user enters the code that stands in
    // for it (see verifySignInCode in app/auth/actions.ts).
    Nodemailer({
      from: process.env.AUTH_EMAIL_FROM,
      server: process.env.AUTH_EMAIL_SERVER,
      async sendVerificationRequest(params) {
        const ip = params.request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
        if (isRateLimited(`code-send:${ip}`, CODE_SEND_MAX_PER_IP, CODE_SEND_WINDOW_MS)) {
          throw new Error("Too many sign-in requests from this network. Try again in a few minutes.");
        }
        await sendSignInCodeEmail(params);
      },
    }),
  ],
  callbacks: {
    // Runs before the sign-in code is sent (verificationRequest phase) AND
    // again when the code is redeemed server-to-server — rejecting
    // non-@uwo.ca addresses here means the email is never even dispatched.
    async signIn({ user }) {
      if (!isUwoEmail(user.email)) {
        return "/auth/error?reason=domain";
      }
      if (user.isBanned) {
        return "/auth/error?reason=banned";
      }
      return true;
    },
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.role = user.role ?? "STUDENT";
      session.user.disciplineId = user.disciplineId ?? null;
      session.user.gradYear = user.gradYear ?? null;
      session.user.hasOnboarded = user.hasOnboarded ?? false;
      session.user.isBanned = user.isBanned ?? false;
      return session;
    },
  },
});
