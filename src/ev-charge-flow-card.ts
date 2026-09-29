import { LitElement, html, css, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import "./modules/gauge-ring";
import "./modules/stats-grid";
import type { CardConfig, HomeAssistant, ModuleConfig } from "./types";
import { DEFAULT_MODULES } from "./types";

const CARD_TAG = "ev-charge-flow-card";
const CARD_VERSION = "0.2.0";

/**
 * A single Lovelace card bundling the visuals of an EV charging session:
 * a rotating power gauge (wallbox vs. what actually reaches the battery),
 * a stats grid (session energy / time / cost), plus, in later phases, an
 * energy-flow diagram. Every value is entity-driven and optional, so the
 * card degrades gracefully (see README) whatever subset of sensors you
 * actually have.
 *
 * Phase 2: `gauge` and `stats` are implemented. `energy_flow` and
 * `controls` entries are accepted in config (so a config written against
 * the final schema keeps working later) but are silently skipped until
 * they land.
 */
export class EvChargeFlowCard extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @state() private _config!: CardConfig;

  setConfig(config: CardConfig): void {
    if (!config || typeof config !== "object") {
      throw new Error("ev-charge-flow-card: configurazione non valida");
    }
    if (config.modules !== undefined && !Array.isArray(config.modules)) {
      throw new Error("ev-charge-flow-card: 'modules' deve essere un elenco");
    }
    this._config = {
      ...config,
      entities: config.entities ?? {},
      modules: config.modules ?? DEFAULT_MODULES,
    };
  }

  getCardSize(): number {
    const enabled = (this._config?.modules ?? []).filter((m) => m.enabled !== false);
    return Math.max(1, enabled.length * 2);
  }

  private _renderModule(m: ModuleConfig) {
    if (m.enabled === false) return nothing;
    switch (m.type) {
      case "gauge":
        return html`<ecf-gauge-ring
          .hass=${this.hass}
          .entities=${this._config.entities}
          .config=${m}
        ></ecf-gauge-ring>`;
      case "stats":
        return html`<ecf-stats-grid
          .hass=${this.hass}
          .entities=${this._config.entities}
          .config=${m}
        ></ecf-stats-grid>`;
      // 'energy_flow' and 'controls' land in later phases.
      default:
        return nothing;
    }
  }

  render() {
    if (!this._config || !this.hass) return nothing;
    return html`
      <ha-card>
        <div class="modules">
          ${(this._config.modules ?? []).map((m) => this._renderModule(m))}
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }
    .modules {
      display: flex;
      flex-direction: column;
      padding: 8px 0;
    }
  `;
}

customElements.define(CARD_TAG, EvChargeFlowCard);

// Registers the card in HA's "Add Card" picker with a name/description.
declare global {
  interface Window {
    customCards?: Array<Record<string, unknown>>;
  }
}
window.customCards = window.customCards || [];
window.customCards.push({
  type: CARD_TAG,
  name: "EV Charge Flow Card",
  description: "Rotating power gauge + energy flow for EV charging (wallbox + car).",
});

// eslint-disable-next-line no-console
console.info(
  `%c EV-CHARGE-FLOW-CARD %c v${CARD_VERSION} `,
  "color: white; background: #1b5e20; font-weight: 700;",
  "color: #1b5e20; background: white; font-weight: 700;"
);
