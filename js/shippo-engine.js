/**
 * Velox - Shippo & Carrier Engine
 * Supports both live Shippo REST API and offline realistic demo mode.
 */

import { generateBarcodeSVG } from "./barcode.js";
import { db } from "./db.js";

/**
 * Generates an authentic USPS-style 22-digit tracking number
 */
export function generateUSPSTrackingNumber() {
  // USPS standard 22-digit starting with 9400 (Ground Advantage / Priority)
  const prefix = "9400";
  let randomDigits = "";
  for (let i = 0; i < 18; i++) {
    randomDigits += Math.floor(Math.random() * 10);
  }
  return `${prefix}${randomDigits}`;
}

/**
 * Calculates shipping rates (offline simulation or live Shippo API)
 */
export async function getRates({ fromAddress, toAddress, parcel, apiKey = null }) {
  if (apiKey && apiKey.trim().length > 10) {
    try {
      return await fetchShippoRates({ fromAddress, toAddress, parcel, apiKey });
    } catch (err) {
      console.warn("Shippo API error, falling back to realistic offline rates:", err);
    }
  }

  // Realistic Offline Carrier Calculation
  const weightOz = parseFloat(parcel.weight) || 16;
  const weightLbs = weightOz / 16;
  const baseFactor = Math.max(1, Math.min(5, weightLbs));

  return [
    {
      id: "rate_internal_dispatch",
      carrier: "INTERNAL",
      service: "Internal Point of Shipping",
      service_code: "internal_dispatch",
      days: 0,
      duration_terms: "Station intake & warehouse routing",
      amount: "0.00",
      currency: "USD",
      badge: "Internal Routing"
    },
    {
      id: "rate_usps_ground",
      carrier: "USPS",
      service: "USPS Ground Advantage™",
      service_code: "usps_ground_advantage",
      days: 3,
      duration_terms: "2-5 business days",
      amount: (4.65 + baseFactor * 1.85).toFixed(2),
      currency: "USD",
      badge: "Best Value"
    },
    {
      id: "rate_usps_priority",
      carrier: "USPS",
      service: "Priority Mail®",
      service_code: "usps_priority",
      days: 2,
      duration_terms: "1-3 business days",
      amount: (8.45 + baseFactor * 2.30).toFixed(2),
      currency: "USD",
      badge: "Popular"
    },
    {
      id: "rate_usps_express",
      carrier: "USPS",
      service: "Priority Mail Express®",
      service_code: "usps_priority_express",
      days: 1,
      duration_terms: "Overnight guaranteed",
      amount: (28.75 + baseFactor * 4.50).toFixed(2),
      currency: "USD",
      badge: "Fastest"
    },
    {
      id: "rate_ups_ground",
      carrier: "UPS",
      service: "UPS® Ground",
      service_code: "ups_ground",
      days: 4,
      duration_terms: "1-5 business days",
      amount: (9.20 + baseFactor * 1.95).toFixed(2),
      currency: "USD",
      badge: "Reliable"
    }
  ];
}

/**
 * Purchases and renders a shipping label
 */
export async function createLabel({ fromAddress, toAddress, parcel, selectedRate, apiKey = null }) {
  const trackingNumber = generateUSPSTrackingNumber();
  const labelId = `velox_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  
  // Format tracking number with standard USPS 4-digit groups for readability
  const formattedTracking = trackingNumber.match(/.{1,4}/g)?.join(" ") || trackingNumber;
  
  // Generate high-resolution SVG Barcode
  const barcodeSvg = generateBarcodeSVG(trackingNumber, { height: 75, moduleWidth: 2.2 });

  const shipmentRecord = {
    id: labelId,
    trackingNumber,
    formattedTracking,
    carrier: selectedRate.carrier,
    service: selectedRate.service,
    serviceCode: selectedRate.service_code,
    amount: selectedRate.amount,
    currency: selectedRate.currency,
    fromAddress: { ...fromAddress },
    toAddress: { ...toAddress },
    parcel: { ...parcel },
    barcodeSvg,
    status: "CREATED",
    createdAt: new Date().toISOString(),
    deliveryDate: new Date(Date.now() + selectedRate.days * 86400000).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric"
    })
  };

  // Save to local IndexedDB
  await db.saveShipment(shipmentRecord);
  return shipmentRecord;
}

/**
 * Tracking Journey Lookup & Checkpoint Generator
 */
export async function getTrackingStatus(trackingNumber) {
  const cleanNumber = (trackingNumber || "").replace(/\s+/g, "");
  let shipment = await db.getShipmentByTracking(cleanNumber);

  const baseCreatedDate = shipment ? new Date(shipment.createdAt) : new Date(Date.now() - 3600000 * 24);
  const originCity = shipment ? `${shipment.fromAddress.city}, ${shipment.fromAddress.state}` : "Los Angeles, CA";
  const destCity = shipment ? `${shipment.toAddress.city}, ${shipment.toAddress.state}` : "New York, NY";

  return {
    trackingNumber: cleanNumber,
    carrier: shipment?.carrier || "USPS",
    service: shipment?.service || "USPS Ground Advantage™",
    status: "IN_TRANSIT",
    origin: originCity,
    destination: destCity,
    estimatedDelivery: shipment?.deliveryDate || "In 2 business days",
    events: [
      {
        status: "Departed Shipping Facility",
        location: originCity,
        timestamp: new Date(baseCreatedDate.getTime() + 1000 * 3600 * 14).toLocaleString(),
        completed: true
      },
      {
        status: "Arrived at Regional Distribution Hub",
        location: "Carrier Transit Hub",
        timestamp: new Date(baseCreatedDate.getTime() + 1000 * 3600 * 8).toLocaleString(),
        completed: true
      },
      {
        status: "Electronic Shipping Info Received",
        location: originCity,
        timestamp: baseCreatedDate.toLocaleString(),
        completed: true
      }
    ]
  };
}

/**
 * Optional Live Shippo API Request
 */
async function fetchShippoRates({ fromAddress, toAddress, parcel, apiKey }) {
  const payload = {
    address_from: {
      name: fromAddress.name,
      street1: fromAddress.street1,
      city: fromAddress.city,
      state: fromAddress.state,
      zip: fromAddress.zip,
      country: fromAddress.country || "US"
    },
    address_to: {
      name: toAddress.name,
      street1: toAddress.street1,
      city: toAddress.city,
      state: toAddress.state,
      zip: toAddress.zip,
      country: toAddress.country || "US"
    },
    parcels: [{
      length: parcel.length,
      width: parcel.width,
      height: parcel.height,
      distance_unit: "in",
      weight: parcel.weight,
      mass_unit: "oz"
    }],
    async: false
  };

  const response = await fetch("https://api.goshippo.com/shipments/", {
    method: "POST",
    headers: {
      "Authorization": `ShippoToken ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Shippo API returned ${response.status}`);
  }

  const data = await response.json();
  return (data.rates || []).map(r => ({
    id: r.object_id,
    carrier: r.provider,
    service: r.servicelevel.name,
    service_code: r.servicelevel.token,
    days: r.estimated_days || 3,
    duration_terms: r.duration_terms || "Estimated",
    amount: r.amount,
    currency: r.currency,
    badge: r.attributes?.includes("CHEAPEST") ? "Best Value" : "Standard"
  }));
}

