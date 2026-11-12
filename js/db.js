/**
 * Velox - Native IndexedDB Storage Layer
 * Local-First, Zero-Dependency Persistence
 */

const DB_NAME = "velox_ship_db";
const DB_VERSION = 1;

class VeloxDB {
  constructor() {
    this._db = null;
    this._initPromise = this._init();
  }

  async _init() {
    if (typeof indexedDB === "undefined") {
      return null;
    }
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Shipments Store
        if (!db.objectStoreNames.contains("shipments")) {
          const shipmentStore = db.createObjectStore("shipments", { keyPath: "id" });
          shipmentStore.createIndex("createdAt", "createdAt", { unique: false });
          shipmentStore.createIndex("trackingNumber", "trackingNumber", { unique: true });
          shipmentStore.createIndex("status", "status", { unique: false });
        }

        // Address Book Store
        if (!db.objectStoreNames.contains("addresses")) {
          const addressStore = db.createObjectStore("addresses", { keyPath: "id" });
          addressStore.createIndex("name", "name", { unique: false });
          addressStore.createIndex("type", "type", { unique: false }); // 'from' or 'to'
        }

        // App Settings Store
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "key" });
        }
      };

      request.onsuccess = (event) => {
        this._db = event.target.result;
        resolve(this._db);
      };

      request.onerror = (event) => {
        console.error("IndexedDB initialization error:", event.target.error);
        reject(event.target.error);
      };
    });
  }

  async _getStore(storeName, mode = "readonly") {
    await this._initPromise;
    const tx = this._db.transaction(storeName, mode);
    return tx.objectStore(storeName);
  }

  /* --- Shipments API --- */
  async saveShipment(shipment) {
    const store = await this._getStore("shipments", "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.put(shipment);
      request.onsuccess = () => resolve(shipment);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  async getShipment(id) {
    const store = await this._getStore("shipments", "readonly");
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  async getShipmentByTracking(trackingNumber) {
    const store = await this._getStore("shipments", "readonly");
    const index = store.index("trackingNumber");
    return new Promise((resolve, reject) => {
      const request = index.get(trackingNumber.replace(/\s+/g, ""));
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  async getAllShipments() {
    const store = await this._getStore("shipments", "readonly");
    const index = store.index("createdAt");
    return new Promise((resolve, reject) => {
      const request = index.openCursor(null, "prev");
      const results = [];
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = (e) => reject(e.target.error);
    });
  }

  async deleteShipment(id) {
    const store = await this._getStore("shipments", "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve(true);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  /* --- Addresses API --- */
  async saveAddress(address) {
    const store = await this._getStore("addresses", "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.put(address);
      request.onsuccess = () => resolve(address);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  async getAllAddresses() {
    const store = await this._getStore("addresses", "readonly");
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  /* --- Settings API --- */
  async getSetting(key, defaultValue = null) {
    const store = await this._getStore("settings", "readonly");
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result ? request.result.value : defaultValue);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  async setSetting(key, value) {
    const store = await this._getStore("settings", "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.put({ key, value });
      request.onsuccess = () => resolve(value);
      request.onerror = (e) => reject(e.target.error);
    });
  }
}

export const db = new VeloxDB();
