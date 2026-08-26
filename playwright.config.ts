import { defineConfig, devices } from "@playwright/test";

// WEBMCP_E2E=1 opts into WebMCP tool coverage. The feature flag name mirrors
// chrome://flags/#enable-webmcp-testing; verify it against the flags entry if
// tools are not discovered. The spec skips gracefully when the API is absent.
const webmcpE2eEnabled = process.env.WEBMCP_E2E === "1";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    ...(webmcpE2eEnabled
      ? { launchOptions: { args: ["--enable-features=WebMCPTesting"] } }
      : {}),
  },
  webServer: {
    command: "node node_modules/next/dist/bin/next dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
