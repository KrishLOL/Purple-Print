"use client";

import { useState, useTransition } from "react";
import { verifySignInCode, resendSignInCode } from "@/app/auth/actions";

export function VerifyCodeForm() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [resent, setResent] = useState(false);

  function submit() {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("code", code);
      // On success this redirects and never returns — only a failure
      // ever produces a value here.
      const result = await verifySignInCode(formData);
      setError(result.error);
    });
  }

  return (
    <div className="mt-6">
      <form
        action={submit}
        className="space-y-3"
      >
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={code}
          // Digit-filter before slicing to length, not the other way
          // around — an HTML maxLength attribute would truncate the raw
          // (unfiltered) value first, so pasting e.g. "code: 123456"
          // would keep "code: " and lose the actual digits entirely.
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="123456"
          className="font-num w-full border border-border bg-surface px-3 py-2.5 text-center text-2xl tracking-[0.3em] text-text placeholder:tracking-normal placeholder:text-text-muted focus:border-accent focus:outline-none"
        />
        {error && <p className="text-xs text-bad">{error}</p>}
        <button
          type="submit"
          disabled={isPending || code.length !== 6}
          className="font-num w-full bg-accent px-4 py-2.5 text-xs uppercase tracking-wider text-accent-contrast transition-colors hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Checking…" : "Confirm sign-in"}
        </button>
      </form>
      <button
        type="button"
        onClick={() => {
          setResent(true);
          startTransition(() => resendSignInCode());
        }}
        disabled={isPending || resent}
        className="mt-4 text-xs text-accent underline underline-offset-4 disabled:opacity-50"
      >
        {resent ? "New code sent" : "Didn't get it? Send a new code"}
      </button>
    </div>
  );
}
