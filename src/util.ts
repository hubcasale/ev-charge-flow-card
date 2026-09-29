import type { HomeAssistant } from "./types";

/** Reads an entity's numeric state, or `undefined` if it doesn't exist / isn't a number. */
export function stateNum(hass: HomeAssistant, entityId?: string): number | undefined {
  if (!entityId) return undefined;
  const st = hass.states[entityId];
  if (!st) return undefined;
  const v = parseFloat(st.state);
  return Number.isFinite(v) ? v : undefined;
}

/**
 * Reads a power-like entity and normalises it to **watts**, regardless of
 * whether the source reports W or kW. This is the crux of keeping the card
 * generic: a car's charge-power sensor is very often kW, a wallbox's is very
 * often W, and we don't want to guess by convention or hardcode per-brand.
 */
export function stateWatts(hass: HomeAssistant, entityId?: string): number | undefined {
  if (!entityId) return undefined;
  const st = hass.states[entityId];
  if (!st) return undefined;
  const v = parseFloat(st.state);
  if (!Number.isFinite(v)) return undefined;
  const unit = (st.attributes.unit_of_measurement || "").toLowerCase();
  if (unit === "kw") return v * 1000;
  return v; // "w", missing unit, or anything else: assume watts.
}

/** `config.wallbox_max` (etc.) can be a literal number or an entity id to read live. */
export function resolveNumberOrEntity(
  hass: HomeAssistant,
  value: string | number | undefined,
  fallback: number
): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const fromEntity = stateWatts(hass, value);
    if (fromEntity !== undefined) return fromEntity;
  }
  return fallback;
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}
