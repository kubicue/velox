/**
 * Velox - <rate-selector> Custom Element
 * Compares live carrier rates and allows clean interactive selection.
 */

export class RateSelectorElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._rates = [];
    this._selectedRateId = null;
  }

  set rates(data) {
    this._rates = data || [];
    if (this._rates.length > 0 && !this._selectedRateId) {
      this._selectedRateId = this._rates[0].id;
    }
    this.render();
  }

  get selectedRate() {
    return this._rates.find(r => r.id === this._selectedRateId) || this._rates[0] || null;
  }

  connectedCallback() {
    this.render();
  }

  selectRate(rateId) {
    this._selectedRateId = rateId;
    this.render();
    this.dispatchEvent(new CustomEvent("rate-selected", {
      detail: { rate: this.selectedRate },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    if (!this._rates || this._rates.length === 0) {
      this.shadowRoot.innerHTML = `
        <style>
          .empty {
            padding: 1.5rem;
            text-align: center;
            color: #64748b;
            font-size: 0.9rem;
            border: 1px dashed #cbd5e1;
            border-radius: 8px;
          }
        </style>
        <div class="empty">Enter addresses and package dimensions to calculate live rates.</div>
      `;
      return;
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .rates-container {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .rate-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.875rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 150ms ease-in-out;
          background: #ffffff;
        }

        .rate-card:hover {
          border-color: #93c5fd;
          background-color: #f8fafc;
        }

        .rate-card.selected {
          border-color: #1e3a8a;
          background-color: #eff6ff;
          box-shadow: 0 0 0 1px #1e3a8a;
        }

        .rate-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .rate-carrier-icon {
          width: 38px;
          height: 38px;
          background-color: #1e3a8a;
          color: #ffffff;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 0.75rem;
        }

        .rate-carrier-icon.ups {
          background-color: #351c15;
          color: #ffb500;
        }

        .rate-title {
          font-weight: 700;
          font-size: 0.95rem;
          color: #0f172a;
        }

        .rate-sub {
          font-size: 0.8rem;
          color: #64748b;
        }

        .rate-price-section {
          text-align: right;
        }

        .rate-price {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
        }

        .rate-badge {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 9999px;
          background-color: #dcfce7;
          color: #15803d;
          margin-top: 2px;
        }
      </style>

      <div class="rates-container">
        ${this._rates.map(rate => {
          const isSelected = rate.id === this._selectedRateId;
          const isUps = (rate.carrier || "").toLowerCase().includes("ups");
          return `
            <div class="rate-card ${isSelected ? "selected" : ""}" data-id="${rate.id}">
              <div class="rate-info">
                <div class="rate-carrier-icon ${isUps ? "ups" : ""}">
                  ${isUps ? "UPS" : "USPS"}
                </div>
                <div>
                  <div class="rate-title">${rate.service}</div>
                  <div class="rate-sub">${rate.duration_terms} (${rate.days} business days)</div>
                </div>
              </div>
              <div class="rate-price-section">
                <div class="rate-price">$${rate.amount}</div>
                ${rate.badge ? `<span class="rate-badge">${rate.badge}</span>` : ""}
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;

    this.shadowRoot.querySelectorAll(".rate-card").forEach(el => {
      el.addEventListener("click", () => {
        this.selectRate(el.getAttribute("data-id"));
      });
    });
  }
}

if (!customElements.get("rate-selector")) {
  customElements.define("rate-selector", RateSelectorElement);
}
