import { LitElement, html, css, nothing, svg } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { EntitiesConfig, HomeAssistant, ModuleConfig } from "../types";
import { clamp, resolveNumberOrEntity, stateWatts } from "../util";

/**
 * Where the car's charging power is coming from: up to three sources (solar,
 * grid, home battery) on the left, each with a line to the car on the right.
 * Built from scratch — straight lines with a moving-dash animation, not a
 * general home-energy Sankey diagram (see power-flow-card-plus for that);
 * this one only cares about what's feeding the charging session.
 *
 * Direction and speed follow the same visual language as the gauge module:
 * faster-moving dashes = more power right now. Grid and solar are always
 * "sources" (dashes flow left → right, into the car). A home battery is the
 * one bidirectional case: positive power = discharging (flows toward the
 * car, like the others); negative = charging from the session's surplus
 * (dashes reverse, flowing right → left, into the battery). This assumes
 * the common HA convention of positive = discharging for a battery power
 * sensor; if yours reports the opposite, the module still animates, just
 * backwards — worth a config override in a later pass if it comes up.
 */
@customElement("ecf-energy-flow")
export class EcfEnergyFlow extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) entities: EntitiesConfig = {};
  @property({ attribute: false }) config: ModuleConfig = { type: "energy_flow" };

  static styles = css`
    :host {
      display: block;
    }
    .wrap {
      position: relative;
      width: 100%;
      max-width: 320px;
      margin: 0 auto;
      aspect-ratio: 240 / 200;
    }
    svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }
    line {
      stroke: var(--ecf-flow-line-color, #555);
      stroke-width: 2;
      stroke-dasharray: 6 6;
    }
    @keyframes ecf-flow-dash {
      to {
        stroke-dashoffset: -24;
      }
    }
    .node {
      position: absolute;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 1px;
      width: 64px;
    }
    .node ha-icon {
      color: var(--secondary-text-color);
      --mdc-icon-size: 20px;
    }
    .node .value {
      font-size: 12px;
      font-weight: 600;
      color: var(--primary-text-color);
      white-space: nowrap;
    }
    .node .label {
      font-size: 10px;
      color: var(--secondary-text-color);
    }
  `;

  private static readonly BOX_W = 240;
  private static readonly BOX_H = 200;
  private static readonly LEFT_X = 40;
  private static readonly RIGHT_X = 200;
  private static readonly RIGHT_Y = 100;

  private static pct(x: number, y: number): { left: string; top: string } {
    return {
      left: `${(x / EcfEnergyFlow.BOX_W) * 100}%`,
      top: `${(y / EcfEnergyFlow.BOX_H) * 100}%`,
    };
  }

  private _node(icon: string, watts: number, label: string, x: number, y: number) {
    const { left, top } = EcfEnergyFlow.pct(x, y);
    return html`
      <div class="node" style="left:${left};top:${top}">
        <ha-icon icon=${icon}></ha-icon>
        <div class="value">${(watts / 1000).toFixed(2)} kW</div>
        <div class="label">${label}</div>
      </div>
    `;
  }

  private _line(x1: number, y1: number, x2: number, y2: number, watts: number, maxW: number, reverse: boolean) {
    const frac = clamp(Math.abs(watts) / maxW, 0, 1);
    const flowing = Math.abs(watts) > 0;
    const dur = flowing ? 3 - 2.5 * frac : 999; // 3s idle down to 0.5s at full power
    const style = flowing
      ? `animation: ecf-flow-dash ${dur}s linear infinite; animation-direction: ${
          reverse ? "reverse" : "normal"
        };`
      : "";
    return svg`<line x1=${x1} y1=${y1} x2=${x2} y2=${y2} style=${style}></line>`;
  }

  render() {
    if (!this.hass) return nothing;
    const e = this.entities;

    const wallboxW = stateWatts(this.hass, e.wallbox_power);
    if (wallboxW === undefined) return nothing; // nothing to show the car receiving

    const maxW = resolveNumberOrEntity(this.hass, e.wallbox_max, 7400);

    const sources: Array<{ icon: string; label: string; watts: number; reverse: boolean }> = [];
    const solarW = stateWatts(this.hass, e.solar_power);
    if (solarW !== undefined) sources.push({ icon: "mdi:solar-power", label: "Solare", watts: solarW, reverse: false });
    const gridW = stateWatts(this.hass, e.grid_power);
    if (gridW !== undefined) sources.push({ icon: "mdi:transmission-tower", label: "Rete", watts: gridW, reverse: false });
    const battW = stateWatts(this.hass, e.home_battery_power);
    if (battW !== undefined)
      sources.push({
        icon: "mdi:home-battery",
        label: "Batteria casa",
        watts: battW,
        reverse: battW < 0, // negative = charging: dashes flow into it, not out of it
      });

    if (sources.length === 0) {
      // Nothing to show *coming from* anywhere — just the car itself.
      return html`
        <div class="wrap">
          ${this._node("mdi:car-electric", wallboxW, "Auto", EcfEnergyFlow.RIGHT_X, EcfEnergyFlow.RIGHT_Y)}
        </div>
      `;
    }

    const n = sources.length;
    const ys = sources.map((_, i) => ((i + 1) / (n + 1)) * EcfEnergyFlow.BOX_H);

    return html`
      <div class="wrap">
        <svg viewBox="0 0 ${EcfEnergyFlow.BOX_W} ${EcfEnergyFlow.BOX_H}">
          ${sources.map((s, i) =>
            this._line(EcfEnergyFlow.LEFT_X, ys[i], EcfEnergyFlow.RIGHT_X, EcfEnergyFlow.RIGHT_Y, s.watts, maxW, s.reverse)
          )}
        </svg>
        ${sources.map((s, i) => this._node(s.icon, s.watts, s.label, EcfEnergyFlow.LEFT_X, ys[i]))}
        ${this._node("mdi:car-electric", wallboxW, "Auto", EcfEnergyFlow.RIGHT_X, EcfEnergyFlow.RIGHT_Y)}
      </div>
    `;
  }
}
