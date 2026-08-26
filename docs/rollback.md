# Rollback Runbook

Applies to the PrintChum production deployment on Vercel (Git integration,
production branch). Read this before deploying, not during an incident.

## Trigger Conditions

Roll back immediately when any of these occur after a deploy:

- Sentry error rate exceeds 2x the pre-deploy baseline for 15 minutes.
- User-reported breakage of a critical flow: upload, layout preview, PDF
  export, or print.
- Any evidence that customer photo data left the browser (privacy rule,
  AGENTS.md §6) — treat as a security incident, roll back first, investigate
  after.
- A security vulnerability is disclosed in a shipped dependency.

Advance/hold thresholds for gradual rollouts follow the shipping-and-launch
skill decision table.

## Rollback Steps

### 1. Instant rollback via Vercel (primary path, < 1 minute)

1. Open the Vercel dashboard → PrintChum production project → Deployments.
2. Locate the last known-good deployment (verified healthy before the current
   deploy started).
3. Use **Promote to Production** / **Instant Rollback** on that deployment.

Vercel serves the previous build immediately; no rebuild occurs.

### 2. Feature-flag disable (no rollback needed, < 5 minutes)

WebMCP agent tools can be disabled without reverting code:

1. Set `NEXT_PUBLIC_WEBMCP_ENABLED=false` in Vercel project environment
   variables (Production).
2. Redeploy (any deployment from the same commit re-reads the variable at
   build time).

The badge then reports "Agent tools are turned off" instead of registering
tools.

### 3. Revert commit (fallback, < 10 minutes)

Use only when instant rollback is unavailable or the bad change must be
removed from history:

```powershell
git revert --no-edit <commit>
git push origin main
```

Vercel's Git integration builds and promotes automatically. Verify the new
deployment health before closing the incident.

## Post-Rollback Verification

1. Load `/` and `/editor` in a browser; confirm the workspace renders.
2. Confirm Sentry shows error volume returning to baseline.
3. Run through one critical flow manually: upload → crop → add size → PDF.
4. Record the incident trigger, action taken, and time-to-recovery.

## Data Considerations

- The app currently persists no customer photos and has no database
  migrations; rollback cannot lose customer data by design.
- Saved presets/service sets are session-only until Phase 6 lands, so there is
  nothing to migrate back.
- When Supabase migrations are introduced, every forward migration added here
  must ship with its documented rollback before it reaches production, and
  this section must be updated per release.

## Monitoring References

- Client errors: `instrumentation-client.ts` (Sentry, active when
  `NEXT_PUBLIC_SENTRY_DSN` is set)
- Server errors: `instrumentation.ts`
- Health probe: `GET /` returning 200 (static route until API routes exist)
