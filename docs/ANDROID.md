# Android (Capacitor)

1. Install deps (once): `npm install`
2. Build web assets, then sync: `npm run build` then `npx cap sync android` (legacy HTML lives in `public/quran_chapters/`)
3. Open Android Studio → **File → Open** → select the **`android`** folder (not the repo root).
4. Run the app on a device or emulator.

**minSdk:** 22 (Android 5.1) — set in `android/variables.gradle`.

**AI chat:** Uses `https://quranf.netlify.app/.netlify/functions/gemini` inside the app (localhost would not work).

If `npm install` fails on a cloud-sync path, run it from a short path like `C:\dev\Quran` or copy `node_modules` from a machine where install worked.
