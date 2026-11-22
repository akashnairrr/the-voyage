// Pilot question bank. Every prompt has many valid answers; each answer has a
// placeholder rarity tier (1 = obvious, 6 = obscure). The tiers are
// hand-estimated for the pilot — once real players exist, replace them with
// tiers computed from how often each answer is actually given.

import type { Tier } from '../domain/config';

export interface Answer {
  name: string;
  aliases: string[];
  tier: Tier;
}

export interface Prompt {
  id: string;
  text: string;
  answers: Answer[];
}

const a = (tier: Tier, name: string, ...aliases: string[]): Answer => ({ name, aliases, tier });

export const PROMPTS: Prompt[] = [
  {
    id: 'voyager-planets',
    text: 'Name a planet that either Voyager spacecraft flew past.',
    answers: [a(1, 'Jupiter'), a(2, 'Saturn'), a(3, 'Neptune'), a(4, 'Uranus')],
  },
  {
    id: 'jupiter-moons',
    text: 'Name a moon of Jupiter.',
    answers: [
      a(1, 'Io'), a(1, 'Europa'), a(2, 'Ganymede'), a(3, 'Callisto'),
      a(5, 'Amalthea'), a(5, 'Himalia'), a(6, 'Thebe'), a(6, 'Metis'),
      a(6, 'Adrastea'), a(6, 'Elara'), a(6, 'Pasiphae'), a(6, 'Sinope'),
      a(6, 'Carme'), a(6, 'Ananke'), a(6, 'Leda'), a(6, 'Lysithea'),
      a(6, 'Themisto'), a(6, 'Callirrhoe'),
    ],
  },
  {
    id: 'saturn-moons',
    text: 'Name a moon of Saturn.',
    answers: [
      a(1, 'Titan'), a(2, 'Enceladus'), a(3, 'Mimas'), a(3, 'Rhea'),
      a(4, 'Iapetus'), a(4, 'Dione'), a(4, 'Tethys'), a(5, 'Hyperion'),
      a(5, 'Phoebe'), a(5, 'Janus'), a(6, 'Epimetheus'), a(6, 'Pan'),
      a(6, 'Atlas'), a(6, 'Prometheus'), a(6, 'Pandora'), a(6, 'Daphnis'),
      a(6, 'Helene'), a(6, 'Telesto'), a(6, 'Calypso'),
    ],
  },
  {
    id: 'uranus-moons',
    text: 'Name a moon of Uranus.',
    answers: [
      a(2, 'Miranda'), a(2, 'Titania'), a(2, 'Oberon'), a(3, 'Ariel'),
      a(4, 'Umbriel'), a(5, 'Puck'), a(6, 'Cordelia'), a(6, 'Ophelia'),
      a(6, 'Bianca'), a(6, 'Cressida'), a(6, 'Desdemona'), a(6, 'Juliet'),
      a(6, 'Portia'), a(6, 'Rosalind'), a(6, 'Belinda'), a(6, 'Perdita'),
      a(6, 'Mab'), a(6, 'Cupid'), a(6, 'Caliban'), a(6, 'Sycorax'),
      a(6, 'Prospero'), a(6, 'Setebos'), a(6, 'Stephano'), a(6, 'Trinculo'),
      a(6, 'Francisco'), a(6, 'Margaret'), a(6, 'Ferdinand'),
    ],
  },
  {
    id: 'neptune-moons',
    text: 'Name a moon of Neptune.',
    answers: [
      a(1, 'Triton'), a(3, 'Nereid'), a(4, 'Proteus'), a(5, 'Larissa'),
      a(6, 'Galatea'), a(6, 'Despina'), a(6, 'Thalassa'), a(6, 'Naiad'),
      a(6, 'Halimede'), a(6, 'Sao'), a(6, 'Laomedeia'), a(6, 'Psamathe'),
      a(6, 'Neso'), a(6, 'Hippocamp'),
    ],
  },
  {
    id: 'dwarf-planets',
    text: 'Name a dwarf planet (or a widely accepted candidate).',
    answers: [
      a(1, 'Pluto'), a(2, 'Ceres'), a(3, 'Eris'), a(4, 'Haumea'),
      a(4, 'Makemake'), a(5, 'Sedna'), a(5, 'Quaoar'), a(6, 'Gonggong'),
      a(6, 'Orcus'), a(6, 'Salacia'),
    ],
  },
  {
    id: 'space-agencies',
    text: 'Name a national or international space agency.',
    answers: [
      a(1, 'NASA', 'National Aeronautics and Space Administration'),
      a(2, 'ISRO', 'Indian Space Research Organisation', 'Indian Space Research Organization'),
      a(2, 'ESA', 'European Space Agency'),
      a(3, 'JAXA', 'Japan Aerospace Exploration Agency'),
      a(3, 'Roscosmos'),
      a(4, 'CNSA', 'China National Space Administration'),
      a(4, 'CSA', 'Canadian Space Agency'),
      a(5, 'UK Space Agency', 'UKSA'),
      a(5, 'DLR', 'German Aerospace Center'),
      a(5, 'CNES'),
      a(6, 'ASI', 'Italian Space Agency'),
      a(6, 'KASA', 'Korea AeroSpace Administration', 'KARI'),
      a(6, 'UAE Space Agency'),
      a(6, 'Australian Space Agency'),
      a(6, 'Israel Space Agency'),
      a(6, 'SUPARCO'),
      a(6, 'Brazilian Space Agency', 'AEB'),
    ],
  },
  {
    id: 'constellations',
    text: 'Name a constellation.',
    answers: [
      a(1, 'Orion'), a(1, 'Ursa Major', 'Great Bear'), a(2, 'Cassiopeia'),
      a(2, 'Scorpius', 'Scorpio'), a(2, 'Leo'), a(2, 'Taurus'), a(2, 'Gemini'),
      a(2, 'Sagittarius'), a(2, 'Aries'), a(2, 'Virgo'), a(2, 'Libra'),
      a(2, 'Aquarius'), a(2, 'Pisces'), a(2, 'Cancer'),
      a(3, 'Capricornus', 'Capricorn'), a(3, 'Ursa Minor', 'Little Bear'),
      a(3, 'Cygnus'), a(3, 'Andromeda'), a(3, 'Perseus'), a(3, 'Pegasus'),
      a(4, 'Lyra'), a(4, 'Draco'), a(4, 'Aquila'), a(4, 'Centaurus'),
      a(4, 'Crux', 'Southern Cross'), a(4, 'Hercules'), a(4, 'Canis Major'),
      a(5, 'Bootes'), a(5, 'Auriga'), a(5, 'Cepheus'), a(5, 'Ophiuchus'),
      a(5, 'Carina'), a(5, 'Canis Minor'), a(5, 'Hydra'), a(5, 'Delphinus'),
      a(5, 'Phoenix'), a(6, 'Monoceros'), a(6, 'Camelopardalis'),
      a(6, 'Fornax'), a(6, 'Sculptor'), a(6, 'Pictor'), a(6, 'Reticulum'),
      a(6, 'Vulpecula'), a(6, 'Lacerta'), a(6, 'Lupus'), a(6, 'Corvus'),
      a(6, 'Sagitta'), a(6, 'Musca'), a(6, 'Chamaeleon'), a(6, 'Tucana'),
      a(6, 'Volans'), a(6, 'Horologium'), a(6, 'Octans'), a(6, 'Norma'),
      a(6, 'Indus'), a(6, 'Pavo'), a(6, 'Grus'),
    ],
  },
  {
    id: 'nasa-missions',
    text: 'Name a NASA mission or spacecraft (past or present).',
    answers: [
      a(1, 'Apollo'), a(1, 'Voyager'), a(2, 'Hubble', 'Hubble Space Telescope'),
      a(2, 'Artemis'), a(2, 'James Webb', 'JWST', 'James Webb Space Telescope', 'Webb'),
      a(2, 'Curiosity'), a(2, 'Perseverance'), a(3, 'Cassini', 'Cassini-Huygens'),
      a(3, 'Juno'), a(3, 'New Horizons'), a(3, 'Pioneer'), a(3, 'Opportunity'),
      a(4, 'Galileo'), a(4, 'Kepler'), a(4, 'Viking'), a(4, 'Gemini'),
      a(4, 'Mercury', 'Project Mercury'), a(4, 'Skylab'), a(4, 'Spirit'),
      a(4, 'Parker Solar Probe', 'Parker'), a(4, 'Europa Clipper'), a(4, 'Ingenuity'),
      a(5, 'Mariner'), a(5, 'Spitzer'), a(5, 'Chandra'), a(5, 'Dawn'),
      a(5, 'MESSENGER'), a(5, 'Magellan'), a(5, 'InSight'), a(5, 'OSIRIS-REx', 'OSIRIS REx'),
      a(5, 'DART'), a(5, 'TESS'), a(5, 'Sojourner'), a(6, 'Lucy'), a(6, 'Psyche'),
      a(6, 'Stardust'), a(6, 'Deep Impact'), a(6, 'GRAIL'), a(6, 'MAVEN'),
      a(6, 'LRO', 'Lunar Reconnaissance Orbiter'), a(6, 'WISE', 'NEOWISE'),
    ],
  },
  {
    id: 'astronomers',
    text: 'Name a famous astronomer or space scientist (surname is enough).',
    answers: [
      a(1, 'Galileo Galilei', 'Galileo'), a(2, 'Nicolaus Copernicus', 'Copernicus'),
      a(2, 'Johannes Kepler', 'Kepler'), a(2, 'Isaac Newton', 'Newton'),
      a(2, 'Stephen Hawking', 'Hawking'), a(3, 'Edwin Hubble', 'Hubble'),
      a(3, 'Carl Sagan', 'Sagan'), a(3, 'Neil deGrasse Tyson', 'Tyson', 'deGrasse Tyson'),
      a(4, 'Tycho Brahe', 'Tycho', 'Brahe'), a(4, 'Edmond Halley', 'Halley'),
      a(4, 'William Herschel', 'Herschel'), a(4, 'Ptolemy'), a(4, 'Aryabhata'),
      a(5, 'Gerard Kuiper', 'Kuiper'), a(5, 'Vera Rubin', 'Rubin'),
      a(5, 'Giovanni Cassini', 'Cassini'), a(5, 'Christiaan Huygens', 'Huygens'),
      a(5, 'Charles Messier', 'Messier'), a(5, 'Clyde Tombaugh', 'Tombaugh'),
      a(5, 'Subrahmanyan Chandrasekhar', 'Chandrasekhar'),
      a(5, 'Arthur Eddington', 'Eddington'),
      a(6, 'Henrietta Swan Leavitt', 'Leavitt', 'Henrietta Leavitt'),
      a(6, 'Annie Jump Cannon', 'Cannon'), a(6, 'Jocelyn Bell Burnell', 'Bell Burnell'),
      a(6, 'Urbain Le Verrier', 'Le Verrier', 'Leverrier'), a(6, 'Johann Galle', 'Galle'),
      a(6, 'Brahmagupta'), a(6, 'Hipparchus'),
      a(6, 'Cecilia Payne-Gaposchkin', 'Payne-Gaposchkin', 'Cecilia Payne'),
      a(6, 'Percival Lowell', 'Lowell'), a(6, 'Frank Drake', 'Drake'),
    ],
  },
  {
    id: 'golden-record-music',
    text: 'Name a composer or musician whose music is on the Voyager Golden Record.',
    answers: [
      a(2, 'Johann Sebastian Bach', 'Bach', 'J.S. Bach'),
      a(2, 'Ludwig van Beethoven', 'Beethoven'),
      a(3, 'Wolfgang Amadeus Mozart', 'Mozart'), a(3, 'Chuck Berry', 'Berry'),
      a(4, 'Igor Stravinsky', 'Stravinsky'), a(4, 'Louis Armstrong', 'Armstrong'),
      a(5, 'Blind Willie Johnson'), a(6, 'Kesarbai Kerkar', 'Kerkar'),
      a(6, 'Valya Balkanska', 'Balkanska'), a(6, 'Guan Pinghu'),
      a(6, 'Anthony Holborne', 'Holborne'),
    ],
  },
  {
    id: 'stars',
    text: 'Name a star other than the Sun.',
    answers: [
      a(1, 'Sirius'), a(1, 'Polaris', 'North Star', 'Pole Star'), a(2, 'Betelgeuse'),
      a(3, 'Vega'), a(3, 'Rigel'), a(3, 'Alpha Centauri', 'Rigil Kentaurus'),
      a(3, 'Proxima Centauri', 'Proxima'), a(4, 'Arcturus'), a(4, 'Aldebaran'),
      a(4, 'Antares'), a(4, 'Canopus'), a(5, 'Capella'), a(5, 'Altair'),
      a(5, 'Deneb'), a(5, 'Spica'), a(5, 'Pollux'), a(5, 'Castor'), a(5, 'Regulus'),
      a(6, 'Fomalhaut'), a(6, 'Achernar'), a(6, 'Bellatrix'), a(6, 'Mira'),
      a(6, 'Algol'), a(6, "Barnard's Star", 'Barnards Star'), a(6, 'Gliese 445'),
      a(6, 'Mizar'), a(6, 'Alcor'), a(6, 'Thuban'), a(6, 'Eta Carinae'),
      a(6, "Tabby's Star", 'Tabbys Star'),
    ],
  },
];
