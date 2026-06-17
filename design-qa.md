**Findings**
- [P0] Protected admin screen could not be visually compared against the supplied reference.
  Location: `/admin`.
  Evidence: source visual truth is `/var/folders/mr/42zm75xj0sq65jwx7t9xxl_m0000gn/T/codex-clipboard-2f050c23-6de2-48d9-9e34-9d07f61d6e9e.png`; implementation access at `http://localhost:5174/admin` redirected to `/login` because no authenticated admin token and live admin API data were available in the browser session. Screenshot evidence: `/private/tmp/woice-admin-redirect-login.png`.
  Impact: layout fidelity for the data-backed admin dashboard cannot be truthfully certified from the protected route in this environment.
  Fix: verify with a seeded admin account and running backend connected to MongoDB, then compare `/admin`, `/admin/businesses`, and `/admin/businesses/:businessId` against the reference layout.

**Open Questions**
- Whether the production/staging database already has an existing user to promote as the first admin.
- Whether public routes should remain available for suspended accounts long-term; V1 intentionally leaves them unchanged per request.

**Implementation Checklist**
- Run `npm run promote:admin -- --email=admin@example.com` from `server` for an existing internal user.
- Start backend with the intended MongoDB environment.
- Log in as the promoted admin and inspect `/admin`, `/admin/businesses`, and a business detail page.
- Confirm mobile drawer and wide tables do not overflow at phone viewport sizes.

**Follow-up Polish**
- Add authenticated visual screenshots once an admin seed account is available.

source visual truth path: `/var/folders/mr/42zm75xj0sq65jwx7t9xxl_m0000gn/T/codex-clipboard-2f050c23-6de2-48d9-9e34-9d07f61d6e9e.png`
implementation screenshot path: `/private/tmp/woice-admin-redirect-login.png`
viewport: default in-app browser viewport
state: unauthenticated admin route redirect
full-view comparison evidence: blocked by protected route and unavailable authenticated admin API data
focused region comparison evidence: not available because the protected admin screen could not be reached
patches made since previous QA pass: implemented Admin Dashboard V1 routes, API client, layout, admin pages, role auth, suspension flow, and admin backend endpoints
final result: blocked
