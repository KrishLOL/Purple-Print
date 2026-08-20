/** Swap NEXT_PUBLIC_SITE_URL for the real domain before deploying — see .env.example. */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
