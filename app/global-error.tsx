"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

// Root error boundary for the App Router. Reports the exception and shows a
// user-readable message without internals (AGENTS.md §18).
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          alignItems: "center",
          display: "flex",
          fontFamily: "system-ui, sans-serif",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <main style={{ maxWidth: "24rem", textAlign: "center" }}>
          <p style={{ fontWeight: 600 }}>Something went wrong</p>
          <p style={{ color: "#555", marginTop: "0.5rem" }}>
            An unexpected error occurred. Your photos were never uploaded.
          </p>
          <button
            onClick={reset}
            style={{
              cursor: "pointer",
              marginTop: "1rem",
              padding: "0.5rem 1rem",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
