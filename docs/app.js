// Bin Buddy Oldham v5
// Deploy worker/worker.js to Cloudflare Workers and paste the URL here.
const WORKER_URL = "https://bin-buddy-oldham.oliverhodson1234.workers.dev/"; // Example: "https://bin-buddy-oldham.your-name.workers.dev"

const DEMO_COLLECTIONS = [
  { colour: "Blue", collectionDate: "2026-06-03", collectionDay: "Wednesday" },
  { colour: "Green", collectionDate: "2026-06-03", collectionDay: "Wednesday" },
  { colour: "Brown", collectionDate: "2026-06-10", collectionDay: "Wednesday" },
  { colour: "Green", collectionDate: "2026-06-10", collectionDay: "Wednesday" },
  { colour: "Grey", collectionDate: "2026-06-17", collectionDay: "Wednesday" },
  { colour: "Green", collectionDate: "2026-06-17", collectionDay: "Wednesday" },
  { colour: "Blue", collectionDate: "2026-06-24", collectionDay: "Wednesday" },
  { colour: "Green", collectionDate: "2026-06-24", collectionDay: "Wednesday" },
  { colour: "Brown", collectionDate: "2026-07-01", collectionDay: "Wednesday" },
  { colour: "Green", collectionDate: "2026-07-01", collectionDay: "Wednesday" },
  { colour: "Grey", collectionDate: "2026-07-08", collectionDay: "Wednesday" },
  { colour: "Green", collectionDate: "2026-07-08", collectionDay: "Wednesday" },
  { colour: "Blue", collectionDate: "2026-07-15", collectionDay: "Wednesday" },
  { colour: "Green", collectionDate: "2026-07-15", collectionDay: "Wednesday" }
];

const BIN_META = {
  blue: {
    title: "Paper & Card",
    displayTitle: "Paper<br>& Card",
    background: "#0877e8",
    short: "Paper & card",
    guideTitle: "Blue — Paper & card",
    items: [
      "Paper and card",
      "Food and drinks cartons",
      "Egg boxes",
      "Cardboard",
      "Card packaging",
      "Newspapers, magazines, brochures, envelopes and junk mail",
      "Wrap shredded paper inside a sheet of newspaper or place it in a cardboard box"
    ]
  },
  brown: {
    title: "Bottles, Cans & Plastics",
    displayTitle: "Bottles,<br>Cans &<br>Plastics",
    background: "#8b572a",
    short: "Bottles, cans & plastics",
    guideTitle: "Brown — Bottles, cans & plastics",
    items: [
      "Plastic pots, tubs and trays",
      "Plastic bottles",
      "Glass bottles and jars",
      "Food tins and drink cans",
      "Aerosols",
      "Foil",
      "No plastic film, carrier bags, crisp packets or pet food pouches",
      "All items should be clean and empty"
    ]
  },
  grey: {
    title: "General Waste",
    displayTitle: "General<br>Waste",
    background: "#4f545a",
    short: "General waste",
    guideTitle: "Grey — Non-recyclable rubbish",
    items: [
      "Only rubbish that cannot be recycled",
      "Nappies",
      "Polystyrene",
      "Plastic bags and film",
      "Other household plastics such as plant pots",
      "Lids from glass jars and bottles",
      "Wrapped broken crockery and glassware",
      "Other broken non-electrical household items"
    ]
  },
  green: {
    title: "Food & Garden Waste",
    displayTitle: "Food &<br>Garden<br>Waste",
    background: "#2f9e44",
    short: "Food & garden waste",
    guideTitle: "Green — Food & garden waste",
    items: [
      "Food and garden waste, but no soil, gravel, stones or wood",
      "Tea bags and coffee grounds",
      "Fruit and vegetables",
      "Grass, flowers, hedge and plant cuttings",
      "Out of date food with no packaging",
      "Meat and bones, cooked and uncooked",
      "Bread and pastries",
      "Dairy and egg shells",
      "All cooked and uncooked food"
    ]
  }
};

const state = {
  allCollections: [],
  changingCollections: [],
  activeIndex: 0,
  refreshTapCount: 0,
  loadingStartedAt: 0
};

const els = {
  app: document.getElementById("app"),
  loading: document.getElementById("loading"),
  emojiStage: document.getElementById("emojiStage"),
  countdown: document.getElementById("countdown"),
  binTitle: document.getElementById("binTitle"),
  collectionDate: document.getElementById("collectionDate"),
  upcomingButton: document.getElementById("upcomingButton"),
  guideButton: document.getElementById("guideButton"),
  guideSheet: document.getElementById("guideSheet"),
  guideList: document.getElementById("guideList"),
  closeGuide: document.getElementById("closeGuide"),
  upcomingSheet: document.getElementById("upcomingSheet"),
  upcomingList: document.getElementById("upcomingList"),
  closeUpcoming: document.getElementById("closeUpcoming"),
  backdrop: document.getElementById("backdrop"),
  refreshButton: document.getElementById("refreshButton"),
  settingsSheet: document.getElementById("settingsSheet"),
  workerUrlInput: document.getElementById("workerUrlInput"),
  saveWorkerUrl: document.getElementById("saveWorkerUrl"),
  clearWorkerUrl: document.getElementById("clearWorkerUrl"),
  closeSettings: document.getElementById("closeSettings")
};

function normaliseColour(value) {
  return String(value || "").trim().toLowerCase();
}

function getMeta(colour) {
  return BIN_META[normaliseColour(colour)] || BIN_META.grey;
}

function todayAtMidnight() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function parseDate(value) {
  if (!value) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [d, m, y] = value.split("/").map(Number);
    return new Date(y, m - 1, d);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDate(dateValue) {
  const date = parseDate(dateValue);
  if (!date) return "Date unavailable";

  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(date);
}

function daysUntil(dateValue) {
  const date = parseDate(dateValue);
  if (!date) return null;

  const today = todayAtMidnight();
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((target - today) / 86400000);
}

function countdownText(dateValue) {
  const days = daysUntil(dateValue);
  const hour = new Date().getHours();

  if (days === null) return "Next collection";
  if (days < 0) return "Date has passed";
  if (days === 0) return "Collection today";
  if (days === 1) return hour >= 18 ? "Put out tonight" : "Collection tomorrow";
  return `${days} days remaining`;
}

function collectionSort(a, b) {
  return parseDate(a.collectionDate) - parseDate(b.collectionDate);
}

function keepFutureAndRelevant(collections) {
  const today = todayAtMidnight();

  return collections
    .map((item) => ({
      ...item,
      colour: item.colour || item.binColour || item.bin || "",
      collectionDate: item.collectionDate || item.date || "",
      collectionDay: item.collectionDay || item.day || ""
    }))
    .filter((item) => item.colour && item.collectionDate)
    .filter((item) => {
      const date = parseDate(item.collectionDate);
      return date && date >= today;
    })
    .sort(collectionSort);
}

function hideGreen(collections) {
  return collections.filter((item) => normaliseColour(item.colour) !== "green");
}

function buildGuide() {
  const ordered = ["blue", "brown", "grey", "green"];

  els.guideList.innerHTML = ordered.map((key, index) => {
    const meta = BIN_META[key];

    return `
      <details ${index === 0 ? "open" : ""}>
        <summary>
          <span class="dot" style="background:${meta.background}"></span>
          <span>${meta.guideTitle}</span>
        </summary>
        <ul>
          ${meta.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </details>
    `;
  }).join("");
}

function buildUpcomingList() {
  const upcoming = state.changingCollections.slice(0, 8);

  els.upcomingList.innerHTML = upcoming.map((item) => {
    const meta = getMeta(item.colour);

    return `
      <article class="upcoming-item">
        <span class="upcoming-dot" style="background:${meta.background}"></span>
        <div>
          <span class="upcoming-title">${escapeHtml(meta.short)}</span>
          <span class="upcoming-date">${escapeHtml(formatDate(item.collectionDate))}</span>
          <span class="upcoming-countdown">${escapeHtml(countdownText(item.collectionDate))}</span>
        </div>
      </article>
    `;
  }).join("");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function createEmojiPile() {
  els.emojiStage.innerHTML = "";
  const icons = ["🗑️", "♻️", "🟦", "🟫", "⬛", "🗑️"];

  for (let i = 0; i < 92; i += 1) {
    const emoji = document.createElement("span");
    emoji.className = "emoji";
    emoji.textContent = icons[i % icons.length];

    const row = Math.floor(i / 7);
    const left = Math.random() * 92;
    const bottom = row * 42 + Math.random() * 32;
    const delay = i * 0.032;
    const size = 44 + Math.random() * 30;
    const rotate = Math.random() * 30 - 15;

    emoji.style.left = `${left}%`;
    emoji.style.setProperty("--bottom", `${bottom}px`);
    emoji.style.setProperty("--delay", `${delay}s`);
    emoji.style.setProperty("--size", `${size}px`);
    emoji.style.setProperty("--rotate", `${rotate}deg`);

    els.emojiStage.appendChild(emoji);
  }
}

function showLoading() {
  state.loadingStartedAt = Date.now();
  createEmojiPile();
  els.loading.classList.remove("hidden");
}

function hideLoading() {
  const elapsed = Date.now() - state.loadingStartedAt;
  const wait = Math.max(0, 1350 - elapsed);
  setTimeout(() => els.loading.classList.add("hidden"), wait);
}

function renderActive() {
  if (!state.changingCollections.length) {
    const fallback = { colour: "Grey", collectionDate: toISODate(todayAtMidnight()) };
    state.changingCollections = [fallback];
  }

  const collection = state.changingCollections[state.activeIndex] || state.changingCollections[0];
  const meta = getMeta(collection.colour);

  els.app.style.background = meta.background;
  document.querySelector('meta[name="theme-color"]').setAttribute("content", meta.background);

  els.countdown.textContent = countdownText(collection.collectionDate);
  els.binTitle.innerHTML = meta.displayTitle;
  els.collectionDate.textContent = formatDate(collection.collectionDate);

  buildUpcomingList();
}

function getConfiguredWorkerUrl() {
  const saved = localStorage.getItem("binBuddyWorkerUrl") || "";
  return saved || WORKER_URL;
}

async function fetchCollections() {
  const workerUrl = getConfiguredWorkerUrl();

  if (!workerUrl || workerUrl.includes("PASTE_")) {
    const demo = DEMO_COLLECTIONS.map((item) => ({ ...item, source: "demo" }));
    return { collections: demo, source: "demo" };
  }

  const response = await fetch(workerUrl, {
    method: "GET",
    cache: "no-store",
    headers: { "Accept": "application/json" }
  });

  if (!response.ok) {
    throw new Error(`Worker returned ${response.status}`);
  }

  const data = await response.json();

  if (!Array.isArray(data.collections)) {
    throw new Error("Worker response did not include collections array");
  }

  return data;
}

async function loadCollections() {
  showLoading();

  try {
    const data = await fetchCollections();
    const source = data.source || "live";
    const clean = keepFutureAndRelevant(data.collections).map((item) => ({ ...item, source }));
    const changing = hideGreen(clean);

    if (!changing.length) {
      throw new Error("No future changing bin dates found");
    }

    state.allCollections = clean;
    state.changingCollections = changing;
    state.activeIndex = 0;

    localStorage.setItem("binBuddyLastCollections", JSON.stringify({
      savedAt: new Date().toISOString(),
      collections: clean
    }));
  } catch (error) {
    console.warn(error);

    const cached = getCachedCollections();
    if (cached.length) {
      state.allCollections = cached.map((item) => ({ ...item, source: "cache" }));
      state.changingCollections = hideGreen(state.allCollections);
      state.activeIndex = 0;
    } else {
      state.allCollections = DEMO_COLLECTIONS.map((item) => ({ ...item, source: "manual-demo" }));
      state.changingCollections = hideGreen(state.allCollections);
      state.activeIndex = 0;
    }
  } finally {
    renderActive();
    hideLoading();
  }
}

function getCachedCollections() {
  try {
    const raw = localStorage.getItem("binBuddyLastCollections");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return keepFutureAndRelevant(parsed.collections || []);
  } catch {
    return [];
  }
}

function openSheet(sheet) {
  sheet.classList.add("open");
  els.backdrop.classList.add("open");
}

function closeSheets() {
  els.guideSheet.classList.remove("open");
  els.upcomingSheet.classList.remove("open");
  els.settingsSheet.classList.remove("open");
  els.backdrop.classList.remove("open");
}

function setupEvents() {
  els.upcomingButton.addEventListener("click", () => openSheet(els.upcomingSheet));
  els.guideButton.addEventListener("click", () => openSheet(els.guideSheet));
  els.closeGuide.addEventListener("click", closeSheets);
  els.closeUpcoming.addEventListener("click", closeSheets);
  els.backdrop.addEventListener("click", closeSheets);

  els.refreshButton.addEventListener("click", () => {
    state.refreshTapCount += 1;

    if (state.refreshTapCount >= 7) {
      state.refreshTapCount = 0;
      els.workerUrlInput.value = getConfiguredWorkerUrl();
      openSheet(els.settingsSheet);
      return;
    }

    loadCollections();
  });

  els.closeSettings.addEventListener("click", closeSheets);

  els.saveWorkerUrl.addEventListener("click", () => {
    const value = els.workerUrlInput.value.trim();
    if (value) localStorage.setItem("binBuddyWorkerUrl", value);
    closeSheets();
    loadCollections();
  });

  els.clearWorkerUrl.addEventListener("click", () => {
    localStorage.removeItem("binBuddyWorkerUrl");
    els.workerUrlInput.value = "";
    closeSheets();
    loadCollections();
  });
}

buildGuide();
setupEvents();
loadCollections();
