# Geovia map data

`geoviaWorldCountries.json` is generated from `world-atlas/countries-50m.json` (Natural Earth-derived data).
The generator merges Morocco (ISO numeric ID 504) and Western Sahara (732) into a single MultiPolygon feature for filling and hit-testing, while preserving other country features.

`geoviaWorldBorders.json` is a separate line layer generated from the same topology. Internal boundaries are omitted where adjacent source geometries map to the same canonical quiz country.

Regenerate both files from the frontend root with:

```bash
npm run build:map-data
```

This is an app-specific simplification for quiz behavior, not a statement about political status or sovereignty.
