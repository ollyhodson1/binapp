# Bin Buddy Oldham v4

This is the cache-killer version.

## Why this version exists

If you were still seeing the old design, the old service worker/browser cache was probably serving the previous files.

This version includes:

- the corrected clean layout
- no full-width Preview next collection button
- bottom-left round upcoming collections button
- bottom-right round information button
- no repeated bin/waste type under the date
- wider letter spacing on the main title
- a tiny `v4` marker at the bottom centre so you can confirm the live site has updated
- a service-worker kill switch that clears old caches and unregisters itself

## Upload instructions

1. Delete the existing `docs` folder from GitHub.
2. Upload this new `docs` folder.
3. Upload/replace the `worker` folder if needed.
4. Wait for GitHub Pages to redeploy.
5. Open the site with `?v=4` at the end of the URL.

Example:

```text
https://your-username.github.io/your-repo/?v=4
```

If it still shows the old one, open Chrome DevTools → Application → Service Workers → Unregister, then hard refresh.
