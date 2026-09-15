import { STAFF_ASSIGNED_MANTLES } from '../config.js';

const normalize = (value) => String(value || '').trim().toLowerCase();

function matchCanonical(value, aliases) {
  const v = normalize(value);
  for (const [canonical, list] of Object.entries(aliases)) {
    if (list.includes(v)) return canonical;
  }
  return v;
}

const SPECIES_ALIASES = {
  human: ['human', 'humans'],
  metahuman: ['metahuman', 'meta-human', 'metahumans', 'meta-humans'],
  kryptonian: ['kryptonian', 'kryptonians'],
  atlantean: ['atlantean', 'atlanteans'],
  amazonian: ['amazonian', 'amazonians', 'amazon', 'amazons'],
  alien: ['alien', 'aliens', 'other alien'],
};

const AFFILIATION_ALIASES = {
  none: ['none', 'no affiliation', 'independent'],
  'green lantern corps': ['green lantern corps', 'green lantern corp', 'green lantern'],
  'blue lantern corps': ['blue lantern corps', 'blue lantern corp', 'blue lantern'],
  'yellow lantern corps': ['yellow lantern corps', 'yellow lantern corp', 'yellow lantern', 'sinestro corps', 'sinestro corp', 'sinestro'],
  'red lantern corps': ['red lantern corps', 'red lantern corp', 'red lantern'],
  'orange lantern corps': ['orange lantern corps', 'orange lantern corp', 'orange lantern', 'agent orange'],
  'indigo tribe': ['indigo tribe', 'indigo lantern corps', 'indigo lantern', 'indigo'],
  'star sapphires': ['star sapphires', 'star sapphire', 'violet lantern corps', 'violet lantern'],
  'black lantern corps': ['black lantern corps', 'black lantern corp', 'black lantern'],
  'white lantern corps': ['white lantern corps', 'white lantern corp', 'white lantern'],
  'justice league': ['justice league'],
  'a.r.g.u.s.': ['a.r.g.u.s.', 'argus'],
  plumbers: ['plumbers', 'p.l.u.m.b.e.r.s.', 'plumber command'],
  's.t.a.r. laboratories': ['s.t.a.r. laboratories', 's.t.a.r. labs', 'star laboratories', 'star labs'],
  'league of assassins': ['league of assassins'],
  'order of st. dumas': ['order of st. dumas', 'st. dumas', 'st dumas'],
  'challengers of the unknown': ['challengers of the unknown', 'c.o.t.h.', 'coth'],
};

const MANTLE_ALIASES = {
  none: ['none', 'no mantle'],
  superman: ['superman'],
  'wonder woman': ['wonder woman', 'wonderwoman'],
  batman: ['batman'],
  robin: ['robin'],
  aquaman: ['aquaman'],
};

export const SPECIES_OPTIONS = [
  { label: 'Human', value: 'human', description: 'Ordinary human physiology.' },
  { label: 'Metahuman', value: 'metahuman', description: 'Human with an active metagene.' },
  { label: 'Kryptonian', value: 'kryptonian', description: 'Survivor or descendant of Krypton.' },
  { label: 'Atlantean', value: 'atlantean', description: 'Aquatic people of Atlantis or related kingdoms.' },
  { label: 'Amazonian', value: 'amazonian', description: 'Amazon of Themysciran or related origin.' },
  { label: 'Alien / Other', value: 'alien', description: 'Any other extraterrestrial species.' },
];

export const AFFILIATION_OPTIONS = [
  { label: 'None / Independent', value: 'none' },
  { label: 'Justice League', value: 'justice league' },
  { label: 'A.R.G.U.S.', value: 'a.r.g.u.s.' },
  { label: 'P.L.U.M.B.E.R.S.', value: 'plumbers' },
  { label: 'S.T.A.R. Laboratories', value: 's.t.a.r. laboratories' },
  { label: 'League of Assassins', value: 'league of assassins' },
  { label: 'Order of St. Dumas', value: 'order of st. dumas' },
  { label: 'Challengers of the Unknown', value: 'challengers of the unknown' },
  { label: 'Green Lantern Corps', value: 'green lantern corps' },
  { label: 'Blue Lantern Corps', value: 'blue lantern corps' },
  { label: 'Yellow Lantern Corps', value: 'yellow lantern corps' },
  { label: 'Red Lantern Corps', value: 'red lantern corps' },
  { label: 'Orange Lantern Corps', value: 'orange lantern corps' },
  { label: 'Indigo Tribe', value: 'indigo tribe' },
  { label: 'Star Sapphires', value: 'star sapphires' },
  { label: 'Black Lantern Corps', value: 'black lantern corps' },
  { label: 'White Lantern Corps', value: 'white lantern corps' },
];

export const MANTLE_OPTIONS = [
  { label: 'No Major Mantle', value: 'none' },
  { label: 'Superman', value: 'superman' },
  { label: 'Wonder Woman', value: 'wonder woman' },
  { label: 'Aquaman', value: 'aquaman' },
  // Batman and Robin are intentionally omitted: staff assignment only.
];

export function normalizeSpecies(value) {
  return matchCanonical(value, SPECIES_ALIASES);
}

export function normalizeAffiliation(value) {
  return matchCanonical(value, AFFILIATION_ALIASES);
}

export function normalizeMantle(value) {
  return matchCanonical(value, MANTLE_ALIASES);
}

export function isLanternAffiliation(value) {
  const v = normalizeAffiliation(value);
  return v.endsWith('lantern corps') || v === 'indigo tribe' || v === 'star sapphires';
}

export function isStaffAssignedMantle(value) {
  return STAFF_ASSIGNED_MANTLES.includes(normalizeMantle(value));
}

const SPECIES_PRESETS = {
  human: '',
  metahuman: 'Metahuman traits vary by individual. List the active abilities, their source, and any limits that matter in roleplay.',
  alien: 'Alien physiology varies by species. List the biological traits, natural abilities, and weaknesses specific to this character.',
  kryptonian: [
    'Kryptonian physiology under yellow sunlight',
    'Enhanced strength, speed, durability, and senses',
    'Flight',
    'Heat vision and freeze breath',
    'Solar energy dependence',
  ].join('\n'),
  atlantean: [
    'Atlantean physiology',
    'Underwater breathing and deep-sea adaptation',
    'Enhanced strength, durability, and swimming speed',
    'Comfort operating both underwater and on the surface',
  ].join('\n'),
  amazonian: [
    'Amazonian physiology',
    'Enhanced physicality compared to ordinary humans',
    'Longevity',
    'Advanced martial training and weapon familiarity',
  ].join('\n'),
};

const AFFILIATION_PRESETS = {
  'green lantern corps': [
    'Green Lantern power ring',
    'Construct creation and energy projection',
    'Flight and protective aura',
    'Environmental seal for space operations',
    'Ring requires charge management',
  ].join('\n'),
  'blue lantern corps': [
    'Blue Lantern power ring',
    'Construct creation and energy projection',
    'Flight and protective aura',
    'Environmental seal for space operations',
    'Ring requires charge management',
  ].join('\n'),
  'yellow lantern corps': [
    'Yellow Lantern power ring',
    'Construct creation and energy projection',
    'Flight and protective aura',
    'Environmental seal for space operations',
    'Ring requires charge management',
  ].join('\n'),
  'red lantern corps': [
    'Red Lantern ring',
    'Rage-based energy output',
    'Flight and aura protection',
    'Offensive energy attacks',
    'Ring requires charge management',
  ].join('\n'),
  'orange lantern corps': [
    'Orange Lantern power ring',
    'Construct creation and energy projection',
    'Flight and protective aura',
    'Environmental seal for space operations',
    'Ring requires charge management',
  ].join('\n'),
  'indigo tribe': [
    'Indigo power staff / ring access',
    'Energy projection and traversal capabilities',
    'Flight and aura protection',
    'Environmental seal for space operations',
    'Device requires charge management',
  ].join('\n'),
  'star sapphires': [
    'Star Sapphire power ring',
    'Construct creation and energy projection',
    'Flight and protective aura',
    'Environmental seal for space operations',
    'Ring requires charge management',
  ].join('\n'),
  'black lantern corps': [
    'Black Lantern ring',
    'Corp-specific ring functions',
    'Flight and aura protection',
    'Environmental seal for space operations',
    'Ring requires charge management',
  ].join('\n'),
  'white lantern corps': [
    'White Lantern ring',
    'Corp-specific ring functions',
    'Flight and aura protection',
    'Environmental seal for space operations',
    'Ring requires charge management',
  ].join('\n'),
};

export function getSuggestedAbilities(character) {
  const basic = character?.data?.basic || {};
  const species = normalizeSpecies(basic.species);
  const affiliation = normalizeAffiliation(basic.affiliation);

  const parts = [];
  const speciesPreset = SPECIES_PRESETS[species];
  if (speciesPreset) parts.push(speciesPreset);

  const affiliationPreset = AFFILIATION_PRESETS[affiliation];
  if (affiliationPreset) parts.push(affiliationPreset);

  return parts.join('\n\n').trim();
}

export function getAbilityDisplay(abilities = {}) {
  if (abilities.baseline !== undefined || abilities.custom !== undefined) {
    const parts = [];
    if (abilities.baseline_state !== 'removed' && String(abilities.baseline || '').trim()) {
      parts.push(String(abilities.baseline).trim());
    }
    if (String(abilities.custom || '').trim()) parts.push(String(abilities.custom).trim());
    return parts.join('\n\n').trim();
  }
  return String(abilities.summary || '').trim();
}

export function applyAutoAbilitySeed(character, nextBasic) {
  const previousData = character?.data || {};
  const previousAbilities = previousData.abilities || {};
  const previewCharacter = { ...character, data: { ...previousData, basic: nextBasic } };
  const nextSeed = getSuggestedAbilities(previewCharacter);

  // Upgrade legacy summary-only data without deleting anything the writer already entered.
  const legacySummary = String(previousAbilities.summary || '').trim();
  const hasStructured = previousAbilities.baseline !== undefined || previousAbilities.custom !== undefined;

  if (!hasStructured) {
    return {
      ...previousAbilities,
      baseline: nextSeed,
      baseline_state: nextSeed ? 'suggested' : 'removed',
      custom: legacySummary && legacySummary !== previousAbilities._auto_seed ? legacySummary : '',
      _auto_seed: nextSeed,
    };
  }

  const currentBaseline = String(previousAbilities.baseline || '').trim();
  const oldSeed = String(previousAbilities._auto_seed || '').trim();
  const baselineWasUntouched = !currentBaseline || currentBaseline === oldSeed;

  return {
    ...previousAbilities,
    baseline: previousAbilities.baseline_state === 'removed'
      ? nextSeed
      : (baselineWasUntouched ? nextSeed : previousAbilities.baseline),
    baseline_state: nextSeed
      ? (previousAbilities.baseline_state === 'kept' && !baselineWasUntouched ? 'kept' : 'suggested')
      : 'removed',
    _auto_seed: nextSeed,
  };
}

export function hasConditionalDetails(character) {
  const basic = character?.data?.basic || {};
  const species = normalizeSpecies(basic.species);
  const affiliation = normalizeAffiliation(basic.affiliation);
  return ['alien', 'kryptonian', 'atlantean', 'amazonian'].includes(species) || isLanternAffiliation(affiliation);
}
