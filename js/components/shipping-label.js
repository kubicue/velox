/**
 * Velox - <shipping-label> Custom Element
 * Renders an authentic 4" x 6" thermal label directly in the browser DOM.
 */

import { generateBarcodeSVG } from "../barcode.js";

export class ShippingLabelElement extends HTMLElement {
  static get observedAttributes() {
    return ["tracking", "service", "carrier"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._shipment = null;
  }

  set shipment(data) {
    this._shipment = data;
    this.render();
  }

  get shipment() {
    return this._shipment;
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const s = this._shipment || {
      trackingNumber: this.getAttribute("tracking") || "9400111899562537638212",
      carrier: this.getAttribute("carrier") || "USPS",
      service: this.getAttribute("service") || "USPS Ground Advantage™",
      fromAddress: {
        name: "SHIPPER NAME",
        company: "VELOX LOGISTICS",
        street1: "123 COMMERCE WAY",
        city: "SANTA MONICA",
        state: "CA",
        zip: "90401"
      },
      toAddress: {
        name: "JONATHAN DOE",
        company: "ACME CORP",
        street1: "456 MARKET ST",
        city: "NEW YORK",
        state: "NY",
        zip: "10001"
      },
      parcel: { weight: 16 }
    };

    const trackingClean = (s.trackingNumber || "").replace(/\s+/g, "");
    const formattedTracking = trackingClean.match(/.{1,4}/g)?.join(" ") || trackingClean;
    const barcodeSvg = generateBarcodeSVG(trackingClean, { height: 75, moduleWidth: 2.2 });
    const isInternal = (s.carrier || "").toLowerCase().includes("internal") || (s.service || "").toLowerCase().includes("internal");
    const isPriority = (s.service || "").toLowerCase().includes("priority");
    const bannerTitle = isInternal ? "INTERNAL POINT OF SHIPPING / DISPATCH" : isPriority ? "PRIORITY MAIL 2-DAY®" : "USPS GROUND ADVANTAGE™";
    const indiciaContent = isInternal ? `
      INTERNAL STAGING<br>
      NO POSTAGE REQ<br>
      STATION VERIFIED
    ` : `
      US POSTAGE PAID<br>
      ePostage<br>
      Velox Ship
    `;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .label-container {
          width: 4in;
          min-height: 6in;
          background: #ffffff;
          color: #000000;
          border: 2px solid #000000;
          font-family: Arial, Helvetica, sans-serif;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          position: relative;
          user-select: none;
        }

        .header {
          display: flex;
          border-bottom: 2px solid #000000;
          height: 0.9in;
        }

        .carrier-logo {
          flex: 1;
          padding: 0.08in;
          border-right: 2px solid #000000;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .carrier-name {
          font-size: 1.25rem;
          font-weight: 900;
          line-height: 1;
          letter-spacing: -0.03em;
        }

        .carrier-sub {
          font-size: 0.72rem;
          font-weight: bold;
          margin-top: 2px;
        }

        .postage-indicia {
          width: 1.45in;
          padding: 0.06in;
          text-align: center;
          font-size: 0.65rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          line-height: 1.2;
        }

        .indicia-box {
          border: 1px solid #000000;
          padding: 4px;
          width: 90%;
          font-weight: bold;
        }

        .banner {
          background-color: #000000;
          color: #ffffff;
          text-align: center;
          font-weight: 900;
          font-size: 1.05rem;
          letter-spacing: 0.05em;
          padding: 0.05in 0;
          text-transform: uppercase;
        }

        .addresses {
          padding: 0.08in;
          border-bottom: 2px solid #000000;
          min-height: 1.7in;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .from-section {
          font-size: 0.7rem;
          line-height: 1.2;
          text-transform: uppercase;
        }

        .to-section {
          margin-left: 0.25in;
          font-size: 0.95rem;
          font-weight: 700;
          line-height: 1.25;
          text-transform: uppercase;
        }

        .to-name {
          font-size: 1.15rem;
          font-weight: 900;
        }

        .barcode-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0.1in 0.05in;
          border-bottom: 2px solid #000000;
        }

        .barcode-wrap {
          width: 96%;
          display: flex;
          justify-content: center;
        }

        .barcode-wrap svg {
          width: 100%;
          height: 1.1in;
        }

        .tracking-digits {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.95rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          margin-top: 0.04in;
          text-align: center;
        }

        .footer {
          display: flex;
          height: 0.75in;
        }

        .routing-code {
          flex: 1;
          padding: 0.08in;
          border-right: 2px solid #000000;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .routing-zip {
          font-size: 1.35rem;
          font-weight: 900;
          letter-spacing: 0.05em;
        }

        .meta {
          width: 1.5in;
          padding: 0.08in;
          font-size: 0.65rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          line-height: 1.25;
        }
      </style>

      <div class="label-container">
        <div class="header">
          <div class="carrier-logo">
            <span class="carrier-name">${s.carrier || "USPS"}</span>
            <span class="carrier-sub">${s.service || "Ground Advantage"}</span>
          </div>
          <div class="postage-indicia">
            <div class="indicia-box">
              ${indiciaContent}
            </div>
          </div>
        </div>

        <div class="banner">${bannerTitle}</div>

        <div class="addresses">
          <div class="from-section">
            <div>${s.fromAddress?.name || "Sender"}</div>
            ${s.fromAddress?.company ? `<div>${s.fromAddress.company}</div>` : ""}
            <div>${s.fromAddress?.street1 || ""} ${s.fromAddress?.street2 || ""}</div>
            <div>${s.fromAddress?.city || ""}, ${s.fromAddress?.state || ""} ${s.fromAddress?.zip || ""}</div>
          </div>

          <div class="to-section">
            <div style="font-size: 0.7rem; font-weight: normal; margin-bottom: 2px;">SHIP TO:</div>
            <div class="to-name">${s.toAddress?.name || "Recipient"}</div>
            ${s.toAddress?.company ? `<div>${s.toAddress.company}</div>` : ""}
            <div>${s.toAddress?.street1 || ""} ${s.toAddress?.street2 || ""}</div>
            <div>${s.toAddress?.city || ""}, ${s.toAddress?.state || ""} ${s.toAddress?.zip || ""}</div>
          </div>
        </div>

        <div class="barcode-section">
          <div class="barcode-wrap">
            ${barcodeSvg}
          </div>
          <div class="tracking-digits">USPS TRACKING # ${formattedTracking}</div>
        </div>

        <div class="footer">
          <div class="routing-code">
            <span style="font-size: 0.65rem;">ZIP / POSTAL CODE</span>
            <span class="routing-zip">${s.toAddress?.zip || "10001"}</span>
          </div>
          <div class="meta">
            <div><strong>Wt:</strong> ${s.parcel?.weight || 16} oz</div>
            <div><strong>Date:</strong> ${new Date(s.createdAt || Date.now()).toLocaleDateString()}</div>
            <div><strong>ID:</strong> ${(s.id || "VELOX").substring(0, 12)}</div>
          </div>
        </div>
      </div>
    `;
  }
}

if (!customElements.get("shipping-label")) {
  customElements.define("shipping-label", ShippingLabelElement);
}

