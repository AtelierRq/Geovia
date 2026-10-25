# Geovia map data

The map data is generated from `world-atlas/countries-50m.json` (Natural Earth-derived data).

`geoviaWorldCountries.json` is the fill/hit-testing layer. The generator combines these source geometries into one quiz feature:
- Morocco + Western Sahara -> Morocco (`504`)
- Somalia + Somaliland -> Somalia (`706`)
- Cyprus + North Cyprus -> Cyprus (`196`)

`geoviaWorldBorders.json` is a separate shared-border layer. The generator omits internal borders where adjacent source geometries map to the same canonical quiz country. Both map pages use these generated layers.

Regenerate from the frontend root:

```bash
npm run build:map-data
```

These merges are app-specific quiz/map behavior and do not assert political status or sovereignty.
