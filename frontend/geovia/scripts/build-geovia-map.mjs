/**
 * Build Geovia's border layer from the Natural Earth-derived world-atlas topology.
 * Country polygons remain independent for filling and interaction; shared borders
 * are omitted when both adjacent geometries map to the same quiz country.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { feature, mesh, merge } from 'topojson-client';
import world from 'world-atlas/countries-50m.json' with { type: 'json' };

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Map source geography IDs (ISO numeric codes) to the quiz's canonical country ID.
// Keep these aliases in sync with MAP_ID_ALIASES in both map pages.
const aliases = {
  '304': '208', // Greenland -> Denmark
  '732': '504', // Western Sahara -> Morocco
};
const normalizedId = (id) => String(id ?? '').replace(/^0+/, '');
const canonicalId = (geometry) => aliases[normalizedId(geometry.id)] ?? normalizedId(geometry.id);

const countriesObject = world.objects.countries;
const sourceFeatures = feature(world, countriesObject).features;
const moroccoGeometry = countriesObject.geometries.find((geometry) => normalizedId(geometry.id) === '504');
const westernSaharaGeometry = countriesObject.geometries.find((geometry) => normalizedId(geometry.id) === '732');
if (!moroccoGeometry || !westernSaharaGeometry) {
  throw new Error('Could not find Morocco (504) and Western Sahara (732) in world-atlas topology.');
}
const mergedMorocco = {
  type: 'Feature',
  id: '504',
  properties: { name: 'Morocco', geoviaMergedIds: ['504', '732'] },
  geometry: merge(world, [moroccoGeometry, westernSaharaGeometry]),
};
const fillFeatures = sourceFeatures
  .filter((item) => !['504', '732'].includes(normalizedId(item.id)))
  .concat(mergedMorocco);
const fillOutput = { type: 'FeatureCollection', features: fillFeatures };
const fillDestination = path.resolve(__dirname, '../src/data/map/geoviaWorldCountries.json');
fs.writeFileSync(fillDestination, `${JSON.stringify(fillOutput)}\n`);
console.log(`Wrote ${fillDestination} (${fillFeatures.length} country features; Morocco + Western Sahara merged)`);


const borders = mesh(
  world,
  world.objects.countries,
  (a, b) => canonicalId(a) !== canonicalId(b),
);

// mesh() returns GeoJSON coordinates, not TopoJSON delta-encoded arcs. Store it
// as GeoJSON FeatureCollection so react-simple-maps renders the exact linework.
const output = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    properties: {
      source: 'world-atlas / Natural Earth-derived 1:50m',
      purpose: 'Borders excluding internal boundaries between areas mapped to the same quiz country',
    },
    geometry: borders,
  }],
};

const destination = path.resolve(__dirname, '../src/data/map/geoviaWorldBorders.json');
fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.writeFileSync(destination, `${JSON.stringify(output)}\n`);
console.log(`Wrote ${destination} (${borders.coordinates.length} border lines)`);
