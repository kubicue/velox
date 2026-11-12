/**
 * Velox - Shipping & Dispatch Station
 * Modern Web Primitives • Zero External Dependencies
 */

/* ==========================================================================
   1. CODE 128 VECTOR BARCODE GENERATOR
   ========================================================================== */
const CODE128_PATTERNS = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112"
];
const START_B = 104, START_C = 105, STOP = 106;

export function generateBarcodeSVG(text, options = {}) {
  const clean = String(text || "").replace(/\s+/g, "").toUpperCase();
  if (!clean) return "";
  const barHeight = options.height || 75;
  const moduleWidth = options.moduleWidth || 2.1;
  const quietZone = 16;
  const isDigits = /^\d+$/.test(clean) && clean.length % 2 === 0;

  let symbols = [isDigits ? START_C : START_B];
  let checksum = symbols[0];
  let weight = 1;

  if (isDigits) {
    for (let i = 0; i < clean.length; i += 2) {
      const val = parseInt(clean.substr(i, 2), 10);
      symbols.push(val);
      checksum += val * weight++;
    }
  } else {
    for (let i = 0; i < clean.length; i++) {
      const code = clean.charCodeAt(i) - 32;
      const val = code >= 0 && code <= 95 ? code : 0;
      symbols.push(val);
      checksum += val * weight++;
    }
  }

  symbols.push(checksum % 103);
  symbols.push(STOP);

  let binary = "";
  for (const sym of symbols) {
    const pat = CODE128_PATTERNS[sym];
    let isBar = true;
    for (let i = 0; i < pat.length; i++) {
      binary += (isBar ? "1" : "0").repeat(parseInt(pat[i], 10));
      isBar = !isBar;
    }
  }

  let rects = [];
  let x = quietZone;
  for (let i = 0; i < binary.length; i++) {
    if (binary[i] === "1") {
      let run = 1;
      while (i + 1 < binary.length && binary[i + 1] === "1") { run++; i++; }
      rects.push(`<rect x="${x}" y="0" width="${run * moduleWidth}" height="${barHeight}" fill="#000000" />`);
      x += run * moduleWidth;
    } else {
      x += moduleWidth;
    }
  }

  const totalWidth = binary.length * moduleWidth + quietZone * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${barHeight}" preserveAspectRatio="xMidYMid meet" class="lh-barcode-svg" role="img" aria-label="Scannable Code 128 barcode for ${clean}">
    <rect width="100%" height="100%" fill="#ffffff"/>
    ${rects.join("")}
  </svg>`;
}

/* ==========================================================================
   2. LOCAL-FIRST INDEXEDDB REPOSITORY
   ========================================================================== */
const DB_NAME = "velox_station_db";
function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") return resolve(null);
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("shipments")) {
        const store = db.createObjectStore("shipments", { keyPath: "id" });
        store.createIndex("trackingNumber", "trackingNumber", { unique: false });
      }
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbSaveShipment(item) {
  const db = await openDB();
  if (!db) return item;
  return new Promise((res, rej) => {
    const tx = db.transaction("shipments", "readwrite");
    tx.objectStore("shipments").put(item);
    tx.oncomplete = () => res(item);
    tx.onerror = () => rej(tx.error);
  });
}

async function dbGetShipments() {
  const db = await openDB();
  if (!db) return [];
  return new Promise((res, rej) => {
    const tx = db.transaction("shipments", "readonly");
    const req = tx.objectStore("shipments").getAll();
    req.onsuccess = () => res(req.result || []);
    req.onerror = () => rej(req.error);
  });
}

async function dbClearShipments() {
  const db = await openDB();
  if (!db) return true;
  return new Promise((res, rej) => {
    const tx = db.transaction("shipments", "readwrite");
    tx.objectStore("shipments").clear();
    tx.oncomplete = () => res(true);
    tx.onerror = () => rej(tx.error);
  });
}

/* ==========================================================================
   3. CARRIER RATES & REFINED TARIFFS
   ========================================================================== */
export function calculateRates(weightOz) {
  const lbs = (parseFloat(weightOz) || 24) / 16;
  const factor = Math.max(1, Math.min(6, lbs));
  return [
    {
      id: "r_ground",
      carrier: "USPS",
      service: "USPS Ground Advantage™",
      title: "USPS Ground Advantage™",
      desc: "2-5 business days • Commercial ePostage",
      amount: (4.75 + factor * 1.65).toFixed(2),
      banner: "USPS GROUND ADVANTAGE™",
      indicia: "US POSTAGE PAID<br>ePostage<br>Velox Station",
      badge: "Best Value"
    },
    {
      id: "r_priority",
      carrier: "USPS",
      service: "Priority Mail 2-Day®",
      title: "USPS Priority Mail 2-Day®",
      desc: "1-3 business days • Fast Priority dispatch",
      amount: (8.40 + factor * 2.20).toFixed(2),
      banner: "PRIORITY MAIL 2-DAY®",
      indicia: "US POSTAGE PAID<br>ePostage<br>Velox Station",
      badge: "Popular"
    },
    {
      id: "r_internal",
      carrier: "INTERNAL",
      service: "Internal Dispatch Station",
      title: "Internal Point of Shipping",
      desc: "Facility & tote routing • Zero postage fee",
      amount: "0.00",
      banner: "INTERNAL POINT OF SHIPPING / DISPATCH",
      indicia: "INTERNAL DISPATCH<br>NO POSTAGE REQ<br>STATION VERIFIED",
      badge: "Facility"
    }
  ];
}

export function generateTrackingNumber() {
  let num = "9400";
  for (let i = 0; i < 18; i++) num += Math.floor(Math.random() * 10);
  return num;
}

/* ==========================================================================
   4. OPEN-METEO WEATHER FETCH (ACCESSIBLE ZERO-KEY)
   ========================================================================== */
async function loadWeather() {
  try {
    const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=34.0195&longitude=-118.4912&current=temperature_2m,relative_humidity_2m,weather_code&temperature_unit=fahrenheit");
    if (res.ok) {
      const data = await res.json();
      const tempEl = document.getElementById("weather-temp");
      const summaryEl = document.getElementById("weather-summary");
      if (tempEl) tempEl.textContent = `${Math.round(data.current.temperature_2m)}°F`;
      if (summaryEl) summaryEl.textContent = `Clear Dispatch Weather • Humidity: ${data.current.relative_humidity_2m}%`;
    }
  } catch (_) {
    const tempEl = document.getElementById("weather-temp");
    const summaryEl = document.getElementById("weather-summary");
    if (tempEl) tempEl.textContent = "72°F";
    if (summaryEl) summaryEl.textContent = "Local Station Operating Cleanly";
  }
}

/* ==========================================================================
   5. ACCESSIBLE TAB CONTROLLER (WAI-ARIA COMPLIANT)
   ========================================================================== */
function setupAccessibleTabs() {
  const tabButtons = Array.from(document.querySelectorAll('[role="tab"]'));
  const panels = {
    "tab-btn-ship": document.getElementById("panel-ship"),
    "tab-btn-track": document.getElementById("panel-track"),
    "tab-btn-manifest": document.getElementById("panel-manifest"),
    "tab-btn-settings": document.getElementById("panel-settings")
  };

  function activateTab(btn, setFocus = true) {
    tabButtons.forEach(b => {
      b.classList.remove("active");
      b.setAttribute("aria-selected", "false");
      b.setAttribute("tabindex", "-1");
    });

    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");
    btn.setAttribute("tabindex", "0");
    if (setFocus) btn.focus();

    Object.keys(panels).forEach(id => {
      if (panels[id]) {
        panels[id].style.display = (id === btn.id ? "block" : "none");
      }
    });

    if (btn.id === "tab-btn-manifest") refreshManifest();
  }

  tabButtons.forEach((btn, index) => {
    btn.addEventListener("click", () => activateTab(btn, false));

    // Keyboard arrow navigation per WAI-ARIA
    btn.addEventListener("keydown", (e) => {
      let nextIndex = index;
      if (e.key === "ArrowRight") {
        nextIndex = (index + 1) % tabButtons.length;
        activateTab(tabButtons[nextIndex]);
      } else if (e.key === "ArrowLeft") {
        nextIndex = (index - 1 + tabButtons.length) % tabButtons.length;
        activateTab(tabButtons[nextIndex]);
      } else if (e.key === "Home") {
        activateTab(tabButtons[0]);
      } else if (e.key === "End") {
        activateTab(tabButtons[tabButtons.length - 1]);
      }
    });
  });
}

/* ==========================================================================
   6. APPLICATION STATE & DOM WIRING
   ========================================================================== */
let currentRates = [];
let selectedRate = null;
let currentTracking = generateTrackingNumber();

function init() {
  loadWeather();
  setupAccessibleTabs();
  setupPresets();
  setupFormListeners();
  refreshRates();
  refreshManifest();
  updatePwaStatus();

  // Register Service Worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

function setupPresets() {
  document.querySelectorAll(".preset-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.getElementById("pweight").value = btn.dataset.w;
      document.getElementById("plength").value = btn.dataset.l;
      document.getElementById("pwidth").value = btn.dataset.wi;
      document.getElementById("pheight").value = btn.dataset.h;
      refreshRates();
      renderPreview();
    });
  });

  const sampleBtn = document.getElementById("fill-sample-btn");
  if (sampleBtn) {
    sampleBtn.addEventListener("click", () => {
      document.getElementById("fname").value = "Velox Dispatch Station";
      document.getElementById("fcompany").value = "Velox Logistics Hub";
      document.getElementById("fstreet").value = "1540 2nd St";
      document.getElementById("fcity").value = "Santa Monica";
      document.getElementById("fstate").value = "CA";
      document.getElementById("fzip").value = "90401";

      document.getElementById("tname").value = "Walter Gropius";
      document.getElementById("tcompany").value = "Bauhaus Archives";
      document.getElementById("tstreet").value = "Klingelhöferstraße 14";
      document.getElementById("tcity").value = "New York";
      document.getElementById("tstate").value = "NY";
      document.getElementById("tzip").value = "10001";
      refreshRates();
      renderPreview();
    });
  }
}

function setupFormListeners() {
  const form = document.getElementById("velox-form");
  if (form) {
    form.addEventListener("input", renderPreview);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await purchaseAndPrint();
    });
  }

  const pweight = document.getElementById("pweight");
  if (pweight) pweight.addEventListener("change", refreshRates);

  const directPrint = document.getElementById("direct-print-btn");
  if (directPrint) {
    directPrint.addEventListener("click", () => window.print());
  }

  const clearBtn = document.getElementById("clear-manifest-btn");
  if (clearBtn) {
    clearBtn.addEventListener("click", async () => {
      if (confirm("Clear local manifest archive?")) {
        await dbClearShipments();
        refreshManifest();
      }
    });
  }

  const trackBtn = document.getElementById("track-submit-btn");
  if (trackBtn) {
    trackBtn.addEventListener("click", () => {
      const val = document.getElementById("track-search-input").value.trim();
      runTracking(val);
    });
  }
}

function refreshRates() {
  const weight = document.getElementById("pweight")?.value || 24;
  currentRates = calculateRates(weight);
  if (!selectedRate) selectedRate = currentRates[0];

  const container = document.getElementById("rate-container");
  if (!container) return;

  container.innerHTML = currentRates.map(r => `
    <div class="rate-card ${selectedRate?.id === r.id ? "selected" : ""}" data-id="${r.id}" role="radio" aria-checked="${selectedRate?.id === r.id}" tabindex="0">
      <div>
        <div class="rate-carrier-title">${r.title}</div>
        <div class="rate-terms">${r.desc}</div>
      </div>
      <div style="text-align: right;">
        <div class="rate-price-tag">$${r.amount}</div>
        <span class="rate-badge-pill">${r.badge}</span>
      </div>
    </div>
  `).join("");

  container.querySelectorAll(".rate-card").forEach(el => {
    const selectAction = () => {
      selectedRate = currentRates.find(r => r.id === el.dataset.id);
      refreshRates();
      renderPreview();
    };

    el.addEventListener("click", selectAction);
    el.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        selectAction();
      }
    });
  });
}

function renderPreview() {
  const fname = document.getElementById("fname")?.value || "Shipper";
  const fcomp = document.getElementById("fcompany")?.value || "";
  const fstreet = document.getElementById("fstreet")?.value || "";
  const fcity = document.getElementById("fcity")?.value || "";
  const fstate = (document.getElementById("fstate")?.value || "").toUpperCase();
  const fzip = document.getElementById("fzip")?.value || "";

  const tname = document.getElementById("tname")?.value || "Recipient";
  const tcomp = document.getElementById("tcompany")?.value || "";
  const tstreet = document.getElementById("tstreet")?.value || "";
  const tcity = document.getElementById("tcity")?.value || "";
  const tstate = (document.getElementById("tstate")?.value || "").toUpperCase();
  const tzip = document.getElementById("tzip")?.value || "";
  const weight = document.getElementById("pweight")?.value || "24";

  const rate = selectedRate || currentRates[0] || {};

  const lblCarrier = document.getElementById("lbl-carrier");
  const lblService = document.getElementById("lbl-service");
  const lblIndicia = document.getElementById("lbl-indicia");
  const lblBanner = document.getElementById("lbl-banner");

  if (lblCarrier) lblCarrier.textContent = rate.carrier || "USPS";
  if (lblService) lblService.textContent = rate.service || "Ground Advantage™";
  if (lblIndicia) lblIndicia.innerHTML = rate.indicia || "US POSTAGE PAID<br>ePostage<br>Velox Station";
  if (lblBanner) lblBanner.textContent = rate.banner || "USPS GROUND ADVANTAGE™";

  const fromName = document.getElementById("lbl-from-name");
  const fromComp = document.getElementById("lbl-from-company");
  const fromStr = document.getElementById("lbl-from-street");
  const fromCity = document.getElementById("lbl-from-city");

  if (fromName) fromName.textContent = fname;
  if (fromComp) fromComp.textContent = fcomp;
  if (fromStr) fromStr.textContent = fstreet;
  if (fromCity) fromCity.textContent = `${fcity}, ${fstate} ${fzip}`;

  const toName = document.getElementById("lbl-to-name");
  const toComp = document.getElementById("lbl-to-company");
  const toStr = document.getElementById("lbl-to-street");
  const toCity = document.getElementById("lbl-to-city");

  if (toName) toName.textContent = tname;
  if (toComp) toComp.textContent = tcomp;
  if (toStr) toStr.textContent = tstreet;
  if (toCity) toCity.textContent = `${tcity}, ${tstate} ${tzip}`;

  const rZip = document.getElementById("lbl-routing-zip");
  const lWeight = document.getElementById("lbl-weight");
  const lDate = document.getElementById("lbl-date");

  if (rZip) rZip.textContent = tzip || "10001";
  if (lWeight) lWeight.textContent = weight;
  if (lDate) lDate.textContent = new Date().toLocaleDateString();

  const formatted = currentTracking.match(/.{1,4}/g)?.join(" ") || currentTracking;
  const trackText = document.getElementById("lbl-tracking-text");
  const barcodeBox = document.getElementById("lbl-barcode-container");

  if (trackText) trackText.textContent = `USPS TRACKING # ${formatted}`;
  if (barcodeBox) barcodeBox.innerHTML = generateBarcodeSVG(currentTracking, { height: 75, moduleWidth: 2.1 });
}

async function purchaseAndPrint() {
  const shipment = {
    id: `velox_${Date.now()}`,
    trackingNumber: currentTracking,
    carrier: selectedRate.carrier,
    service: selectedRate.service,
    amount: selectedRate.amount,
    createdAt: new Date().toISOString(),
    to: document.getElementById("tname").value,
    dest: `${document.getElementById("tcity").value}, ${document.getElementById("tstate").value}`
  };

  await dbSaveShipment(shipment);
  window.print();

  currentTracking = generateTrackingNumber();
  renderPreview();
  refreshManifest();
}

async function refreshManifest() {
  const items = await dbGetShipments();
  const tbody = document.getElementById("manifest-tbody");
  const countText = document.getElementById("shipment-counter-text");
  if (countText) countText.textContent = `${items.length} label(s) archived`;

  if (!tbody) return;

  if (items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--c-muted); padding: 24px;">No shipments recorded.</td></tr>`;
    return;
  }

  tbody.innerHTML = items.reverse().map(item => `
    <tr>
      <td style="font-family: var(--font-mono); font-weight: 700;">${item.trackingNumber}</td>
      <td><strong>${item.carrier}</strong> — ${item.service}</td>
      <td><strong>${item.to}</strong> (${item.dest})</td>
      <td style="font-weight: 800;">$${item.amount}</td>
      <td>${new Date(item.createdAt).toLocaleDateString()}</td>
      <td>
        <button class="btn btn-secondary manifest-track-btn" data-track="${item.trackingNumber}" style="padding: 4px 10px; font-size: 0.775rem;">Track</button>
      </td>
    </tr>
  `).join("");

  tbody.querySelectorAll(".manifest-track-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.getElementById("tab-btn-track").click();
      document.getElementById("track-search-input").value = btn.dataset.track;
      runTracking(btn.dataset.track);
    });
  });
}

function runTracking(trackingNum) {
  const clean = (trackingNum || "").replace(/\s+/g, "");
  const container = document.getElementById("track-milestones");
  if (!container) return;

  container.innerHTML = `
    <div style="font-family: var(--font-mono); font-weight: 800; font-size: 1.05rem; margin-bottom: 12px; color: var(--c-charcoal);">
      Tracking: ${clean || currentTracking}
    </div>
    <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 14px;">
      <div style="border-left: 3px solid var(--c-blue); padding-left: 14px;">
        <div style="font-weight: 700; color: var(--c-charcoal);">In Transit — Out for Delivery</div>
        <div style="font-size: 0.8rem; color: var(--c-muted);">Local Carrier Station • ${new Date().toLocaleTimeString()}</div>
      </div>
      <div style="border-left: 3px solid var(--c-yellow-accent); padding-left: 14px;">
        <div style="font-weight: 700; color: var(--c-charcoal);">Processed through Regional Sorting Facility</div>
        <div style="font-size: 0.8rem; color: var(--c-muted);">Transit Distribution Center • Yesterday</div>
      </div>
      <div style="border-left: 3px solid #10b981; padding-left: 14px;">
        <div style="font-weight: 700; color: var(--c-charcoal);">Shipping Label Generated / Station Intake Verified</div>
        <div style="font-size: 0.8rem; color: var(--c-muted);">Velox Internal Station • Two days ago</div>
      </div>
    </div>
  `;
}

function updatePwaStatus() {
  const badge = document.getElementById("pwa-status-badge");
  const isOnline = navigator.onLine;
  if (badge) {
    badge.innerHTML = `
      <span class="status-dot" style="background-color: ${isOnline ? "#10b981" : "#f59e0b"}" aria-hidden="true"></span>
      <span>${isOnline ? "offline ready" : "offline mode"}</span>
    `;
  }
  window.addEventListener("online", updatePwaStatus);
  window.addEventListener("offline", updatePwaStatus);
}

document.addEventListener("DOMContentLoaded", init);
