# Security Policy

## Supported Versions

Security fixes are applied to the latest version on the `main` branch. Older
commits and unmaintained forks are not guaranteed to receive security updates.

## Reporting a Vulnerability

Please do not report security vulnerabilities in public GitHub issues. Use the
repository's [private security advisory form](https://github.com/rswlljms/printchum/security/advisories/new)
or contact the repository owner through the email address listed in the GitHub
profile. Include:

- A concise description of the issue
- Reproduction steps or a minimal proof of concept
- The affected commit, route, component, or dependency
- The potential impact
- Any suggested mitigation

Do not include real customer photos, personal nameplate data, API keys, or
other secrets in a report.

We will acknowledge reports as soon as practical, investigate privately, and
coordinate disclosure after a fix or mitigation is available.

## Privacy-Sensitive Areas

PrintChum is designed to keep customer photos in browser memory by default.
Do not submit or commit:

- Customer photos or generated private PDFs
- File names, object URLs, image hashes, or crop bitmaps
- Customer names or nameplate text
- Authentication tokens, provider keys, webhook secrets, or `.env` files

WebMCP activity history intentionally stores only tool name, outcome, and
timestamp. Tool arguments and results must not be added to telemetry, logs,
persistent browser storage, or server APIs.

## Dependency and Deployment Security

Run `npm audit --audit-level=high` before releases. Review dependency updates,
lockfile changes, install scripts, and third-party licenses before merging.
Production secrets belong in the deployment provider's encrypted environment
variables and must never use a `NEXT_PUBLIC_` prefix unless they are explicitly
public configuration values.
