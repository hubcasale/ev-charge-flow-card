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

/** Same idea as `resolveNumberOrEntity`, but for plain numbers (a price, a
 * count) that need no unit conversion — reads the entity's raw numeric state. */
export function resolveNumberOrEntityRaw(
  hass: HomeAssistant,
  value: string | number | undefined,
  fallback?: number
): number | undefined {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const v = stateNum(hass, value);
    if (v !== undefined) return v;
  }
  return fallback;
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

/** Reads an energy-like entity and normalises it to **kWh** (accepts Wh too). */
export function stateKwh(hass: HomeAssistant, entityId?: string): number | undefined {
  if (!entityId) return undefined;
  const st = hass.states[entityId];
  if (!st) return undefined;
  const v = parseFloat(st.state);
  if (!Number.isFinite(v)) return undefined;
  const unit = (st.attributes.unit_of_measurement || "").toLowerCase();
  if (unit === "wh") return v / 1000;
  return v; // "kwh", missing unit, or anything else: assume kWh.
}

/** Reads a duration-like entity and normalises it to **seconds** (accepts s/min/h/ms). */
export function stateSeconds(hass: HomeAssistant, entityId?: string): number | undefined {
  if (!entityId) return undefined;
  const st = hass.states[entityId];
  if (!st) return undefined;
  const v = parseFloat(st.state);
  if (!Number.isFinite(v)) return undefined;
  const unit = (st.attributes.unit_of_measurement || "").toLowerCase();
  if (unit === "ms") return v / 1000;
  if (unit === "min") return v * 60;
  if (unit === "h") return v * 3600;
  return v; // "s", missing unit, or anything else: assume seconds.
}

/** `HH:MM:SS`, always zero-padded — same format used across this project's
 * hand-tuned dashboards, kept here so every duration in the card matches. */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(hh)}:${pad(mm)}:${pad(ss)}`;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
  CHF: "CHF",
};

/** Best-effort currency symbol from `hass.config.currency`, falling back to '€'. */
export function currencySymbol(hass: HomeAssistant): string {
  const code = (hass as { config?: { currency?: string } }).config?.currency;
  if (code && CURRENCY_SYMBOLS[code]) return CURRENCY_SYMBOLS[code];
  return code ?? "€";
}
