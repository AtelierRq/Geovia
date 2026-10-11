export type EuropeanCountry = {
  id: string
  name: string
  aliases?: string[]
  mapId: string
}

// Zakres quizu: 48 państw. Nazwy są polskie; aliasy służą do akceptowania
// popularnych wariantów i dawnych nazw.
export const europeCountries: EuropeanCountry[] = [
  { id: 'albania', name: 'Albania', mapId: '8' },
  { id: 'andorra', name: 'Andora', mapId: '20' },
  { id: 'austria', name: 'Austria', mapId: '40' },
  { id: 'belarus', name: 'Białoruś', mapId: '112' },
  { id: 'belgium', name: 'Belgia', mapId: '56' },
  { id: 'bosnia', name: 'Bośnia i Hercegowina', aliases: ['Bośnia'], mapId: '70' },
  { id: 'bulgaria', name: 'Bułgaria', mapId: '100' },
  { id: 'croatia', name: 'Chorwacja', mapId: '191' },
  { id: 'cyprus', name: 'Cypr', mapId: '196' },
  { id: 'czechia', name: 'Czechy', aliases: ['Republika Czeska'], mapId: '203' },
  { id: 'denmark', name: 'Dania', mapId: '208' },
  { id: 'estonia', name: 'Estonia', mapId: '233' },
  { id: 'finland', name: 'Finlandia', mapId: '246' },
  { id: 'france', name: 'Francja', mapId: '250' },
  { id: 'germany', name: 'Niemcy', mapId: '276' },
  { id: 'greece', name: 'Grecja', mapId: '300' },
  { id: 'hungary', name: 'Węgry', mapId: '348' },
  { id: 'iceland', name: 'Islandia', mapId: '352' },
  { id: 'ireland', name: 'Irlandia', mapId: '372' },
  { id: 'italy', name: 'Włochy', mapId: '380' },
  { id: 'kazakhstan', name: 'Kazachstan', mapId: '398' },
  { id: 'kosovo', name: 'Kosowo', mapId: '383' },
  { id: 'latvia', name: 'Łotwa', mapId: '428' },
  { id: 'liechtenstein', name: 'Liechtenstein', mapId: '438' },
  { id: 'lithuania', name: 'Litwa', mapId: '440' },
  { id: 'luxembourg', name: 'Luksemburg', mapId: '442' },
  { id: 'malta', name: 'Malta', mapId: '470' },
  { id: 'moldova', name: 'Mołdawia', aliases: ['Republika Mołdawii'], mapId: '498' },
  { id: 'monaco', name: 'Monako', mapId: '492' },
  { id: 'montenegro', name: 'Czarnogóra', mapId: '499' },
  { id: 'netherlands', name: 'Holandia', aliases: ['Niderlandy'], mapId: '528' },
  { id: 'north-macedonia', name: 'Macedonia Północna', aliases: ['Macedonia'], mapId: '807' },
  { id: 'norway', name: 'Norwegia', mapId: '578' },
  { id: 'poland', name: 'Polska', mapId: '616' },
  { id: 'portugal', name: 'Portugalia', mapId: '620' },
  { id: 'romania', name: 'Rumunia', mapId: '642' },
  { id: 'russia', name: 'Rosja', mapId: '643' },
  { id: 'san-marino', name: 'San Marino', mapId: '674' },
  { id: 'serbia', name: 'Serbia', mapId: '688' },
  { id: 'slovakia', name: 'Słowacja', mapId: '703' },
  { id: 'slovenia', name: 'Słowenia', mapId: '705' },
  { id: 'spain', name: 'Hiszpania', mapId: '724' },
  { id: 'sweden', name: 'Szwecja', mapId: '752' },
  { id: 'switzerland', name: 'Szwajcaria', mapId: '756' },
  { id: 'turkey', name: 'Turcja', mapId: '792' },
  { id: 'ukraine', name: 'Ukraina', mapId: '804' },
  { id: 'united-kingdom', name: 'Wielka Brytania', aliases: ['Zjednoczone Królestwo', 'Anglia'], mapId: '826' },
  { id: 'vatican', name: 'Watykan', aliases: ['Państwo Watykańskie'], mapId: '336' },
]

export function normalizeCountryName(value: string) {
  return value
    .trim()
    .toLocaleLowerCase('pl-PL')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[łŁ]/g, 'l')
    .replace(/[^a-z0-9]/g, '')
}
