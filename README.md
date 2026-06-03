# Bin Buddy Oldham

A phone-first web app that shows the next changing Oldham bin collection.

It ignores the green bin on the main screen because green is collected weekly, but the full guide still includes green for reference.

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

1. Create a new GitHub repo.
2. Upload this whole folder structure.
3. Go to **Settings → Pages**.
4. Set the source to branch `main` and folder `/docs`.
5. Save.

## Deploy the Cloudflare Worker

1. Go to Cloudflare Dashboard.
2. Go to **Workers & Pages**.
3. Create a new Worker.
4. Replace the Worker code with `worker/worker.js`.
5. Deploy it.
6. Copy the Worker URL.

## Connect the app to the Worker

Open `docs/app.js` and find:

```js
const WORKER_URL = "";
```

Paste your Worker URL:

```js
const WORKER_URL = "https://your-worker-url.workers.dev";
```

Commit the change to GitHub.

## Quick setup without editing code

You can also open the app, tap the refresh button **7 times**, paste your Worker URL into the hidden settings panel, and save it. This stores the URL in your browser only.

## Data source

The Worker fetches:

```text
https://portal.oldham.gov.uk/bincollectiondates/details?uprn=422000004630
```

The app also stores the last successful lookup locally, so if the Worker or council page is unavailable, it can still show the last saved dates.
