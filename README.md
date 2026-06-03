# Bin Buddy Oldham v3

This version has the requested clean layout and avoids service-worker caching during development.

## Confirming you have the right version

The `docs/index.html` file should include:

```html
<button class="corner-button corner-left" id="upcomingButton"
```

and should **not** include:

```text
Preview next collection
```

## What changed

- Removed the full-width Preview next collection button.
- Added a small round upcoming collections button in the bottom-left.
- Added a small round info button in the bottom-right.
- Removed the repeated bin/waste type under the date.
- Main screen is now only:
  - collection status
  - large bin type
  - date
- Increased main title letter spacing.
- Removed the service worker so GitHub Pages does not keep serving the old design.

## Important: if GitHub still shows the old version

GitHub Pages or your browser may still be caching the old app.

Try:

1. Open the site with `?v=3` at the end of the URL.
2. Hard refresh the browser.
3. On Chrome desktop: DevTools → Application → Service Workers → Unregister.
4. Delete the old `docs/service-worker.js` file from the GitHub repo if it still exists.
5. Re-upload the whole new `docs` folder, not just selected files.

## Publish on GitHub Pages

Upload the folder structure, then set GitHub Pages to use `/docs`.

## Cloudflare Worker

Deploy `worker/worker.js`, then paste the Worker URL into `docs/app.js`:

```js
const WORKER_URL = "https://your-worker-url.workers.dev";
```
