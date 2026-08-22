"use server";

import crypto from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { prisma } from "@/lib/db";
import { parseSetCookie } from "@/lib/cookie-relay";
import { isRateLimited } from "@/lib/rate-limit";

const PENDING_EMAIL_COOKIE = "pending-signin-email";
const PENDING_EMAIL_COOKIE_MAX_AGE = 15 * 60; // seconds, matches the code's own expiry
const MAX_CODE_ATTEMPTS = 5;
const CODE_GUESS_MAX_PER_IP = 20;
const CODE_GUESS_WINDOW_MS = 15 * 60 * 1000;

function hashCode(code: string, email: string): string {
  return crypto.createHash("sha256").update(`${code}:${email}:${process.env.AUTH_SECRET}`).digest("hex");
}

export async function signInWithEmail(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  // Set before calling signIn() so /auth/verify-code knows which email
  // to check a submitted code against, without needing it in the URL.
  (await cookies()).set(PENDING_EMAIL_COOKIE, email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PENDING_EMAIL_COOKIE_MAX_AGE,
  });

  // redirect: false so this returns instead of Auth.js redirecting on its
  // own. Its default success redirect goes to pages.verifyRequest via
  // /api/auth/verify-request — a route that itself 302s onward, which
  // Next's client-side Server Action redirect handling doesn't reliably
  // follow a second hop of (confirmed live: the browser was left sitting
  // on the intermediate /api/auth/verify-request URL rather than reaching
  // /auth/verify-code). Redirecting to our own page directly sidesteps
  // that entirely.
  try {
    await signIn("nodemailer", { email, redirect: false });
  } catch (err) {
    // Only an AuthError here means something genuinely went wrong (e.g.
    // our own per-IP rate limit, or the uwo.ca domain rejection from
    // auth.ts) — signIn() only throws in the redirect:false form when
    // there's a real error, since it's not doing its own redirect.
    if (err instanceof AuthError) {
      redirect(`/auth/error?reason=send-failed`);
    }
    throw err;
  }

  redirect("/auth/verify-code");
}

export type VerifyCodeResult = { ok: false; error: string };

export async function verifySignInCode(formData: FormData): Promise<VerifyCodeResult> {
  const code = String(formData.get("code") ?? "").trim();
  const email = (await cookies()).get(PENDING_EMAIL_COOKIE)?.value;

  if (!email) {
    redirect("/auth/signin");
  }

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(`code-guess:${ip}`, CODE_GUESS_MAX_PER_IP, CODE_GUESS_WINDOW_MS)) {
    return { ok: false, error: "Too many attempts from this network. Try again in a few minutes." };
  }

  const pending = await prisma.signInCode.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });

  if (!pending || pending.expires < new Date()) {
    return { ok: false, error: "That code has expired. Request a new one." };
  }

  if (pending.codeHash !== hashCode(code, email)) {
    const attempts = pending.attempts + 1;
    if (attempts >= MAX_CODE_ATTEMPTS) {
      await prisma.signInCode.delete({ where: { id: pending.id } });
      return { ok: false, error: "Too many incorrect attempts. Request a new code." };
    }
    await prisma.signInCode.update({ where: { id: pending.id }, data: { attempts } });
    return { ok: false, error: `Incorrect code. ${MAX_CODE_ATTEMPTS - attempts} attempt(s) left.` };
  }

  // Correct code, single use.
  await prisma.signInCode.delete({ where: { id: pending.id } });

  // The code only ever unlocks the real, still fully Auth.js-generated
  // and -validated magic-link URL — fetched here server-to-server so no
  // link is ever exposed to the user's browser or the email itself. This
  // request runs Auth.js's normal callback handling (token validation,
  // the signIn callback's domain/ban gating, adapter user/session
  // creation) exactly as a real click on that link would.
  const response = await fetch(pending.targetUrl, { redirect: "manual" });

  const jar = await cookies();
  for (const raw of response.headers.getSetCookie()) {
    const parsed = parseSetCookie(raw);
    if (parsed) jar.set(parsed.name, parsed.value, parsed.options);
  }
  jar.delete(PENDING_EMAIL_COOKIE);

  const location = response.headers.get("location");
  redirect(location && location.startsWith("/") ? location : "/me");
}

export async function resendSignInCode() {
  const email = (await cookies()).get(PENDING_EMAIL_COOKIE)?.value;
  if (!email) redirect("/auth/signin");

  const formData = new FormData();
  formData.set("email", email);
  await signInWithEmail(formData);
}
