# Issue 11 verification and accessibility plan

**Goal:** Verify existing work and account/public evidence, then fix reproduced accessibility defects without changing business claims or production.

**Architecture:** Preserve the static build and current production branch as the base. Keep PR #12 in a separate review worktree and PR #9 untouched. Use existing first-party accounts only when exposed through authorised tools; record unavailable access rather than inferring account state from search results.

**Spec:** GitHub Issue #11, its latest owner comment and the current user request.

**Constraints:** No merges, production deployments, DNS/account changes, paid services, invented operational facts, private addresses or lead activation.

1. Read Issue #11/comments, review PR #12 diff and rerun its 42 tests. Record its exact head and green CI.
2. Check available signed-in browser/connectors, public HTTPS/HTTP/host variants, all 49 sitemap pages, robots, metadata, JSON-LD and error status. Distinguish transport failures from page defects and indexing from indexability.
3. Reproduce shared logo accessible-name mismatch and focusable hidden rotating WhatsApp link in isolated Chrome/axe tests. Write Node regression tests against generated markup and the real topbar controller before changing code.
4. In `lib/layout.mjs`, let visible logo text supply the accessible name and append hidden home context. In `src/assets/js/main.js`, make inactive topbar items inert, restore them outside rotation, and keep the focused item visible. Preserve CSS and destinations.
5. Add `scripts/accessibility.test.mjs` to `npm run check`. Run it failing before the fix and passing after; rerun Chrome/axe with settled animations, mobile navigation, chatbot and manual form/PDF handoffs without sending enquiries. Check PR #12 booking/FAQ in its existing preview, with no branch changes.
6. Document every C01–C25 backlog item's actual state, exact account-access limits, pending operational facts and a bounded approval table. Prepare, but do not apply, HTTPS/canonical-host account corrections if live responses confirm they are needed.
7. Run the complete suite, inspect the final diff and privacy invariants, push only the new feature branch and prepare a draft PR. Verify its exact-head CI and preserve PR #9/#12 heads and draft state. Stop for independent review.
