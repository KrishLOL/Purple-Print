import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { VerifyCodeForm } from "@/components/auth/verify-code-form";

export const metadata: Metadata = { title: "Enter your code" };

export default async function VerifyCodePage() {
  const email = (await cookies()).get("pending-signin-email")?.value;
  if (!email) redirect("/auth/signin");

  return (
    <main className="mx-auto flex max-w-sm flex-1 flex-col justify-center px-4 py-16 text-center sm:px-8">
      <h1 className="text-2xl font-semibold">Enter your code</h1>
      <p className="mt-2 text-sm text-text-muted">
        We sent a 6-digit code to <span className="font-num">{email}</span>. It expires in 15
        minutes.
      </p>
      <VerifyCodeForm />
    </main>
  );
}
