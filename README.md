# EV Charge Flow Card

A Home Assistant Lovelace card for an EV charging session: a rotating power
gauge (wallbox draw vs. what actually reaches the battery), and — as the
project grows — an energy-flow diagram and a small stats grid. One card,
drop it anywhere, point it at whatever entities you already have.

It doesn't assume any particular brand of wallbox or car: every value is an
entity you choose in the config, and the card quietly hides whatever part it
can't compute from what you've given it. Power sensors are read in whatever
unit they report (W or kW) — no need to convert anything yourself.

> 🚧 **Early days.** Gauge, stats and the visual editor exist so far (see
> [Roadmap](#roadmap)). The config schema below is the target shape; fields
> for modules that don't exist yet are accepted (so your config keeps
> working later) but have no visible effect until that module lands.

## Screenshot

_(coming once the module set is far enough along to be worth a picture)_

## Installation

### HACS (once published)

1. HACS → the three-dot menu → **Custom repositories** → add this
   repository's URL, category **Dashboard**.
2. Install **EV Charge Flow Card**.
3. Add the card to a dashboard (see [Configuration](#configuration)).

### Manual

1. Copy `dist/ev-charge-flow-card.js` to `<config>/www/ev-charge-flow-card.js`.
2. Settings → Dashboards → Resources → add
   `/local/ev-charge-flow-card.js` as a **JavaScript Module**.
3. Reload the dashboard.

## Configuration

```yaml
type: custom:ev-charge-flow-card
entities:
  # Power the wallbox is drawing from the grid.
  wallbox_power: sensor.my_wallbox_power
  # Wallbox's rated ceiling: a literal number in watts, or an entity id
  # (read live) if your wallbox exposes its configured max current/power.
  wallbox_max: 7400
  # Power actually reaching the car's battery, if your car integration
  # reports it (accepts W or kW — read from the entity's own unit).
  battery_power: sensor.my_car_charge_power
  # Car's state of charge, in %.
  battery_soc: sensor.my_car_battery
  # The rest are used by modules that aren't built yet — see Roadmap.
  session_energy: sensor.my_wallbox_session_energy
  session_time: sensor.my_wallbox_session_time
  grid_power: sensor.my_grid_power
  solar_power: sensor.my_solar_power
modules:
  - type: gauge
    enabled: true
  - type: stats
    enabled: true
  - type: energy_flow # not implemented yet — accepted, has no effect
    enabled: true
  - type: controls # not implemented yet — accepted, has no effect
    enabled: false
```

Every key under `entities` is optional. With only `wallbox_power` set you
get a single ring and one number; add the rest as you have them.

`modules` is an **ordered** list — the order you write is the order the
card renders top to bottom — with an `enabled` flag per entry. Use the
visual editor (Edit dashboard → this card → the pencil icon) to pick every
entity from a dropdown and reorder/enable modules with the up/down arrows
and a switch, rather than writing this YAML by hand — up/down instead of
drag-and-drop, for reliability across mouse, trackpad and touch alike.

### The gauge, briefly

Two rings, each an arc whose length is `power / wallbox_max` (a full circle
at max power) and whose rotation speed also scales with power — faster spin,
more power right now. The outer (green) ring is the wallbox; the inner
(orange) ring is what's reaching the battery. The gap between how far each
arc reaches is, visually, the conversion loss between the two. Centre reads,
top to bottom: battery %, power reaching the battery (big), wallbox power
and the resulting efficiency % (small).

### The stats grid, briefly

Up to three tiles — energy, duration, cost — each shown only if it can be
computed. Cost comes straight from `session_cost` if you have that sensor;
otherwise, given `session_energy` and `energy_cost_per_kwh` (a literal price
or an entity — a `input_number` you adjust by hand works fine), the card
multiplies them itself. The currency symbol follows `hass.config.currency`.

## Roadmap

- [x] Gauge module
- [x] Stats module (session energy / time / cost tiles)
- [x] Visual config editor (entity pickers, enable/reorder modules)
- [ ] Energy-flow module (grid → wallbox → battery, built from scratch —
      no dependency on another custom card)
- [ ] HACS listing

## Development

```bash
npm install
npm run build      # -> dist/ev-charge-flow-card.js
```

`dev/index.html` is a small standalone harness (sliders driving a mock
`hass`) for checking the gauge visually without a real Home Assistant
instance — serve the repo root with any static file server and open
`dev/index.html`. It isn't part of the published card.

## License

MIT — see [LICENSE](LICENSE).
