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

## Hijri calendar source

Amanah's *current Bangladesh Hijri date* is fetched via `api/hijri.js` from [iHadis Bangladesh calendar](https://ihadis.com/en/calendar/bangladesh/islamic-date-today), validated against the Gregorian date in `Asia/Dhaka`, and refreshed on the client. Never substitute another site's date if iHadis is unavailable: current date is hidden with a source-unavailable indication. Future Sunnah dates are labelled estimates anchored to the last verified iHadis date, subject to local moon sighting. Run `node tests/hijri.cjs` for parser tests and `node tests/modular.cjs` for UI tests.
