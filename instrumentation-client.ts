import * as Sentry from "@sentry/nextjs";

// Client-side error monitoring. Initialized only when a DSN is configured so
// local development and preview builds without credentials stay untouched.
//
// Privacy constraints (AGENTS.md §6, §19): error-only monitoring. Performance
// tracing and session replay are intentionally left disabled because they can
// record layout content, and sendDefaultPii stays off.
// Required by @sentry/nextjs so the SDK can hook App Router transitions.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment:
      process.env.SENTRY_ENVIRONMENT ??
      process.env.NEXT_PUBLIC_VERCEL_ENV ??
      process.env.NODE_ENV ??
      "development",
    sendDefaultPii: false,
    beforeSend(event) {
      // Last-resort privacy guard: drop any event that carries blob or data
      // image references, which would imply customer photo bytes leaked into
      // an error report.
      const serialized = JSON.stringify(event);
      if (serialized.includes("blob:") || serialized.includes("data:image")) {
        return null;
      }
      return event;
    },
  });
}
