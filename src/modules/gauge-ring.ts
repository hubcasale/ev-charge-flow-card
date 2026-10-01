import { LitElement, html, svg, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { EntitiesConfig, HomeAssistant, ModuleConfig } from "../types";
import { clamp, resolveNumberOrEntity, resolveNumberOrEntityRaw, stateNum, stateWatts } from "../util";

// The ring itself is 240px (radius 120). The SVG overlay (ticks, limit
// marker, SOC pointer + label) lives in a wider, concentric box so it has
// room to sit outside the ring without the ring's own overflow:hidden
// clipping it.
const RING_R = 120;
const OVERLAY_R = 150;
const OVERLAY_BOX = OVERLAY_R * 2;
const OVERLAY_CENTER = OVERLAY_R;

/** Point at `angleDeg` clockwise from 12 o'clock, `r` px from the overlay's centre. */
function polar(r: number, angleDeg: number): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: OVERLAY_CENTER + r * Math.cos(rad), y: OVERLAY_CENTER + r * Math.sin(rad) };
}

/**
 * Three concentric rings:
 *  - outermost: battery state of charge, 0-100% — a static clock-face fill
 *    (12 o'clock = 0%, sweeping clockwise), green, with 10%-step tick marks,
 *    a pointer + label at the current value, and a bold marker at the car's
 *    preset charge limit, if configured. Doesn't spin.
 *  - middle: wallbox power (how much the wallbox is drawing from the grid)
 *    — orange, spins clockwise.
 *  - innermost: power actually reaching the battery (what the car itself
 *    reports) — yellow, also spins clockwise.
 * Both power rings spin the same direction, at the same shared speed, in
 * phase from the same 0deg reference — so the two arcs stay directly
 * comparable *while they spin*, not just at a glance when stopped: the
 * wallbox arc reaches further than the battery arc by exactly the
 * conversion loss between the two, and that gap holds steady as both
 * rotate together. Each sweeps an arc proportional to power/max (a full
 * circle at max power), with a soft fade at the *tail* only — the head
 * (leading edge, in the direction of rotation) stays sharp. The shared
 * rotation speed scales with wallbox power: faster spin = more power right
 * now.
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
    .ring-wrap {
      position: relative;
      width: ${OVERLAY_BOX}px;
      height: ${OVERLAY_BOX}px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .ring {
      position: relative;
      width: 240px;
      height: 240px;
      border-radius: 50%;
      background: var(--ecf-bg, #1c1c1c);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .overlay {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .ring-layer {
      position: absolute;
      inset: 0;
      border-radius: 50%;
    }
    .ring-soc {
      background: var(--ecf-soc-gradient);
      -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 14px), #000 calc(100% - 14px));
      mask: radial-gradient(farthest-side, transparent calc(100% - 14px), #000 calc(100% - 14px));
      z-index: 0;
    }
    .ring-wallbox {
      background: var(--ecf-wallbox-gradient);
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
      animation: ecf-spin var(--ecf-wallbox-duration, 999s) linear infinite;
      z-index: 1;
    }
    .ring-battery {
      background: var(--ecf-battery-gradient);
      -webkit-mask: radial-gradient(
        farthest-side,
        transparent calc(100% - 54px),
        #000 calc(100% - 54px),
        #000 calc(100% - 40px),
        transparent calc(100% - 40px)
      );
      mask: radial-gradient(
        farthest-side,
        transparent calc(100% - 54px),
        #000 calc(100% - 54px),
        #000 calc(100% - 40px),
        transparent calc(100% - 40px)
      );
      animation: ecf-spin var(--ecf-battery-duration, 999s) linear infinite;
      z-index: 2;
    }
    @keyframes ecf-spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
    .label {
      position: relative;
      z-index: 3;
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
      color: var(--ecf-battery-text, #66bb6a);
      line-height: 1.2;
    }
    .wallbox {
      font-size: 15px;
      font-weight: bold;
      color: var(--ecf-wallbox-text, #ff9800);
      line-height: 1.2;
      margin-top: 2px;
    }
  `;

  /** Builds the tail-faded conic-gradient for one of the two animated (power) rings.
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

  /** The 10%-step tick marks around the SOC ring, like a clock face. */
  private static ticks() {
    const r1 = RING_R; // ring's outer edge
    const r2 = RING_R + 9;
    return Array.from({ length: 10 }, (_, i) => i * 36).map((deg) => {
      const a = polar(r1, deg);
      const b = polar(r2, deg);
      return svg`<line
        x1=${a.x}
        y1=${a.y}
        x2=${b.x}
        y2=${b.y}
        stroke="rgba(255,255,255,0.45)"
        stroke-width="1.5"
      />`;
    });
  }

  /** The bold tick marking the car's preset charge-limit, if configured. */
  private static limitMarker(limitPct: number) {
    const deg = clamp(limitPct, 0, 100) * 3.6;
    const a = polar(RING_R - 17, deg);
    const b = polar(RING_R + 13, deg);
    return svg`<line
      x1=${a.x}
      y1=${a.y}
      x2=${b.x}
      y2=${b.y}
      stroke="#ffd600"
      stroke-width="4"
      stroke-linecap="round"
    />`;
  }

  /** The pointer + label at the current SOC value. The label sits right
   * before the arrow (counter-clockwise of it) and tangent to the ring, so
   * it reads along the curve instead of overlapping the arrow. */
  private static socPointer(socPct: number) {
    const deg = clamp(socPct, 0, 100) * 3.6;
    const tip = polar(RING_R - 2, deg);
    const baseL = polar(RING_R + 14, deg - 5);
    const baseR = polar(RING_R + 14, deg + 5);
    // A few degrees back from the arrow so the label never crowds it.
    const labelAngle = ((deg - 8) % 360 + 360) % 360;
    const labelPt = polar(RING_R + 7, labelAngle);
    // A label rotated to follow the ring reads upside down on the bottom
    // half unless flipped 180°, which also flips which side is "before".
    const flip = labelAngle > 90 && labelAngle < 270;
    const rotation = flip ? labelAngle + 180 : labelAngle;
    const anchor = flip ? "start" : "end";
    return svg`
      <polygon
        points="${tip.x},${tip.y} ${baseL.x},${baseL.y} ${baseR.x},${baseR.y}"
        fill="#ffffff"
        stroke="#1c1c1c"
        stroke-width="0.75"
      />
      <text
        x=${labelPt.x}
        y=${labelPt.y}
        dy="4"
        text-anchor=${anchor}
        transform="rotate(${rotation} ${labelPt.x} ${labelPt.y})"
        font-size="15"
        font-weight="700"
        fill="#ffffff"
      >
        ${socPct.toFixed(0)}%
      </text>
    `;
  }

  render() {
    if (!this.hass) return nothing;
    const e = this.entities;

    const p = stateWatts(this.hass, e.wallbox_power); // wallbox draw, W
    const pb = stateWatts(this.hass, e.battery_power); // reaching the battery, W
    const soc = stateNum(this.hass, e.battery_soc); // %
    const maxP = resolveNumberOrEntity(this.hass, e.wallbox_max, 7400);
    const chargeLimit = resolveNumberOrEntityRaw(this.hass, e.charge_limit, undefined);

    const hasWallbox = p !== undefined && maxP > 0;
    const hasBattery = pb !== undefined && maxP > 0;
    const hasSoc = soc !== undefined;

    const fracWallbox = hasWallbox ? clamp(p! / maxP, 0, 1) : 0;
    const fracBattery = hasBattery ? clamp(pb! / maxP, 0, 1) : 0;
    const arcWallbox = fracWallbox * 360;
    const arcBattery = fracBattery * 360;
    const fadeWallbox = Math.min(arcWallbox / 3, 30);
    const fadeBattery = Math.min(arcBattery / 3, 30);
    // Both rings share one speed (driven by wallbox power, the session's
    // overall rate) so they stay in phase and their arc-length difference
    // stays comparable throughout the spin, not just when stopped.
    // 8s at (near) zero power down to 0.6s at max power.
    const isActive = (hasWallbox && p! > 0) || (hasBattery && pb! > 0);
    const sharedFrac = hasWallbox ? fracWallbox : fracBattery;
    const sharedDuration = isActive ? 8 - 7.4 * sharedFrac : 999;

    const wallboxGradient = EcfGaugeRing.gradient(arcWallbox, fadeWallbox, "#e65100", "#ffb74d", true);
    const batteryGradient = EcfGaugeRing.gradient(arcBattery, fadeBattery, "#f57f17", "#ffee58", true);

    // Static clock-face fill: 12 o'clock = 0%, sweeping clockwise to 100%.
    const arcSoc = hasSoc ? clamp(soc! / 100, 0, 1) * 360 : 0;
    const socGradient = hasSoc
      ? `conic-gradient(from 0deg,` +
        `#66bb6a 0deg,` +
        `#66bb6a ${arcSoc.toFixed(1)}deg,` +
        `rgba(255, 255, 255, 0.1) ${arcSoc.toFixed(1)}deg,` +
        `rgba(255, 255, 255, 0.1) 360deg)`
      : "transparent";

    const resa =
      hasWallbox && hasBattery && p! > 0 ? Math.round((pb! / p!) * 100) : undefined;

    const style = `
      --ecf-soc-gradient: ${socGradient};
      --ecf-wallbox-gradient: ${wallboxGradient};
      --ecf-battery-gradient: ${batteryGradient};
      --ecf-wallbox-duration: ${sharedDuration}s;
      --ecf-battery-duration: ${sharedDuration}s;
    `;

    return html`
      <div class="ring-wrap">
        <div class="ring" style=${style}>
          <div class="ring-layer ring-soc"></div>
          <div class="ring-layer ring-wallbox"></div>
          <div class="ring-layer ring-battery"></div>
          <div class="label">
            ${soc !== undefined ? html`<div class="soc">${soc.toFixed(0)}%</div>` : nothing}
            ${hasBattery ? html`<div class="battery">${(pb! / 1000).toFixed(2)} kW</div>` : nothing}
            ${hasWallbox
              ? html`<div class="wallbox">
                  ${(p! / 1000).toFixed(2)} kW${resa !== undefined ? html` · ${resa}%` : nothing}
                </div>`
              : nothing}
          </div>
        </div>
        ${hasSoc
          ? svg`
              <svg class="overlay" viewBox="0 0 ${OVERLAY_BOX} ${OVERLAY_BOX}">
                ${EcfGaugeRing.ticks()}
                ${chargeLimit !== undefined ? EcfGaugeRing.limitMarker(chargeLimit) : nothing}
                ${EcfGaugeRing.socPointer(soc!)}
              </svg>
            `
          : nothing}
      </div>
    `;
  }
}
