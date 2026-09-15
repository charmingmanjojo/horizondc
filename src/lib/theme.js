import { THEMES } from '../config.js';
import { isLanternAffiliation, normalizeAffiliation, normalizeMantle, normalizeSpecies } from './presets.js';

function iconUrl(theme) {
  if (!theme) return null;
  if (theme.icon) return theme.icon;
  if (theme.emojiId) return `https://cdn.discordapp.com/emojis/${theme.emojiId}.png?size=256&quality=lossless`;
  return null;
}

export function resolveTheme(character) {
  const basic = character?.data?.basic || {};
  const affiliation = normalizeAffiliation(basic.affiliation);
  const mantle = normalizeMantle(basic.mantle || basic.alias);
  const species = normalizeSpecies(basic.species);

  if (isLanternAffiliation(affiliation) && THEMES.affiliations[affiliation]) {
    const theme = THEMES.affiliations[affiliation];
    return { ...theme, iconUrl: iconUrl(theme) };
  }

  if (THEMES.mantles[mantle]) {
    const theme = THEMES.mantles[mantle];
    return { ...theme, iconUrl: iconUrl(theme) };
  }

  if (THEMES.affiliations[affiliation]) {
    const theme = THEMES.affiliations[affiliation];
    return { ...theme, iconUrl: iconUrl(theme) };
  }

  if (THEMES.species[species]) {
    const theme = THEMES.species[species];
    return { ...theme, iconUrl: iconUrl(theme) };
  }

  return { ...THEMES.default, iconUrl: iconUrl(THEMES.default) };
}
