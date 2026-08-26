import * as Sentry from "@sentry/nextjs";

// Server-side error monitoring for Node.js runtime routes. No-op until a DSN
// exists, keeping builds and local development free of Sentry wiring.
//
// Server handlers must never log image contents or provider payloads
// (AGENTS.md §6.2); Sentry receives exceptions only.
export async function register(): Promise<void> {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    return;
  }
  Sentry.init({
    dsn,
    environment:
      process.env.SENTRY_ENVIRONMENT ??
      process.env.NEXT_PUBLIC_VERCEL_ENV ??
      process.env.NODE_ENV ??
      "development",
    sendDefaultPii: false,
  });
}

export async function onRequestError(
  ...args: Parameters<typeof Sentry.captureRequestError>
): Promise<void> {
  if (!process.env.SENTRY_DSN) {
    return;
  }
  await Sentry.captureRequestError(...args);
}
