import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { CardConfig, EntitiesConfig, HomeAssistant, ModuleConfig, ModuleType } from "./types";

/**
 * Visual config editor (Settings → this card → "Edit in visual editor").
 * Two parts: an entity picker per field the modules can use, and a module
 * list where you toggle each one on/off and move it up/down (no drag —
 * see README for why up/down buttons were chosen over drag-and-drop).
 *
 * All of this only ever fires `config-changed` with a full, valid config;
 * it never mutates `this._config` in place, so undo/redo in the dashboard
 * editor keeps working as HA expects.
 */

interface EntityField {
  key: keyof EntitiesConfig;
  label: string;
  hint?: string;
  /** Plain number-or-entity fields get a text input instead of an entity picker. */
  numberOrEntity?: boolean;
}

const ENTITY_FIELDS: EntityField[] = [
  { key: "wallbox_power", label: "Potenza wallbox" },
  { key: "wallbox_max", label: "Potenza massima wallbox (W, o id entità)", numberOrEntity: true },
  { key: "battery_power", label: "Potenza alla batteria" },
  { key: "battery_soc", label: "Percentuale batteria" },
  { key: "session_energy", label: "Energia sessione" },
  { key: "session_time", label: "Tempo sessione" },
  { key: "session_cost", label: "Costo sessione (se già calcolato)" },
  { key: "energy_cost_per_kwh", label: "Prezzo per kWh (numero, o id entità)", numberOrEntity: true },
  { key: "grid_power", label: "Potenza rete", hint: "per il flusso energia — modulo non ancora attivo" },
  { key: "solar_power", label: "Potenza fotovoltaico", hint: "per il flusso energia — modulo non ancora attivo" },
  { key: "home_battery_power", label: "Potenza batteria di casa", hint: "per il flusso energia — modulo non ancora attivo" },
];

const MODULE_LABELS: Record<ModuleType, string> = {
  gauge: "Quadrante rotante",
  stats: "Statistiche (energia / tempo / costo)",
  energy_flow: "Flusso energia (non ancora attivo)",
  controls: "Comandi (non ancora attivo)",
};

const ALL_MODULE_TYPES: ModuleType[] = ["gauge", "stats", "energy_flow", "controls"];

function fireConfigChanged(el: HTMLElement, config: CardConfig): void {
  el.dispatchEvent(
    new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true })
  );
}

/** Every known module type, in the order the config already has them,
 * with any missing type appended (disabled) so the editor always shows
 * the full set — even for a config written before a new module existed. */
function withAllModuleTypes(modules: ModuleConfig[] | undefined): ModuleConfig[] {
  const list = modules ? [...modules] : [];
  const present = new Set(list.map((m) => m.type));
  for (const type of ALL_MODULE_TYPES) {
    if (!present.has(type)) list.push({ type, enabled: false });
  }
  return list;
}

@customElement("ev-charge-flow-card-editor")
export class EvChargeFlowCardEditor extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @state() private _config!: CardConfig;

  setConfig(config: CardConfig): void {
    this._config = config;
  }

  static styles = css`
    :host {
      display: block;
    }
    .section {
      margin: 16px 0 8px;
      font-weight: 600;
      color: var(--primary-text-color);
    }
    .hint {
      font-size: 12px;
      color: var(--secondary-text-color);
      margin: -4px 0 6px;
    }
    ha-entity-picker,
    ha-textfield {
      display: block;
      margin-bottom: 8px;
    }
    .module-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 0;
      border-bottom: 1px solid var(--divider-color, #444);
    }
    .module-name {
      flex: 1;
    }
    .module-row ha-icon-button {
      --mdc-icon-button-size: 32px;
    }
  `;

  private _entityChanged(key: keyof EntitiesConfig, value: string) {
    const entities: EntitiesConfig = { ...this._config.entities, [key]: value === "" ? undefined : value };
    fireConfigChanged(this, { ...this._config, entities });
  }

  private _numberOrEntityChanged(key: keyof EntitiesConfig, raw: string) {
    let value: string | number | undefined = raw.trim() === "" ? undefined : raw.trim();
    if (typeof value === "string") {
      const n = Number(value);
      if (Number.isFinite(n) && value !== "") value = n;
    }
    const entities: EntitiesConfig = { ...this._config.entities, [key]: value };
    fireConfigChanged(this, { ...this._config, entities });
  }

  private _toggleModule(index: number, modules: ModuleConfig[]) {
    const next = modules.map((m, i) => (i === index ? { ...m, enabled: !(m.enabled !== false) } : m));
    fireConfigChanged(this, { ...this._config, modules: next });
  }

  private _moveModule(index: number, delta: number, modules: ModuleConfig[]) {
    const target = index + delta;
    if (target < 0 || target >= modules.length) return;
    const next = [...modules];
    [next[index], next[target]] = [next[target], next[index]];
    fireConfigChanged(this, { ...this._config, modules: next });
  }

  render() {
    if (!this._config || !this.hass) return nothing;
    const entities = this._config.entities ?? {};
    const modules = withAllModuleTypes(this._config.modules);

    return html`
      <div class="section">Entità</div>
      ${ENTITY_FIELDS.map((f) =>
        f.numberOrEntity
          ? html`
              <ha-textfield
                .label=${f.label}
                .value=${String(entities[f.key] ?? "")}
                @change=${(e: Event) =>
                  this._numberOrEntityChanged(f.key, (e.target as HTMLInputElement).value)}
              ></ha-textfield>
            `
          : html`
              ${f.hint ? html`<div class="hint">${f.hint}</div>` : nothing}
              <ha-entity-picker
                .hass=${this.hass}
                .label=${f.label}
                .value=${entities[f.key] ?? ""}
                allow-custom-entity
                @value-changed=${(e: CustomEvent) =>
                  this._entityChanged(f.key, (e.detail as { value: string }).value)}
              ></ha-entity-picker>
            `
      )}

      <div class="section">Moduli</div>
      ${modules.map(
        (m, i) => html`
          <div class="module-row">
            <ha-icon-button
              .disabled=${i === 0}
              .path=${"M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"}
              @click=${() => this._moveModule(i, -1, modules)}
            ></ha-icon-button>
            <ha-icon-button
              .disabled=${i === modules.length - 1}
              .path=${"M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"}
              @click=${() => this._moveModule(i, 1, modules)}
            ></ha-icon-button>
            <span class="module-name">${MODULE_LABELS[m.type]}</span>
            <ha-switch
              .checked=${m.enabled !== false}
              @change=${() => this._toggleModule(i, modules)}
            ></ha-switch>
          </div>
        `
      )}
    `;
  }
}
