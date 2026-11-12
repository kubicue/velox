/**
 * Velox - <track-stepper> Custom Element
 * Package tracking milestone stepper component
 */

export class TrackStepperElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._data = null;
  }

  set trackingData(data) {
    this._data = data;
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    if (!this._data) {
      this.shadowRoot.innerHTML = `
        <style>
          .empty {
            padding: 2rem;
            text-align: center;
            color: #64748b;
            font-size: 0.95rem;
          }
        </style>
        <div class="empty">Enter a tracking number above to see shipment progress.</div>
      `;
      return;
    }

    const d = this._data;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .tracker-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .tracker-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 1rem;
          margin-bottom: 1.5rem;
        }

        .carrier-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 4px 8px;
          border-radius: 4px;
          background-color: #1e3a8a;
          color: #ffffff;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 9999px;
          background-color: #dcfce7;
          color: #15803d;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #15803d;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }

        .route-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          background: #f8fafc;
          padding: 1rem;
          border-radius: 8px;
        }

        .city-block {
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
        }

        .city-label {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: normal;
        }

        .arrow {
          font-size: 1.25rem;
          color: #94a3b8;
        }

        .timeline {
          position: relative;
          padding-left: 2rem;
        }

        .timeline::before {
          content: "";
          position: absolute;
          left: 7px;
          top: 10px;
          bottom: 10px;
          width: 2px;
          background-color: #cbd5e1;
        }

        .timeline-item {
          position: relative;
          margin-bottom: 1.5rem;
        }

        .timeline-item:last-child {
          margin-bottom: 0;
        }

        .timeline-bullet {
          position: absolute;
          left: -2rem;
          top: 3px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background-color: #1e3a8a;
          border: 3px solid #eff6ff;
        }

        .timeline-content {
          display: flex;
          flex-direction: column;
        }

        .event-status {
          font-weight: 700;
          font-size: 0.95rem;
          color: #0f172a;
        }

        .event-meta {
          font-size: 0.8rem;
          color: #64748b;
          margin-top: 2px;
        }
      </style>

      <div class="tracker-card">
        <div class="tracker-header">
          <div>
            <span class="carrier-badge">${d.carrier}</span>
            <span style="font-weight: 700; margin-left: 8px; font-size: 1.05rem;">${d.service}</span>
            <div style="font-family: monospace; font-size: 0.85rem; color: #64748b; margin-top: 4px;">
              Tracking: ${d.trackingNumber}
            </div>
          </div>
          <div>
            <span class="status-badge">
              <span class="status-dot"></span> In Transit
            </span>
            <div style="font-size: 0.75rem; color: #64748b; margin-top: 4px; text-align: right;">
              Est. Delivery: ${d.estimatedDelivery}
            </div>
          </div>
        </div>

        <div class="route-summary">
          <div class="city-block">
            <div class="city-label">Origin</div>
            ${d.origin}
          </div>
          <div class="arrow">➔</div>
          <div class="city-block" style="text-align: right;">
            <div class="city-label">Destination</div>
            ${d.destination}
          </div>
        </div>

        <div class="timeline">
          ${(d.events || []).map(evt => `
            <div class="timeline-item">
              <div class="timeline-bullet"></div>
              <div class="timeline-content">
                <span class="event-status">${evt.status}</span>
                <span class="event-meta">${evt.location} • ${evt.timestamp}</span>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }
}

if (!customElements.get("track-stepper")) {
  customElements.define("track-stepper", TrackStepperElement);
}

