import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { EntitiesConfig, HomeAssistant, ModuleConfig } from "../types";
import { clamp, resolveNumberOrEntity, stateNum, stateWatts } from "../util";

/**
 * Two concentric rings:
 *  - outer: wallbox power (how much the wallbox is drawing from the grid)
 *  - inner: power actually reaching the battery (what the car itself reports)
 * Both rings sweep an arc proportional to power/max (a full circle at max
 * power), with a soft fade at the *tail* only — the head (leading edge, in
 * the direction of rotation) stays sharp. Rotation speed also scales with
 * power: faster spin = more power right now.
 *
 * This reproduces, as a real component, the button-card + card-mod hack
 * tuned by hand in HA before this card existed — see the project's README
 * for the reasoning behind each constant below.
 */
@customElement("ecf-gauge-ring")
export class EcfGaugeRing extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) entities: EntitiesConfig = {};
  @property({ attribute: false }) config: ModuleConfig = { type: "gauge" };

  static styles = css`
    :host {
      display: flex;
      justify-content: center;
      padding: 8px 0;
    }
    .ring {
      position: relative;
      width: 200px;
      height: 200px;
      border-radius: 50%;
      background: var(--ecf-bg, #1c1c1c);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .ring::before,
    .ring::after {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: 50%;
    }
    .ring::before {
      background: var(--ecf-outer-gradient);
      -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 14px), #000 calc(100% - 14px));
      mask: radial-gradient(farthest-side, transparent calc(100% - 14px), #000 calc(100% - 14px));
      animation: ecf-spin var(--ecf-outer-duration, 999s) linear infinite;
      z-index: 0;
    }
    .ring::after {
      background: var(--ecf-inner-gradient);
      -webkit-mask: radial-gradient(
        farthest-side,
        transparent calc(100% - 34px),
        #000 calc(100% - 34px),
        #000 calc(100% - 20px),
        transparent calc(100% - 20px)
      );
      mask: radial-gradient(
        farthest-side,
        transparent calc(100% - 34px),
        #000 calc(100% - 34px),
        #000 calc(100% - 20px),
        transparent calc(100% - 20px)
      );
      animation: ecf-spin-rev var(--ecf-inner-duration, 999s) linear infinite;
      z-index: 1;
    }
    @keyframes ecf-spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
    @keyframes ecf-spin-rev {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(-360deg);
      }
    }
    .label {
      position: relative;
      z-index: 2;
      text-align: center;
      font-family: var(--paper-font-body1_-_font-family, inherit);
    }
    .soc {
      font-size: 26px;
      font-weight: bold;
      color: var(--ecf-soc-color, #ffffff);
      line-height: 1.2;
    }
    .battery {
      font-size: 26px;
      font-weight: bold;
      color: var(--ecf-inner-bright, #66bb6a);
      line-height: 1.2;
    }
    .wallbox {
      font-size: 15px;
      font-weight: bold;
      color: var(--ecf-outer-bright, #ff9800);
      line-height: 1.2;
      margin-top: 2px;
    }
  `;

  /** Builds the tail-faded conic-gradient for one ring.
   * `spinsClockwise` decides which end is the "head" (sharp, no fade):
   * for a clockwise sweep the head is at the *end* of the arc (higher
   * angle), for a counter-clockwise sweep it's the opposite — the fade
   * must always land on the tail, never the head, regardless of direction. */
  private static gradient(
    arcDeg: number,
    fadeDeg: number,
    dark: string,
    bright: string,
    spinsClockwise: boolean
  ): string {
    const a = arcDeg.toFixed(1);
    const f = fadeDeg.toFixed(1);
    const mid = (arcDeg / 2).toFixed(1);
    // Clockwise rotation moves higher-angle content further clockwise over time,
    // i.e. the high-angle edge is the head; 0deg is the tail (needs the fade-in).
    // Counter-clockwise rotation is the mirror image: 0deg becomes the head.
    if (spinsClockwise) {
      // Head at the high-angle edge (sharp cutoff at `a`), tail at 0deg (fades in).
      return (
        `conic-gradient(from 0deg,` +
        `transparent 0deg,` +
        `${dark} ${f}deg,` +
        `${bright} ${mid}deg,` +
        `${dark} ${a}deg,` +
        `transparent ${a}deg,` +
        `transparent 360deg)`
      );
    }
    // Head at 0deg (sharp start), tail at the high-angle edge (fades out before the gap).
    return (
      `conic-gradient(from 0deg,` +
      `${dark} 0deg,` +
      `${bright} ${mid}deg,` +
      `${dark} ${(arcDeg - fadeDeg).toFixed(1)}deg,` +
      `transparent ${a}deg,` +
      `transparent 360deg)`
    );
  }

  render() {
    if (!this.hass) return nothing;
    const e = this.entities;

    const p = stateWatts(this.hass, e.wallbox_power); // wallbox draw, W
    const pb = stateWatts(this.hass, e.battery_power); // reaching the battery, W
    const soc = stateNum(this.hass, e.battery_soc); // %
    const maxP = resolveNumberOrEntity(this.hass, e.wallbox_max, 7400);

    const hasOuter = p !== undefined && maxP > 0;
    const hasInner = pb !== undefined && maxP > 0;

    const fracOuter = hasOuter ? clamp(p! / maxP, 0, 1) : 0;
    const fracInner = hasInner ? clamp(pb! / maxP, 0, 1) : 0;
    const arcOuter = fracOuter * 360;
    const arcInner = fracInner * 360;
    const fadeOuter = Math.min(arcOuter / 3, 30);
    const fadeInner = Math.min(arcInner / 3, 30);
    // 8s at (near) zero power down to 0.6s at max power.
    const durOuter = hasOuter && p! > 0 ? 8 - 7.4 * fracOuter : 999;
    const durInner = hasInner && pb! > 0 ? 8 - 7.4 * fracInner : 999;

    const outerGradient = EcfGaugeRing.gradient(arcOuter, fadeOuter, "#1b5e20", "#66bb6a", true);
    const innerGradient = EcfGaugeRing.gradient(arcInner, fadeInner, "#e65100", "#ffb74d", false);

    const resa =
      hasOuter && hasInner && p! > 0 ? Math.round((pb! / p!) * 100) : undefined;

    const style = `
      --ecf-outer-gradient: ${outerGradient};
      --ecf-inner-gradient: ${innerGradient};
      --ecf-outer-duration: ${durOuter}s;
      --ecf-inner-duration: ${durInner}s;
    `;

    return html`
      <div class="ring" style=${style}>
        <div class="label">
          ${soc !== undefined ? html`<div class="soc">${soc.toFixed(0)}%</div>` : nothing}
          ${hasInner ? html`<div class="battery">${(pb! / 1000).toFixed(2)} kW</div>` : nothing}
          ${hasOuter
            ? html`<div class="wallbox">
                ${(p! / 1000).toFixed(2)} kW${resa !== undefined ? html` · ${resa}%` : nothing}
              </div>`
            : nothing}
        </div>
      </div>
    `;
  }
}
