# velox ⚡

> **Refined, accessible shipping & dispatch station. 100% pure web primitives — zero frameworks, zero build tools, zero dependencies, minimal files.**

Inspired by the clean geometric harmony of **Bauhaus**, Velox delivers an ultra-fast, local-first shipping station and scannable 4×6″ thermal label generator.

---

## 🎨 Subtle Design Language & Accessibility

- **Understated Primary Color Harmony**: Deep Slate (`#0f172a`), Cobalt Blue (`#1e40af`), Warm Amber (`#d97706`), and Crimson (`#dc2626`) woven into subtle gradients, clean borders, and calm surfaces.
- **Accessible & High-Contrast (WCAG 2.1 AA/AAA)**:
  - All text meets or exceeds 4.5:1 contrast against light and dark surfaces.
  - High-visibility focus indicators (`:focus-visible`) for complete keyboard navigation.
  - Full WAI-ARIA authoring practices (`role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, and Arrow key navigation).
  - Respects user preference for reduced motion (`prefers-reduced-motion`).
- **Smooth Micro-Interactions**: Soft hover transitions and elevated card states for an enjoyable desktop feel.

---

## ⚡ Ultra-Minimal Architecture (Only 4 Files)

```
velox/
├── index.html       # The complete application: Accessible UI, Design System, Vector Barcode Engine,
│                    # Local IndexedDB, Rate Engine, Live 4×6″ Thermal Preview & Print
├── sw.js            # PWA Service Worker enabling 100% offline warehouse operation
├── manifest.json    # Web App Manifest for standalone desktop/mobile installation
└── icons/icon.svg   # Refined geometric vector icon
```

---

## ✨ Core Capabilities

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

MIT License.
