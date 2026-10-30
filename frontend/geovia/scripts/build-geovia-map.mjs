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
import kosovoSource from '../src/data/map/geoviaKosovoSerbia.json' with { type: 'json' };

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Map source geography IDs (ISO numeric codes) to the quiz's canonical country ID.
// Keep these aliases in sync with MAP_ID_ALIASES in both map pages.
const aliases = {
  '304': '208', // Greenland -> Denmark
  '732': '504', // Western Sahara -> Morocco
};
const normalizedId = (id) => String(id ?? '').replace(/^0+/, '');
const isSourceKosovo = (geometry) =>
  String(geometry.properties?.name ?? '').trim().toLowerCase() === 'kosovo';
const canonicalId = (geometry) => {
  const id = normalizedId(geometry.id);
  if (id && aliases[id]) return aliases[id];
  const name = String(geometry.properties?.name ?? '').toLowerCase();
  if (name === 'w. sahara' || name === 'western sahara') return '504';
  if (name === 'somaliland') return '706';
  if (name === 'n. cyprus' || name === 'north cyprus') return '196';
  return id;
};

const countriesObject = world.objects.countries;
const sourceFeatures = feature(world, countriesObject).features;

function findGeometry({ id, names = [] }) {
  return countriesObject.geometries.find((geometry) =>
    (id != null && normalizedId(geometry.id) === String(id)) ||
    names.includes(String(geometry.properties?.name ?? '').toLowerCase())
  );
}

function mergeCountry({ id, name, members, mergedIds }) {
  const geometries = members.map((member) => findGeometry(member));
  if (geometries.some((geometry) => !geometry)) {
    throw new Error(`Could not find all source geometries for ${name}.`);
  }
  return {
    type: 'Feature',
    id: String(id),
    properties: { name, geoviaMergedIds: mergedIds.map(String) },
    geometry: merge(world, geometries),
  };
}

const mergeGroups = [
  {
    id: 504,
    name: 'Morocco',
    mergedIds: [504, 732],
    members: [{ id: 504 }, { id: 732, names: ['w. sahara', 'western sahara'] }],
  },
  {
    id: 706,
    name: 'Somalia',
    mergedIds: [706, 'Somaliland'],
    members: [{ id: 706 }, { names: ['somaliland'] }],
  },
  {
    id: 196,
    name: 'Cyprus',
    mergedIds: [196, 'N. Cyprus'],
    members: [{ id: 196 }, { names: ['n. cyprus', 'north cyprus'] }],
  },
];

const removedFeatureKeys = new Set(
  mergeGroups.flatMap((group) =>
    group.members.map((member) => {
      const geometry = findGeometry(member);
      return geometry ? `${geometry.id ?? ''}|${geometry.properties?.name ?? ''}` : '';
    }),
  ),
);
const mergedFeatures = mergeGroups.map(mergeCountry);
const kosovoFeature = kosovoSource.features.find((item) => item.properties?.name === 'Kosovo');
const clippedSerbiaFeature = kosovoSource.features.find((item) => item.properties?.name === 'Serbia');
if (!kosovoFeature || !clippedSerbiaFeature) throw new Error('Kosovo source must include Kosovo and clipped Serbia features.');
// Keep the original Serbia polygon underneath Kosovo as a fill-only safety net.
// The corrected Serbia geometry is used for border generation, but small coordinate
// differences between it and the Kosovo polygon must not expose the map background.
// Replace BOTH original Balkan features from world-atlas. The source dataset
// already contains a Kosovo feature (without an id), so merely appending our corrected Kosovo
// creates two independently filled Kosovo polygons. That mismatch is the source
// of the white slivers. Serbia must also be replaced by its clipped counterpart.
const replacedBalkanIds = new Set(['688', '383']); // Serbia, Kosovo
const fillFeatures = sourceFeatures
  .filter((item) =>
    !removedFeatureKeys.has(`${item.id ?? ''}|${item.properties?.name ?? ''}`)
    && !replacedBalkanIds.has(normalizedId(item.id))
    && !isSourceKosovo(item)
  )
  .concat(mergedFeatures, [clippedSerbiaFeature, kosovoFeature]);
const fillOutput = { type: 'FeatureCollection', features: fillFeatures };
const fillDestination = path.resolve(__dirname, '../src/data/map/geoviaWorldCountries.json');
fs.writeFileSync(fillDestination, `${JSON.stringify(fillOutput)}\n`);
console.log(`Wrote ${fillDestination} (${fillFeatures.length} features; merged Morocco, Somalia, Cyprus groups)`);

// Exclude BOTH original Serbia and Kosovo from the source mesh. The source
// topology's Kosovo border otherwise remains in the global mesh while the
// corrected Kosovo outline is added below, producing doubled/misaligned strokes.
// Add the corrected Balkan linework once, matching the replacement fill features.
const borders = mesh(
  world,
  world.objects.countries,
  (a, b) => canonicalId(a) !== canonicalId(b)
    && !['688', '383'].includes(normalizedId(a.id))
    && !['688', '383'].includes(normalizedId(b.id))
    && !isSourceKosovo(a)
    && !isSourceKosovo(b),
);
const correctedBalkanBoundaries = {
  type: 'MultiLineString',
  coordinates: [
    ...clippedSerbiaFeature.geometry.coordinates,
    ...kosovoFeature.geometry.coordinates,
  ],
};

// mesh() returns GeoJSON coordinates, not TopoJSON delta-encoded arcs. Store it
// as GeoJSON FeatureCollection so react-simple-maps renders the exact linework.
const output = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    properties: {
      source: 'world-atlas / Natural Earth-derived 1:50m plus corrected Kosovo/Serbia geometry',
      purpose: 'Borders excluding internal boundaries between areas mapped to the same quiz country; Serbia original outline replaced',
    },
    geometry: borders,
  }, {
    type: 'Feature',
    properties: { name: 'Corrected Serbia and Kosovo boundaries' },
    geometry: correctedBalkanBoundaries,
  }],
};

const destination = path.resolve(__dirname, '../src/data/map/geoviaWorldBorders.json');
fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.writeFileSync(destination, `${JSON.stringify(output)}\n`);
console.log(`Wrote ${destination} (${borders.coordinates.length} border lines)`);
