"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export async function signInWithEmail(formData: FormData) {
  try {
    await signIn("nodemailer", formData);
  } catch (err) {
    // signIn() throws Next's internal redirect signal on success — only an
    // AuthError here means something genuinely went wrong (e.g. our own
    // per-IP rate limit, or the uwo.ca domain rejection from auth.ts).
    if (err instanceof AuthError) {
      redirect(`/auth/error?reason=send-failed`);
    }
    throw err;
  }
}
