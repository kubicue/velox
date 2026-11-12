# velox ⚡

> **Minimalist Bauhaus-inspired shipping & dispatch station. 100% pure web primitives — zero frameworks, zero build tools, zero dependencies, minimal files.**

Inspired by the iconic **Bauhaus** geometric aesthetic (*Form Follows Function*) and Magdalena Droste's Bauhaus book cover, Velox is a local-first shipping station and scannable 4×6″ thermal label generator.

---

## 🎨 Bauhaus Design Philosophy

- **Form Follows Function**: No unnecessary decorators, no rounded corners, no bloated dependencies.
- **Primary Geometric Palette**: Cobalt Blue (`#0050aa`), Canary Yellow (`#fed100`), Cadmium Red (`#df2828`), Stark Black (`#121212`), Concrete Gray (`#9e9e9e`), and Cream Canvas (`#f5f5f0`).
- **Heavy Grotesque Typography**: Lowercase bold headings, stark contrast, and strict geometric right angles (`border: 3px solid #121212`).

---

## ⚡ Minimal Architecture (Only 4 Files)

The entire application runs with the absolute minimum number of files:

```
velox/
├── index.html       # The complete application: UI, Bauhaus CSS, Vector Barcode Engine,
│                    # Local IndexedDB, Rate Engine, Live 4×6″ Thermal Preview & Print
├── sw.js            # PWA Service Worker enabling 100% offline warehouse operation
├── manifest.json    # Web App Manifest for standalone desktop/mobile installation
└── icons/icon.svg   # Bauhaus geometric vector icon
```

---

## ✨ Features

- 🏷️ **4×6″ Thermal Label Engine**: Precision `@page { size: 4in 6in; margin: 0; }` styling prints only the thermal label directly from the browser to any 4×6″ roll printer (Rollo, Zebra, Brother, MUNBYN).
- 📊 **Pure Vector Code-128 Barcodes**: Built-in SVG barcode generator with zero external libraries.
- 🏢 **Internal Point of Shipping**: Dedicated zero-cost dispatch and tote-routing label mode for warehouses, mailrooms, and inventory stations.
- 🔒 **Local-First (IndexedDB)**: Manifest history and recipient addresses are persisted directly in the browser.
- ⚡ **Offline PWA**: Full Service Worker caching keeps Velox operational in Wi-Fi dead zones.
- 🌤️ **Live Dispatch Weather**: Built-in Open-Meteo API integration with zero API keys required.

---

## 🚀 Running Locally

```bash
# Start a simple static server
python3 -m http.server 8080
```

Open `http://localhost:8080` in any browser or install it as a standalone desktop app.

---

## 📜 License

MIT License. Designed with Bauhaus principles for the modern web.
