# Amanah Center — Modular Clinic

Standalone HTML entry points: `/`, `/dashboard/`, `/patients/`, `/patient/?id=<patient-id>`, `/new-visit/`, `/appointments/`, `/accounts/`, `/settings/`.

## Sources

- `src/pages/**/index.html`: independent HTML page entry points with shared shell.
- `src/scripts/core.js`: clinic state, utilities, URL navigation and shared UI.
- `src/scripts/pages/*.js`: dashboard, patient records, visit wizard, print, appointments, accounts and settings.
- `src/scripts/ui.js`: modal helpers and fail-closed login fallback.
- `src/styles/app.css`: shared responsive styles with original embedded WOFF2 font assets.
- `public/cloud.js`, `public/pricing.js`, `public/readability.css`: existing cloud authentication/sync, pricing and readability enhancements.
- `api/`, `lib/`: existing cloud backend and access control.

## Build

`npm ci && npm run build` emits all HTML entry points, JS assets and styles into `public/` for Vercel. Script order is preserved for existing classic-script globals. `public/index.html` is generated, not edited.

`npm run test:reminders` runs isolated appointment regression checks. `node tests/modular.cjs` tests all entry points, browser navigation, patient wizard fields and warnings against synthetic in-memory records.

Existing production data remains under the isolated `amanah_clinic_clean_v2` namespace. Cloud login and storage remain unchanged; this refactor does not migrate or modify patient records. The original single-file HTML is kept as a legacy reference, not used in the build.

## Hijri calendar

The app uses its original browser-based Umm al-Qura Hijri calculation. Settings has an automatic-saving **Hijri date adjustment** from **−2 to +2 days** (default **0**). The adjustment is stored in clinic settings and affects the Dashboard, appointment calendar, Sunnah date highlights and appointment date labels. It does **not** change a patient's Gregorian appointment date.

The former iHadis synchronizer `src/scripts/hijri-live.js` is now intentionally disabled and does not make network requests. The legacy `api/hijri.js` endpoint is unused by the app. Calculated Hijri dates can differ from local moon-sighting announcements; users can adjust the offset in Settings. Regression tests: `node tests/modular.cjs` and `npm run test:reminders`.

## Bengali patient-name typing — user-supplied HTML rules

The phonetic keymap and conversion rules are adapted from the user-provided `index(2).html`. The app uses `src/scripts/phonetic-rules.mjs` for the source's **longest-match token parser**, vowel and consonant maps, conjuncts, Bengali signs, case-sensitive keys, and the original Bengali dictionary/skeleton-based spelling alternatives.

The live name fields `#w_name`, `#ep_name`, and `#ap_name` use `src/scripts/name-phonetic-entry.mjs`. Every item in the suggestion list is rendered **only in Bengali Unicode** — never romanized English. Staff can tap an alternative or select it with Up/Down and Enter. Original spelling is editable, and Backspace, paste, mobile IME, direct Bengali typing and the English-mode toggle remain available. Frequently used personal-name spellings remain as opt-in alternatives and default overrides.

All conversion takes place in the browser; no external transliteration API is called. The source is the user's own web prototype, not source code copied from the Ridmik Android APK. The previous npm phonetic package is retained in the lockfile for now but is no longer imported or used by the active name editor. See `tests/modular.cjs` for Bengali-only suggestions and keymap regression tests.

Build with `npm ci && npm run build`; test with `node tests/modular.cjs` and `npm run test:reminders`.
