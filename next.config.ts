import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

// Baseline headers per the security-and-hardening skill. The CSP allows
// inline scripts/styles because Next.js injects them (theme bootstrap,
// hydration data); upgrade to a nonce-based CSP when auth routes land.
// connect-src must gain the Supabase project origin when Supabase Auth
// is wired up.
const isDev = process.env.NODE_ENV === "development";

const scriptSrc = ["'self'", "'unsafe-inline'"];
if (isDev) {
  // React's dev-mode devtools require eval(); production keeps the strict
  // list. This relaxation never reaches production headers.
  scriptSrc.push("'unsafe-eval'");
}

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src ${scriptSrc.join(" ")}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; "),
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    // tools=(self) explicitly allows WebMCP agent tool registration on this
    // origin. The spec default is already 'self' for top-level pages, but
    // stating it here pins that behavior against future default changes and
    // documents intent. camera/mic/geolocation stay fully denied.
    value: "camera=(), microphone=(), geolocation=(), tools=(self)",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

// The Sentry wrapper only activates once a DSN is configured so local and CI
// builds stay byte-identical to an unwrapped build. With credentials present it
// enables source-map upload; without SENTRY_AUTH_TOKEN the upload step is
// skipped instead of failing the deploy.
const sentryEnabled =
  Boolean(process.env.SENTRY_DSN) || Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);

export default sentryEnabled
  ? withSentryConfig(nextConfig, {
      silent: true,
      sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
    })
  : nextConfig;
