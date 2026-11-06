# Amanah Center — Modular Patient Management

This site provides eight HTML entry points (root plus seven screens), nine ordered shared JavaScript files, CSS and local WOFF2 fonts. It is still a static Vercel app with its original cloud sync and security.

Source pages: src/pages/index.html, src/pages/dashboard/index.html, src/pages/patients/index.html, src/pages/patient/index.html, src/pages/new-visit/index.html, src/pages/appointments/index.html, src/pages/accounts/index.html, src/pages/settings/index.html.

All screens use shared files in src/scripts/core.js, src/scripts/pages/, src/scripts/ui.js and src/styles/app.css. Web fonts live in src/assets/fonts/. The original API, pricing, cloud sync and readability files remain unchanged.

To build: npm ci && npm run build. The build outputs all page entry points and shared assets to public/. Direct page links and browser back/forward are supported.

The clinic data key remains amanah_clinic_clean_v2. The cloud client continues to handle sign-in and server data. No patient records are changed at build time.

Run npm run test:reminders for existing appointment regression tests. Do not use real patient data during tests.
