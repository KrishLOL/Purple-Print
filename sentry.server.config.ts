import * as Sentry from "@sentry/nextjs";

// Same DSN as the client config -- Sentry DSNs are meant to be public
// (they're embedded in client-side bundles across the web), so there's no
// separate "secret" server DSN to keep out of source control. Set
// NEXT_PUBLIC_SENTRY_DSN in .env / Vercel to actually start reporting --
// with it unset, init() below no-ops and nothing is sent anywhere.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  tracesSampleRate: 0.1,
});
