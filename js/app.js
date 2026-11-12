/**
 * Velox - Main Application Coordinator
 * Zero frameworks, pure Web Primitives
 */

import { db } from "./db.js";

// Initialize Theme, Settings & Offline PWA Capabilities
export async function initAppShell() {
  const savedTheme = await db.getSetting("theme", "auto");
  applyTheme(savedTheme);

  // Setup Service Worker for Offline PWA
  registerServiceWorker();

  // Monitor network status
  setupNetworkMonitor();

  // Setup theme toggle button if present
  const themeBtn = document.getElementById("theme-toggle-btn");
  if (themeBtn) {
    themeBtn.addEventListener("click", async () => {
      const current = document.documentElement.getAttribute("data-theme") || "light";
      const next = current === "dark" ? "light" : "dark";
      await db.setSetting("theme", next);
      applyTheme(next);
    });
  }

  // Setup settings dialog modal
  const settingsBtn = document.getElementById("settings-modal-btn");
  const settingsDialog = document.getElementById("settings-dialog");
  const closeSettingsBtn = document.getElementById("close-settings-btn");
  const saveSettingsBtn = document.getElementById("save-settings-btn");
  const apiKeyInput = document.getElementById("shippo-api-key-input");

  if (settingsBtn && settingsDialog) {
    settingsBtn.addEventListener("click", async () => {
      const currentKey = await db.getSetting("shippo_api_key", "");
      if (apiKeyInput) apiKeyInput.value = currentKey;
      settingsDialog.showModal();
    });

    if (closeSettingsBtn) {
      closeSettingsBtn.addEventListener("click", () => settingsDialog.close());
    }

    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener("click", async () => {
        if (apiKeyInput) {
          await db.setSetting("shippo_api_key", apiKeyInput.value.trim());
        }
        settingsDialog.close();
      });
    }

    // Light dismiss for <dialog>
    settingsDialog.addEventListener("click", (e) => {
      if (e.target === settingsDialog) {
        settingsDialog.close();
      }
    });
  }

  // Seed initial demo shipments if empty
  await seedInitialDataIfEmpty();
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

async function seedInitialDataIfEmpty() {
  const shipments = await db.getAllShipments();
  if (shipments.length === 0) {
    const demoShipment = {
      id: "velox_demo_sample",
      trackingNumber: "9400111899562537638212",
      formattedTracking: "9400 1118 9956 2537 6382 12",
      carrier: "USPS",
      service: "Priority Mail®",
      amount: "8.45",
      currency: "USD",
      fromAddress: {
        name: "Dr. Steve Brule",
        company: "Brule Inc.",
        street1: "179 N Harbor Dr",
        city: "Redondo Beach",
        state: "CA",
        zip: "90277"
      },
      toAddress: {
        name: "Cal Naughton Jr.",
        company: "Naughton Racing",
        street1: "42 Fast Track Way",
        city: "Charlotte",
        state: "NC",
        zip: "28202"
      },
      parcel: { length: 10, width: 7, height: 4, weight: 24 },
      status: "IN_TRANSIT",
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      deliveryDate: new Date(Date.now() + 86400000 * 2).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric"
      })
    };
    await db.saveShipment(demoShipment);
  }
}

/**
 * Register Service Worker for offline PWA operation
 */
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js", { scope: "./" })
        .then((registration) => {
          console.log("Velox PWA Service Worker active. Scope:", registration.scope);
        })
        .catch((error) => {
          console.warn("Velox Service Worker registration failed:", error);
        });
    });
  }
}

/**
 * Live Network Connection Monitor for warehouse/offline usage
 */
function setupNetworkMonitor() {
  const updateStatus = () => {
    const isOnline = navigator.onLine;
    const badge = document.getElementById("connection-status-badge");
    if (badge) {
      if (isOnline) {
        badge.textContent = "⚡ Offline Ready";
        badge.className = "badge badge-success";
        badge.title = "App is cached locally. Operating with zero network latency.";
      } else {
        badge.textContent = "🟠 Offline Mode";
        badge.className = "badge badge-warning";
        badge.title = "Operating disconnected. All shipments saved to local IndexedDB.";
      }
    }
  };

  window.addEventListener("online", updateStatus);
  window.addEventListener("offline", updateStatus);
  updateStatus();
}


