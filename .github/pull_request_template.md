## Summary

Describe the behavior changed and why it improves PrintChum.

## Verification

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm run test:e2e`, when browser behavior changed
- [ ] `npm run test:e2e:webmcp`, when WebMCP behavior changed

## Review Checklist

- [ ] The change has focused tests for new or modified behavior.
- [ ] Layout, Canvas, PDF, and print paths still share authoritative domain logic.
- [ ] No customer photos, image data, file names, object URLs, private PDFs, or secrets were added.
- [ ] Tool arguments, results, activity, and telemetry remain privacy-safe.
- [ ] User-facing controls remain keyboard accessible and responsive.
- [ ] New dependencies and their licenses were reviewed.
