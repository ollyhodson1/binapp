// Cloudflare Worker for Bin Buddy Oldham
// Deploy this file as a Worker, then paste the Worker URL into docs/app.js.
// Source:
// https://portal.oldham.gov.uk/bincollectiondates/details?uprn=422000004630

const TARGET_URL = "https://portal.oldham.gov.uk/bincollectiondates/details?uprn=422000004630";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
  "Cache-Control": "public, max-age=1800"
};

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (request.method !== "GET") {
      return json({ error: "Method not allowed" }, 405);
    }

    try {
      const response = await fetch(TARGET_URL, {
        headers: {
          "User-Agent": "Mozilla/5.0 BinBuddyOldham/1.0",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        },
        cf: {
          cacheTtl: 1800,
          cacheEverything: false
        }
      });

      const html = await response.text();

      if (!response.ok) {
        return json({
          error: "Oldham page returned an error",
          status: response.status,
          collections: []
        }, 502);
      }

      const collections = parseCollections(html);

      if (!collections.length) {
        return json({
          error: "Could not find collection dates in Oldham page",
          collections: [],
          debugPreview: stripHtml(html).slice(0, 800)
        }, 502);
      }

      return json({
        source: "oldham",
        fetchedAt: new Date().toISOString(),
        uprn: "422000004630",
        collections
      });
    } catch (error) {
      return json({
        error: "Failed to fetch Oldham page",
        message: error.message,
        collections: []
      }, 502);
    }
  }
};

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

function parseCollections(html) {
  const text = stripHtml(html)
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .trim();

  const collections = [];

  const blockPattern = /(Blue|Brown|Grey|Green)\s+(?:bin\s+)?(?:Collection\s+Date|Date)\s*[:\-]?\s*(\d{2}\/\d{2}\/\d{4})\s+(?:Collection\s+Day|Day)\s*[:\-]?\s*([A-Za-z]+)/gi;
  let match;

  while ((match = blockPattern.exec(text)) !== null) {
    collections.push({
      colour: titleCase(match[1]),
      collectionDate: toIso(match[2]),
      collectionDay: titleCase(match[3])
    });
  }

  if (collections.length) return dedupe(collections);

  const colourPattern = /(Blue|Brown|Grey|Green)/gi;
  while ((match = colourPattern.exec(text)) !== null) {
    const colour = titleCase(match[1]);
    const snippet = text.slice(match.index, match.index + 260);
    const date = snippet.match(/(\d{2}\/\d{2}\/\d{4})/);
    const day = snippet.match(/\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/i);

    if (date) {
      collections.push({
        colour,
        collectionDate: toIso(date[1]),
        collectionDay: day ? titleCase(day[1]) : ""
      });
    }
  }

  return dedupe(collections);
}

function stripHtml(html) {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|tr|td|th|h1|h2|h3|section|article|dt|dd)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function toIso(ddmmyyyy) {
  const [day, month, year] = ddmmyyyy.split("/");
  return `${year}-${month}-${day}`;
}

function titleCase(value) {
  const lower = String(value || "").toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function dedupe(collections) {
  const seen = new Set();
  return collections
    .filter((item) => {
      const key = `${item.colour}-${item.collectionDate}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.collectionDate.localeCompare(b.collectionDate));
}
