import * as Sentry from "@sentry/nextjs";

// Runtime-specific Sentry.init() calls are split into separate files since
// the Node and Edge runtimes can't share config (e.g. Node-only integrations
// would break the Edge bundle) -- Next.js only ever loads one of these per
// server process, selected by NEXT_RUNTIME.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
