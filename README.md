# FietsCheck

**Know the likely fault before you pay.**

FietsCheck is a free web app for cyclists in Groningen. Tap the part of your bike that feels wrong and it shows the likely fault, whether it is safe to ride, a typical Dutch repair price, and a short note in Dutch to show the mechanic.

**Live app:** https://mzeeshan15105.github.io/fietscheck/

- Works on any phone or laptop, and can be installed to the home screen (PWA).
- Works offline after the first visit.
- No account, no tracking. Saved bikes stay on your own device.

FietsCheck gives guidance, not a guarantee. It is not a replacement for a mechanic.

[Privacy](privacy.html) · [Terms](terms.html)

## Tests
Run `node tests/smoke.js` (needs `npm install playwright` and `npx playwright install chromium`).
GitHub runs the same tests on every push (see `.github/workflows/test.yml`).
