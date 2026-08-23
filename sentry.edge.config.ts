import * as Sentry from "@sentry/nextjs";

// See sentry.server.config.ts -- same reasoning, split only because the
// Node and Edge runtimes can't share one Sentry.init() config.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  tracesSampleRate: 0.1,
});
