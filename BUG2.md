# Bug #2 report — tab/page reverting after browser-back navigation

## Symptom
After navigating away from `/tests` (to a test's `take` or `results` page) and then using the **browser's own back button** to return, the URL in the address bar shows the correct `tab`/page params — but the **rendered page** shows a different tab/page than the URL says. Gets worse with repeated back-navigations across multiple tab/page combinations (confirmed in a later repro: after several hops between available/completed tabs at different pages, the displayed tab lagged the URL by one or more steps back).

## Confirmed repro (detailed version)
1. Tab 2 (completed) page 3 → URL correct.
2. Click a test → `/tests/103/results`.
3. Browser back → URL correctly shows `passed_page=3&tab=completed`, but **rendered page shows available tab, page 10** (a completely different state from an earlier point in the session).
4. Switch to available tab page 13 → click test → `/tests/192/take`.
5. Browser back → URL shows `available_page=13&tab=available` — this one lands correctly.
6. Switch to completed tab page 4 → click test → `/tests/159/results`.
7. Browser back → URL shows `passed_page=4&tab=completed`, but **rendered page is back to available tab page 13** (the previous step's state, not this one's).

So it's not simply "always wrong" or "always one step behind" — inconsistent, which suggests cached component/page instances being reused unpredictably by Inertia's history restoration, not a single simple off-by-one.

## What's ruled out
- **Not the same mechanism as bug #1.** Bug #1 (flash message reappearing) was fixed via a `flash.message` vs `flash.success` field mismatch — unrelated to this.
- **Not the pagination `tab`-param-dropping bug** (the `withQueryString()` fix applied earlier to `TestAttemptRepository`) — that one's already fixed and confirmed working; URLs are shown to be correct in every step of this repro, only the rendered content is wrong.

## Leading theory (unconfirmed)
Two pieces of state in `Index.tsx` — `activeTab` and (implicitly) which page of data is "current" — are **local component state**, seeded once from props and only explicitly re-synced for `activeTab` via:

```tsx
useEffect(() => {
    setActiveTab(active_tab);
}, [active_tab]);
```

When Inertia restores a cached page from history (back button), it may be reusing an existing mounted component instance with stale props, or remounting with props that don't trigger this effect the way a normal navigation would — Inertia's history-cache behavior for component reuse vs. remount wasn't actually verified, only guessed at.

## Open questions, not yet answered
1. **Does `Test/Take.tsx` have a "back to tests" link that hardcodes a tab** (like `Result.tsx` does with `tab: 'completed'`)? Never got the file to check. This was flagged as a possible contributing factor but not confirmed or ruled out.
2. **Is Inertia reusing component instances across history restoration**, or fully remounting? This determines whether the fix is "sync more state from props" (if reused) or something else entirely (if remounting should already work but doesn't for some other reason).
3. Should check Inertia's own history/scroll-preservation docs for `only`/partial-reload interactions with back/forward — the `only: [...]` partial-reload option used in `handleTabChange` might interact with what gets cached per history entry in a way that's relevant here.

## Files already in hand (no need to re-request)
- `Index.tsx` (current, post bug-#1-fix version)
- `TestCard.tsx`
- `Pagination.tsx`
- `TestAttemptRepository.php`
- `TestController.php`
- `AuthenticatedLayout.tsx`

## File still needed
- `Test/Take.tsx` — never received, relevant to open question #1 above.

That's everything solid so far — nothing further was tested or concluded beyond what's listed above.