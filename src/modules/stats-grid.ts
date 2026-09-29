import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { EntitiesConfig, HomeAssistant, ModuleConfig } from "../types";
import {
  currencyIcon,
  currencySymbol,
  formatDuration,
  resolveNumberOrEntityRaw,
  stateKwh,
  stateNum,
  stateSeconds,
} from "../util";

/**
 * Up to three tiles: session energy, session duration, session cost. Each
 * tile only appears if the card can actually compute it — same
 * degrade-gracefully rule as the gauge module. Cost is read directly from
 * `session_cost` if you have that sensor, otherwise computed from
 * `session_energy × energy_cost_per_kwh` when both are available.
 */
@customElement("ecf-stats-grid")
export class EcfStatsGrid extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) entities: EntitiesConfig = {};
  @property({ attribute: false }) config: ModuleConfig = { type: "stats" };

  static styles = css`
    :host {
      display: block;
    }
    .grid {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: 1fr;
      gap: 8px;
      padding: 0 8px 8px;
    }
    .tile {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 2px;
    }
    ha-icon {
      color: var(--secondary-text-color);
      margin-bottom: 2px;
    }
    .value {
      font-size: 16px;
      font-weight: 600;
      color: var(--primary-text-color);
    }
    .label {
      font-size: 11px;
      color: var(--secondary-text-color);
    }
  `;

  private _tile(icon: string, value: string, label: string) {
    return html`
      <div class="tile">
        <ha-icon icon=${icon}></ha-icon>
        <div class="value">${value}</div>
        <div class="label">${label}</div>
      </div>
    `;
  }

  render() {
    if (!this.hass) return nothing;
    const e = this.entities;

    const energyKwh = stateKwh(this.hass, e.session_energy);
    const seconds = stateSeconds(this.hass, e.session_time);

    let cost: number | undefined = stateNum(this.hass, e.session_cost);
    if (cost === undefined && energyKwh !== undefined && e.energy_cost_per_kwh !== undefined) {
      const price = resolveNumberOrEntityRaw(this.hass, e.energy_cost_per_kwh);
      if (price !== undefined) cost = energyKwh * price;
    }

    const tiles = [
      energyKwh !== undefined
        ? this._tile("mdi:lightning-bolt-outline", `${energyKwh.toFixed(2)} kWh`, "Energia")
        : nothing,
      seconds !== undefined
        ? this._tile("mdi:timer-outline", formatDuration(seconds), "Tempo")
        : nothing,
      cost !== undefined
        ? this._tile(currencyIcon(this.hass), `${cost.toFixed(2)} ${currencySymbol(this.hass)}`, "Costo")
        : nothing,
    ].filter((t) => t !== nothing);

    if (tiles.length === 0) return nothing;
    return html`<div class="grid">${tiles}</div>`;
  }
}
