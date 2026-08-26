import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const playwrightCli = path.join(
  repositoryRoot,
  "node_modules",
  "playwright",
  "cli.js",
);
const result = spawnSync(
  process.execPath,
  [playwrightCli, "test", "tests/e2e/webmcp-tools.spec.ts"],
  {
    env: { ...process.env, WEBMCP_E2E: "1" },
    stdio: "inherit",
  },
);

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
