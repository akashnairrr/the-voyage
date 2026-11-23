// Question bank.
//
// Each prompt lists its valid answers from MOST common to RAREST. Tiers come
// from that order (see `ranked`), so to tune a prompt you only reorder its list:
//   - the last answer (last two for lists of 15+) is the top tier, 100 pts
//   - everything else is split evenly across tiers 1–5
// Write "Name|alias|alias" to accept other spellings.
//
// The order is hand-estimated for the pilot. Once real players exist, sort
// each list by how often answers are actually given.

import type { Tier } from '../domain/config';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Answer {
  name: string;
  aliases: string[];
  tier: Tier;
}

export interface Prompt {
  id: string;
  text: string;
  difficulty: Difficulty;
  answers: Answer[];
}

/** How many answers get the top tier: 1, or 2 for long lists. */
export const topTierCount = (answers: number) => (answers >= 15 ? 2 : 1);

/** Tier for the answer at `index` in a list of `count`, ranked common -> rare. */
export function tierForRank(index: number, count: number): Tier {
  const rest = count - topTierCount(count);
  if (index >= rest) return 6;
  return (1 + Math.floor((index * 5) / rest)) as Tier;
}

function ranked(id: string, difficulty: Difficulty, text: string, entries: string[]): Prompt {
  return {
    id,
    text,
    difficulty,
    answers: entries.map((entry, i) => {
      const [name, ...aliases] = entry.split('|');
      return { name, aliases, tier: tierForRank(i, entries.length) };
    }),
  };
}

export const PROMPTS: Prompt[] = [
  // ---------- Easy ----------
  ranked('planets', 'easy', 'Name a planet in our solar system.', [
    'Earth', 'Mars', 'Jupiter', 'Saturn', 'Venus', 'Mercury', 'Neptune', 'Uranus',
  ]),
  ranked('moon-phases', 'easy', 'Name a phase of the Moon.', [
    'Full Moon|Full', 'New Moon|New', 'Half Moon|Half', 'Crescent Moon|Crescent',
    'Gibbous Moon|Gibbous', 'First Quarter|First Quarter Moon',
    'Last Quarter|Third Quarter|Last Quarter Moon|Third Quarter Moon',
    'Waxing Crescent', 'Waning Gibbous', 'Waxing Gibbous', 'Waning Crescent',
  ]),
  ranked('space-objects', 'easy', 'Name a type of object you can find in space.', [
    'Star', 'Planet', 'Moon', 'Comet', 'Asteroid', 'Black Hole', 'Galaxy', 'Meteor',
    'Nebula', 'Satellite', 'Dwarf Planet', 'Supernova', 'Meteorite', 'Neutron Star',
    'White Dwarf', 'Red Giant', 'Exoplanet', 'Quasar', 'Pulsar', 'Brown Dwarf',
    'Star Cluster|Cluster|Globular Cluster', 'Meteoroid', 'Magnetar', 'Blazar',
  ]),
  ranked('astronauts', 'easy', 'Name an astronaut or cosmonaut (surname is enough).', [
    'Neil Armstrong|Armstrong', 'Buzz Aldrin|Aldrin', 'Yuri Gagarin|Gagarin',
    'Kalpana Chawla|Chawla', 'Sunita Williams|Suni Williams', 'Rakesh Sharma',
    'Valentina Tereshkova|Tereshkova', 'Sally Ride', 'John Glenn', 'Michael Collins',
    'Shubhanshu Shukla|Shukla', 'Alan Shepard|Shepard', 'Chris Hadfield|Hadfield',
    'Mae Jemison|Jemison', 'Jim Lovell|Lovell', 'Scott Kelly', 'Tim Peake|Peake',
    'Gene Cernan|Cernan', 'Alexei Leonov|Leonov', 'Christina Koch',
    'Peggy Whitson|Whitson', 'Samantha Cristoforetti|Cristoforetti',
    'Thomas Pesquet|Pesquet', 'Pete Conrad', 'Gus Grissom|Grissom', 'Yang Liwei',
  ]),
  ranked('space-movies', 'easy', 'Name a movie set in space or on another world.', [
    'Star Wars', 'Interstellar', 'Gravity', 'The Martian', 'Avatar', 'Star Trek',
    'Alien', 'Guardians of the Galaxy', 'Apollo 13', 'Dune', 'WALL-E|Walle',
    '2001: A Space Odyssey|2001|A Space Odyssey|Space Odyssey', 'Armageddon', 'Passengers',
    'Ad Astra', 'Lightyear', 'First Man', 'Prometheus', 'Elysium', 'Event Horizon',
    'Sunshine', 'Moon', 'Life', 'Mission to Mars', 'Solaris', 'Red Planet',
  ]),
  ranked('space-agencies', 'easy', 'Name a national or international space agency.', [
    'NASA|National Aeronautics and Space Administration',
    'ISRO|Indian Space Research Organisation|Indian Space Research Organization',
    'ESA|European Space Agency', 'Roscosmos', 'JAXA|Japan Aerospace Exploration Agency',
    'CNSA|China National Space Administration', 'CSA|Canadian Space Agency',
    'UK Space Agency|UKSA', 'CNES', 'DLR|German Aerospace Center', 'ASI|Italian Space Agency',
    'UAE Space Agency', 'KASA|Korea AeroSpace Administration|KARI', 'Australian Space Agency',
    'Israel Space Agency', 'SUPARCO', 'Brazilian Space Agency|AEB',
  ]),
  ranked('constellations', 'easy', 'Name a constellation.', [
    'Orion', 'Ursa Major|Great Bear', 'Leo', 'Scorpius|Scorpio', 'Taurus', 'Gemini',
    'Sagittarius', 'Aries', 'Virgo', 'Libra', 'Aquarius', 'Pisces', 'Cancer',
    'Capricornus|Capricorn', 'Cassiopeia', 'Ursa Minor|Little Bear', 'Andromeda', 'Pegasus',
    'Cygnus', 'Perseus', 'Draco', 'Hercules', 'Lyra', 'Aquila', 'Centaurus',
    'Crux|Southern Cross', 'Canis Major', 'Canis Minor', 'Hydra', 'Phoenix', 'Bootes',
    'Auriga', 'Cepheus', 'Ophiuchus', 'Carina', 'Delphinus', 'Lupus', 'Corvus', 'Sagitta',
    'Vulpecula', 'Lacerta', 'Monoceros', 'Fornax', 'Sculptor', 'Pictor', 'Reticulum',
    'Musca', 'Chamaeleon', 'Tucana', 'Volans', 'Horologium', 'Octans', 'Norma', 'Indus',
    'Pavo', 'Grus', 'Camelopardalis', 'Microscopium',
  ]),

  // ---------- Medium ----------
  ranked('voyager-planets', 'medium', 'Name a planet that either Voyager spacecraft flew past.', [
    'Jupiter', 'Saturn', 'Neptune', 'Uranus',
  ]),
  ranked('stars', 'medium', 'Name a star other than the Sun.', [
    'Sirius', 'Polaris|North Star|Pole Star', 'Betelgeuse', 'Alpha Centauri|Rigil Kentaurus',
    'Proxima Centauri|Proxima', 'Vega', 'Rigel', 'Arcturus', 'Aldebaran', 'Antares',
    'Canopus', 'Altair', 'Deneb', 'Capella', 'Spica', 'Pollux', 'Castor', 'Regulus',
    'Fomalhaut', 'Bellatrix', 'Achernar', 'Algol', 'Mira', 'Mizar', 'Alcor',
    "Barnard's Star", 'Eta Carinae', 'Thuban', "Tabby's Star",
    'Gliese 445',
  ]),
  ranked('jupiter-moons', 'medium', 'Name a moon of Jupiter.', [
    'Io', 'Europa', 'Ganymede', 'Callisto', 'Amalthea', 'Himalia', 'Thebe', 'Metis',
    'Adrastea', 'Elara', 'Pasiphae', 'Sinope', 'Carme', 'Ananke', 'Leda', 'Lysithea',
    'Themisto', 'Callirrhoe',
  ]),
  ranked('saturn-moons', 'medium', 'Name a moon of Saturn.', [
    'Titan', 'Enceladus', 'Mimas', 'Rhea', 'Iapetus', 'Dione', 'Tethys', 'Hyperion',
    'Phoebe', 'Janus', 'Epimetheus', 'Pan', 'Atlas', 'Prometheus', 'Pandora', 'Daphnis',
    'Helene', 'Telesto', 'Calypso',
  ]),
  ranked('dwarf-planets', 'medium', 'Name a dwarf planet (or a widely accepted candidate).', [
    'Pluto', 'Ceres', 'Eris', 'Makemake', 'Haumea', 'Sedna', 'Quaoar', 'Orcus', 'Gonggong',
    'Salacia',
  ]),
  ranked('nasa-missions', 'medium', 'Name a NASA mission or spacecraft (past or present).', [
    'Apollo', 'Voyager', 'Hubble|Hubble Space Telescope',
    'James Webb|JWST|James Webb Space Telescope|Webb', 'Artemis', 'Curiosity', 'Perseverance',
    'Cassini|Cassini-Huygens', 'Juno', 'New Horizons', 'Pioneer', 'Opportunity', 'Spirit',
    'Galileo', 'Kepler', 'Viking', 'Gemini', 'Mercury|Project Mercury', 'Skylab',
    'Parker Solar Probe|Parker', 'Ingenuity', 'Europa Clipper', 'Mariner', 'Spitzer',
    'Chandra', 'Dawn', 'InSight', 'OSIRIS-REx', 'DART', 'TESS', 'Sojourner',
    'MESSENGER', 'Magellan', 'Lucy', 'Psyche', 'Stardust', 'Deep Impact', 'MAVEN',
    'LRO|Lunar Reconnaissance Orbiter', 'WISE|NEOWISE', 'GRAIL',
  ]),
  ranked('rockets', 'medium', 'Name a rocket or launch vehicle.', [
    'Saturn V|Saturn 5', 'Falcon 9', 'Starship', 'Space Shuttle', 'PSLV', 'GSLV', 'Falcon Heavy',
    'Soyuz', 'SLS|Space Launch System', 'Ariane 5', 'LVM3|GSLV Mk III|GSLV Mark III',
    'Atlas V', 'Ariane 6', 'Long March', 'New Glenn', 'Delta IV|Delta IV Heavy', 'Electron',
    'Vostok', 'Titan|Titan IIIE', 'Proton', 'Vulcan|Vulcan Centaur', 'H3', 'H-IIA|H2A',
    'Vega', 'Antares', 'Redstone', 'Energia', 'N1',
  ]),
  ranked('astronomers', 'medium', 'Name a famous astronomer or space scientist (surname is enough).', [
    'Galileo Galilei|Galileo', 'Isaac Newton|Newton', 'Stephen Hawking|Hawking',
    'Nicolaus Copernicus|Copernicus', 'Johannes Kepler|Kepler', 'Albert Einstein|Einstein',
    'Edwin Hubble|Hubble', 'Carl Sagan|Sagan', 'Neil deGrasse Tyson|Tyson|deGrasse Tyson',
    'Aryabhata', 'Vikram Sarabhai|Sarabhai', 'A. P. J. Abdul Kalam|Abdul Kalam|APJ Abdul Kalam|Kalam',
    'Tycho Brahe|Tycho|Brahe', 'Edmond Halley|Halley', 'Ptolemy', 'William Herschel|Herschel',
    'Subrahmanyan Chandrasekhar|Chandrasekhar', 'Gerard Kuiper|Kuiper', 'Vera Rubin|Rubin',
    'Giovanni Cassini|Cassini', 'Christiaan Huygens|Huygens', 'Charles Messier|Messier',
    'Clyde Tombaugh|Tombaugh', 'Arthur Eddington|Eddington',
    'Henrietta Swan Leavitt|Leavitt|Henrietta Leavitt', 'Annie Jump Cannon|Cannon',
    'Jocelyn Bell Burnell|Bell Burnell', 'Urbain Le Verrier|Le Verrier|Leverrier',
    'Johann Galle|Galle', 'Brahmagupta', 'Percival Lowell|Lowell', 'Frank Drake|Drake',
    'Hipparchus', 'Cecilia Payne-Gaposchkin|Payne-Gaposchkin|Cecilia Payne',
  ]),
  ranked('galaxies', 'medium', 'Name a galaxy.', [
    'Milky Way', 'Andromeda|Andromeda Galaxy|M31', 'Triangulum|Triangulum Galaxy|M33',
    'Large Magellanic Cloud|LMC', 'Small Magellanic Cloud|SMC', 'Whirlpool|Whirlpool Galaxy|M51',
    'Sombrero|Sombrero Galaxy|M104', 'Pinwheel|Pinwheel Galaxy|M101', 'Messier 87|M87',
    'Cartwheel|Cartwheel Galaxy', 'Black Eye|Black Eye Galaxy|M64', 'Cigar|Cigar Galaxy|M82',
    "Bode's Galaxy|M81", 'Centaurus A', 'Sunflower|Sunflower Galaxy|M63',
    'Tadpole|Tadpole Galaxy', 'Antennae|Antennae Galaxies',
    'Sagittarius Dwarf|Sagittarius Dwarf Galaxy', 'IC 1101', "Hoag's Object",
  ]),
  ranked('isro-missions', 'medium', 'Name an ISRO mission or satellite (past or planned).', [
    'Chandrayaan|Chandrayaan-1|Chandrayaan-2|Chandrayaan-3',
    'Mangalyaan|Mars Orbiter Mission|MOM', 'Aditya-L1|Aditya', 'Gaganyaan',
    'Aryabhata', 'AstroSat', 'NISAR', 'XPoSat', 'SpaDeX', 'Cartosat', 'RISAT', 'INSAT',
    'GSAT', 'NavIC|IRNSS', 'Oceansat', 'Kalpana-1|METSAT', 'Rohini', 'Bhaskara',
    'Shukrayaan',
  ]),

  // ---------- Hard ----------
  ranked('uranus-moons', 'hard', 'Name a moon of Uranus.', [
    'Miranda', 'Titania', 'Oberon', 'Ariel', 'Umbriel', 'Puck', 'Cordelia', 'Ophelia',
    'Bianca', 'Cressida', 'Desdemona', 'Juliet', 'Portia', 'Rosalind', 'Belinda', 'Perdita',
    'Mab', 'Cupid', 'Caliban', 'Sycorax', 'Prospero', 'Setebos', 'Stephano', 'Trinculo',
    'Francisco', 'Margaret', 'Ferdinand',
  ]),
  ranked('neptune-moons', 'hard', 'Name a moon of Neptune.', [
    'Triton', 'Nereid', 'Proteus', 'Larissa', 'Galatea', 'Despina', 'Thalassa', 'Naiad',
    'Halimede', 'Sao', 'Laomedeia', 'Psamathe', 'Neso', 'Hippocamp',
  ]),
  ranked('golden-record-music', 'hard', 'Name a composer or musician whose music is on the Voyager Golden Record.', [
    'Johann Sebastian Bach|Bach|J.S. Bach', 'Ludwig van Beethoven|Beethoven',
    'Wolfgang Amadeus Mozart|Mozart', 'Chuck Berry|Berry', 'Igor Stravinsky|Stravinsky',
    'Louis Armstrong|Armstrong', 'Blind Willie Johnson', 'Kesarbai Kerkar|Kerkar',
    'Valya Balkanska|Balkanska', 'Guan Pinghu', 'Anthony Holborne|Holborne',
  ]),
];
