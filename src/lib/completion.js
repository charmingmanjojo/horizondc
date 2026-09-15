import { getAbilityDisplay, isLanternAffiliation, normalizeAffiliation, normalizeSpecies } from './presets.js';

const filled = value => Boolean(String(value || '').trim());

export function getCompletion(character) {
  const data = character?.data || {};
  const basic = data.basic || {};
  const details = data.details || {};
  const species = normalizeSpecies(basic.species);
  const affiliation = normalizeAffiliation(basic.affiliation);

  const checks = {
    basic: [filled(basic.name), filled(basic.age), filled(species)],
    appearance: [filled(data.appearance?.description)],
    personality: [filled(data.personality?.summary)],
    abilities: [],
    history: [filled(data.history?.summary)],
    rp: [],
  };

  if (species === 'alien') {
    checks.basic.push(filled(basic.species_detail), filled(details.homeworld || basic.origin));
  }

  if (isLanternAffiliation(affiliation)) {
    checks.basic.push(filled(details.lantern_sector), filled(details.lantern_status));
  }

  const needsAbilities = species !== 'human' || (affiliation && affiliation !== 'none') || filled(basic.mantle);
  if (needsAbilities) checks.abilities.push(filled(getAbilityDisplay(data.abilities || {})));

  const requiredChecks = Object.values(checks).flat();
  const done = requiredChecks.filter(Boolean).length;
  const total = requiredChecks.length || 1;

  const tabComplete = {};
  for (const [tab, tabChecks] of Object.entries(checks)) {
    tabComplete[tab] = tabChecks.length > 0 && tabChecks.every(Boolean);
  }

  return {
    percent: Math.round((done / total) * 100),
    done,
    total,
    tabComplete,
    complete: done === total,
  };
}
