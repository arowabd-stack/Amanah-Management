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

## Phonetic Bengali patient-name entry

The patient name fields in new visit, patient edit, and new appointment forms now support live English-to-Bangla phonetic typing. A small toggle below each field can temporarily keep English typing. Typing correction, backspace, paste, Unicode Bengali editing and the existing saved-patient data flow remain supported.

The implementation uses @subhesadek/avro-phonetic v2.1.4 (MPL-2.0, https://github.com/SubheSadek/avro-phonetic), bundled locally with esbuild. It includes common Bengali patient-name spellings. This is an independent Avro-style integration; it does not copy Ridmik's proprietary APK code. The MPL-2.0 license text is included in the deployment at /licenses/avro-phonetic-MPL-2.0.txt; the upstream source is openly available at the link above. apps.zip is neither deployed nor committed.

Build: npm ci && npm run build. The source lives in src/scripts/name-phonetic-entry.mjs, the CSS in src/styles/name-phonetic.css. Run node tests/modular.cjs and npm run test:reminders before release.
