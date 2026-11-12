# Velox ⚡

> **Modern shipping label generator and package tracker built with 100% pure web primitives — zero frameworks, zero build steps, zero npm runtime dependencies.**

Inspired by [Shippo](https://goshippo.com) and rewritten from the original 2015 Ruby on Rails 4 project ([kubicue/velox](https://github.com/kubicue/velox)).

---

## ✨ Features

- ⚡ **Offline-First PWA (Service Worker + Manifest)**: Installable as a standalone desktop app on macOS, Windows, Linux, and mobile. Operates 100% offline with zero network latency, ideal for warehouse packing benches and steel/concrete dead zones.
- 🏢 **Internal Point of Shipping**: Dedicated internal warehouse dispatch & tote-routing mode for generating internal bin/carton scannable barcodes with zero postage fees.
- 🏷️ **Precision 4×6″ Thermal Shipping Labels**: Formatted to industry-standard 4″ × 6″ thermal dimensions via CSS `@page` media queries and SVG graphics. Ready for thermal roll printers (Rollo, Zebra, Brother, MUNBYN) or standard letter paper.
- 📊 **Pure JavaScript Code-128 Barcode Engine**: Zero-dependency, standards-compliant Code-128 Set C & Set B SVG barcode generator. No external canvas or raster image libraries.
- 📦 **Carrier Rate Shopping**: Live rate comparison across USPS Ground Advantage™, Priority Mail®, Priority Mail Express®, and UPS® Ground.
- 🔒 **Local-First & Privacy Preserving**: Saved recipient addresses, shipment history, and label archives are stored in your browser's native **IndexedDB**. Customer and recipient shipping data never leaves your machine.
- 📍 **Interactive Package Tracker**: Visual step-by-step milestone timeline powered by custom Web Components (replacing the legacy 2015 AfterShip iframe).
- 🌤️ **Live Dispatch Weather**: Built-in weather forecast using the open-source Open-Meteo REST API (replacing the defunct Forecast.io API).
- 🌓 **Modern Design System**: Built with modern CSS (CSS Grid, Subgrid, Custom Properties, Light/Dark theme switching, and native HTML5 Constraint Validation).

---

## 🏗️ Architecture & Web Primitives

Velox eliminates 100% of the build tooling, bundlers, and framework weight:

| Layer | Traditional Stack | Modern Velox Web Primitives |
| :--- | :--- | :--- |
| **Component Model** | React / Vue / Angular | Native **Web Components** (`<shipping-label>`, `<rate-selector>`, `<track-stepper>`) |
| **Styling** | Tailwind / Bootstrap | Modern **CSS Custom Properties, Grid, Subgrid, `@page { size: 4in 6in; }`** |
| **Persistence** | PostgreSQL + ActiveRecord | Browser Native **`indexedDB`** |
| **Modal / Dialogs** | jQuery UI / Bootstrap Modal | Native HTML5 **`<dialog>`** with `.showModal()` |
| **Form Validation** | React Hook Form / Vuelidate | Native **HTML5 Constraint Validation API** (`:user-invalid`, `reportValidity()`) |
| **Barcodes** | External API / npm package | **Vanilla JS Code-128 Vector SVG generator** (`js/barcode.js`) |
| **Network & APIs** | Axios / HTTParty | Native **`fetch()`** + ES Modules (`<script type="module">`) |

---

## 🚀 Getting Started

Because Velox uses **zero build tools**, you don't even need `npm install`!

### Quick Start (Local Server)

Run any local static file server from the repository root:

```bash
# Python 3
python3 -m http.server 8080

# Or Node.js (without packages)
npx serve .
```

Open `http://localhost:8080` in your browser.

### Deploying to GitHub Pages

Velox runs 100% in the browser. To deploy:
1. Push this repository to GitHub.
2. Go to **Settings > Pages**.
3. Set the source to **Deploy from branch: main (root)**.
4. Your shipping app is live with zero backend costs!

---

## 🖨️ Printing 4×6″ Thermal Labels

1. Go to **New Shipment** (`ship.html`).
2. Fill out the sender and recipient addresses (or click **⚡ Fill Sample Data**).
3. Select your carrier rate and click **🖨️ Purchase & Print Thermal Label**.
4. The label opens in `print.html` and launches your system print dialog.
5. In your print settings:
   - **Destination**: Select your 4×6 thermal printer (e.g. Rollo, Zebra).
   - **Paper Size**: `4.00 × 6.00 in` or `100 × 150 mm`.
   - **Margins**: `None` (or `Minimum`).
   - **Background graphics**: Enabled.

---

## 📁 Project Structure

```
velox/
├── index.html                  # Dashboard: metrics, weather dispatch, recent shipments
├── ship.html                   # Create shipment: address forms, rate selector, live preview
├── track.html                  # Tracking lookup & visual milestone stepper
├── print.html                  # Dedicated 4x6" thermal label & packing slip print canvas
├── css/
│   ├── base.css                # Base reset, typography, CSS tokens & dark mode
│   ├── layout.css              # CSS Grid & flexbox layouts (no Bootstrap)
│   ├── components.css          # Form controls, cards, badges, native modal dialogs
│   └── print.css               # Precision @media print styles for 4x6 thermal printers
└── js/
    ├── app.js                  # Main navigation, theme & settings coordinator
    ├── db.js                   # Lightweight native IndexedDB wrapper (zero external libs)
    ├── barcode.js              # Pure vanilla JS Code 128 / GS1-128 SVG generator
    ├── shippo-engine.js        # Shippo REST API adapter + built-in offline realistic carrier mock
    ├── weather.js              # Native Open-Meteo API fetcher (free, zero API key needed)
    └── components/
        ├── shipping-label.js   # <shipping-label> custom element for live thermal label preview
        ├── rate-selector.js    # <rate-selector> custom element for carrier rate comparison
        └── track-stepper.js    # <track-stepper> custom element for package tracking status
```

---

## 📜 License

MIT License. Inspired by Shippo and built for the modern open web.

