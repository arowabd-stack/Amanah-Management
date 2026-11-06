# Appointment reminder verification

Verified on 6 November 2026 using Chromium and Playwright 1.65.0.

Run:

```sh
npm ci
npx playwright install --with-deps chromium
npm run test:reminders
```

The suite builds the deployed HTML and runs 23 browser cases. Every request is intercepted: session and clinic responses use synthetic in-memory records, assets come from `public`, and third-party CDN requests receive empty responses. The suite never sends requests or writes to the production clinic or its patient records. Screenshots and JSON results go to `/tmp/amanah-reminder-qa` (override with `QA_ARTIFACTS`).

Coverage:

- For 7 November 2026 at 10:00 Bangladesh time, evening mode starts at 6 November 20:00 and 12-hour mode at 22:00. Checks include the second before each boundary.
- Identical behavior in Asia/Dhaka, UTC and America/New_York browser timezones.
- Midnight, month/year rollover, leap day, missing time, invalid date, cancellation/completion, and expiry at the end of the appointment day.
- Minute timer updates without navigation; unread clearing and persistence after reload and a cloud polling response; reminders arriving while the panel is open.
- Bell/panel geometry and exact appointment/patient navigation at 375, 600, 700, 768, 860, 861, 1024 and 1440 CSS pixels.
- Bell survives route renders and viewport changes across dashboard, patients, appointments, accounts and settings.
- Unregistered appointments have no unrelated patient-file link.
- Settings PUT/GET round trip, persisted 12-hour mode, incoming mode changes, rescheduling, linked-patient changes and cancellation. Patient fixture contents stay unchanged.

Three reproduced issues were fixed in `public/cloud.js`:

1. A reminder appearing in an already open, visible panel incorrectly remained unread. Newly displayed reminders now become read, and unchanged seen state is not rewritten every minute.
2. At tablet widths the fixed Bell overlapped the header action. The mobile/tablet header now reserves room for it.
3. The accounts page's desktop panel extended outside the viewport. Panel positioning now clamps to the viewport and updates on resize and route changes.

Final result: **23 passed, 0 failed**, with no browser runtime errors. Build, JavaScript syntax and whitespace checks pass.

Limit: cloud operations above verify the actual browser sync client against an intercepted API contract. They do not prove an authenticated production session or persistence in Vercel Blob. The live site has Vercel SSO protection; deployed static files were retrieved through the authorized Vercel connection and matched the source build before testing. No production clinic API state was read or changed. These are browser viewport tests, not physical-device tests. Background push is not implemented by this change.
