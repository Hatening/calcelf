# CalcElf v3.2 — age-adaptive UI polish

- Primary 1–3 now uses a rounded display font (Fredoka) + Nunito body text.
- Primary 1–3 cards, controls, upload area, pills, messages and stats are intentionally rounder and warmer.
- Primary 3–6 gets a softer but still structured rounded treatment.
- Middle 1–2 and Grade 9–12 retain crisp Inter-style typography and more restrained geometry.
- Added Google Fonts preload links for Fredoka/Nunito; system fallbacks remain in place.

# CalcElf v3.1 — Language selector fix

## Fixed
- Selecting a language now immediately updates the top-right language label (for example `EN` → `中文`).
- The language menu closes immediately after a language is selected.
- Fixed a JavaScript runtime error caused by the UI using `styleSummary` while `applyLang()` referenced the non-existent `styleDesc` element.
- Language switching now uses safe DOM setters so one missing optional UI element cannot interrupt the rest of the language update.
- Added translated learning-stage and account-role option labels.
- Added `aria-haspopup`, `aria-expanded`, `role="menu"`, and active-language state handling.
- Added reliable close behavior for outside clicks and the `Escape` key.

## Files updated
- `index.html`
- `app.js`
- `public/index.html`
- `public/app.js`

Both root and `public/` copies are kept synchronized so deployment does not accidentally use a stale version.
