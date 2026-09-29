// Shared types for the card. Kept intentionally loose on the Home Assistant
// side (HomeAssistant / HassEntity) because we only import a handful of
// fields and don't want a hard dependency on custom-card-helpers' types.

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown> & {
    unit_of_measurement?: string;
    friendly_name?: string;
  };
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  // Only the bits we actually touch — real objects have much more.
  [key: string]: unknown;
}

/** Entity ids (or literal numbers, where noted) the card reads. All optional:
 * a module quietly hides the parts it can't compute from what's configured. */
export interface EntitiesConfig {
  /** Power drawn by the wallbox from the grid (W). */
  wallbox_power?: string;
  /** Wallbox's rated/limit power. A number (W) or an entity id; defaults to 7400 (7.4 kW single-phase). */
  wallbox_max?: string | number;
  /** Power actually reaching the car's battery (W or kW — unit is read from the entity). */
  battery_power?: string;
  /** Car's battery state of charge (%). */
  battery_soc?: string;
  /** Energy delivered this session (kWh). */
  session_energy?: string;
  /** Charging duration, in seconds, this session. */
  session_time?: string;
  /** Session cost, already computed, in the local currency. If absent and
   * `energy_cost_per_kwh` is set, the card computes it from session_energy. */
  session_cost?: string;
  /** Price per kWh (a number or an entity id) used to compute session_cost when missing. */
  energy_cost_per_kwh?: string | number;
  /** Grid power draw, for the energy-flow module (W). */
  grid_power?: string;
  /** Solar production, for the energy-flow module (W). */
  solar_power?: string;
  /** Home battery power, for the energy-flow module (W, positive = discharging). */
  home_battery_power?: string;
}

export type ModuleType = "gauge" | "energy_flow" | "stats" | "controls";

export interface ModuleConfig {
  type: ModuleType;
  enabled?: boolean; // default true
  [key: string]: unknown; // per-module overrides, added as modules grow
}

export interface CardConfig {
  type: string;
  entities?: EntitiesConfig;
  /** Ordered list of modules to render. Order in the array = order on screen. */
  modules?: ModuleConfig[];
}

export const DEFAULT_MODULES: ModuleConfig[] = [
  { type: "gauge", enabled: true },
  { type: "energy_flow", enabled: true },
  { type: "stats", enabled: true },
  { type: "controls", enabled: false },
];
