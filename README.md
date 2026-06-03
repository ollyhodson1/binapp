# Bin Buddy Oldham

A phone-first web app that shows the next changing Oldham bin collection.

## Changes in this version

- Removed the full-width preview button.
- Added a small round bottom-left upcoming collections button.
- Added a small round bottom-right information button.
- Removed the repeated waste type underneath the date.
- Increased spacing on the main title text.
- Main screen is now essentially just the bin colour, countdown, waste type and date.
- Green is hidden on the main screen and in the upcoming list because it is weekly.

## Folder structure

```text
docs/
  index.html
  styles.css
  app.js
  manifest.json
  service-worker.js
  icon-192.png
  icon-512.png

worker/
  worker.js
```

## Publish on GitHub Pages

1. Upload this folder to GitHub.
2. Go to **Settings → Pages**.
3. Set source to:
   - Branch: `main`
   - Folder: `/docs`
4. Save.

## Deploy the Cloudflare Worker

1. Go to Cloudflare Dashboard.
2. Go to **Workers & Pages**.
3. Create a new Worker.
4. Replace the Worker code with `worker/worker.js`.
5. Deploy it.
6. Copy the Worker URL.

## Connect the app to the Worker

Open:

```text
docs/app.js
```

Find this line:

```js
const WORKER_URL = "";
```

Change it to:

```js
const WORKER_URL = "https://your-worker-url.workers.dev";
```

## Hidden settings

You can also open the app and tap the refresh button 7 times to paste/save the Worker URL on the phone itself.
