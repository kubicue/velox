# velox ⚡

> **Refined, accessible shipping & dispatch station. 100% pure web primitives — zero frameworks, zero build tools, zero dependencies, exactly 6 files.**

Velox delivers an ultra-fast, local-first shipping station and scannable 4×6″ thermal label generator.

---

## ⚡ The 6-File Architecture

The application is cleanly organized into dedicated directories for markup, styling, and logic:

```
velox/
├── index.html       # Clean semantic HTML5 markup & accessible WAI-ARIA structure
├── css/
│   └── style.css    # Subtle Bauhaus design system, micro-interactions, responsive grid & @media print
├── js/
│   └── app.js       # Complete logic: Code-128 SVG barcode generator, IndexedDB store, carrier tariffs,
│                    # Open-Meteo weather, WAI-ARIA tab navigation & live thermal previewer
├── sw.js            # PWA Service Worker enabling 100% offline warehouse operation
├── manifest.json    # Web App Manifest for standalone desktop/mobile installation
└── icons/icon.svg   # Refined geometric vector icon
```

---

## ⚡ Design & Accessibility (WCAG 2.1 AA / AAA)

- **Dark Operations Palette**: Deep Noir (`#161616`), Deep Forest Pine (`#07322a`), Muted Sage Mist (`#b3c1be`), and Warm Alabaster (`#e4e2df`).
- **Surgical Vertical Balance**: Consistent label heights (`18px`), bottom margins (`6px`), and input dimensions (`42px`) ensuring seamless baseline alignment across multi-column rows.
- **Accessible Micro-Interactions**: Smooth hover transitions (`cubic-bezier(0.16, 1, 0.3, 1)`), subtle card elevation, and interactive rate cards.
- **Full WAI-ARIA Navigation**: Keyboard-driven tab switching (`←` / `→` arrow keys, `Home`, `End`), high-contrast focus rings (`:focus-visible`), and screen-reader accessible labeling.
- **Reduced Motion Support**: Automatically respects `prefers-reduced-motion: reduce`.

---

## ⚡ Core Capabilities

- ⚡ **4×6″ Thermal Label Engine**: Precision `@page { size: 4in 6in; margin: 0; }` styling prints only the thermal label directly from the browser to any 4×6″ roll printer (Rollo, Zebra, Brother, MUNBYN).
- ⚡ **Pure Vector Code-128 Barcodes**: Built-in SVG barcode generator with zero external libraries.
- ⚡ **Internal Point of Shipping**: Dedicated zero-cost dispatch and tote-routing label mode for warehouses, mailrooms, and inventory stations.
- ⚡**CSV Transaction Export**: Export shipping manifest archives to standard RFC 4180 CSV for accounting, spreadsheet reconciliation, or warehouse handoffs with zero external tools.
- ⚡ **Local Storage Hygiene**: Complete purge controls to drop historical records and prevent unbounded IndexedDB growth on local warehouse stations.
- ⚡ **Local-First (IndexedDB)**: Manifest history and recipient addresses are persisted directly in the browser.
- ⚡ **Offline PWA**: Full Service Worker caching keeps Velox operational in Wi-Fi dead zones.
- ⚡ **Live Dispatch Weather**: Built-in Open-Meteo API integration with zero API keys required.

---

## ⚡ Running Locally

```bash
# Start a simple static server
python3 -m http.server 8080
```

Open `http://localhost:8080` in any browser or install it as a standalone desktop app.

---

## ⚡ License

MIT License.
