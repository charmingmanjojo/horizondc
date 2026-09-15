import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
  SectionBuilder,
  SeparatorBuilder,
  StringSelectMenuBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
} from 'discord.js';
import { TABS } from '../config.js';
import { getCompletion } from '../lib/completion.js';
import {
  AFFILIATION_OPTIONS,
  getAbilityDisplay,
  hasConditionalDetails,
  MANTLE_OPTIONS,
  normalizeAffiliation,
  normalizeMantle,
  normalizeSpecies,
  SPECIES_OPTIONS,
} from '../lib/presets.js';
import { resolveTheme } from '../lib/theme.js';

const clip = (v, n = 900) => {
  const s = String(v || '').trim();
  return s ? (s.length > n ? s.slice(0, n - 1) + '…' : s) : '*Not provided*';
};

function displayValue(value, fallback = '—') {
  if (!value || value === 'none') return fallback;
  return value;
}

function detailLines(character) {
  const d = character.data?.details || {};
  const lines = [];
  if (d.homeworld) lines.push(`**Homeworld:** ${d.homeworld}`);
  if (d.kryptonian_lineage) lines.push(`**Kryptonian Lineage:** ${d.kryptonian_lineage}`);
  if (d.atlantean_kingdom) lines.push(`**Atlantean Kingdom:** ${d.atlantean_kingdom}`);
  if (d.amazon_origin) lines.push(`**Amazon Origin:** ${d.amazon_origin}`);
  if (d.lantern_sector) lines.push(`**Lantern Sector:** ${d.lantern_sector}`);
  if (d.lantern_status) lines.push(`**Lantern Status:** ${d.lantern_status}`);
  return lines;
}

function tabText(character, tab) {
  const d = character.data || {};
  switch (tab) {
    case 'basic': {
      const x = d.basic || {};
      const details = detailLines(character);
      return [
        `### ${x.name || 'Unnamed Character'}`,
        `**Alias:** ${x.alias || '—'}`,
        `**Mantle:** ${displayValue(x.mantle)}`,
        `**Age:** ${x.age || '—'}`,
        `**Species:** ${x.species === 'alien' && x.species_detail ? `Alien — ${x.species_detail}` : (x.species || '—')}`,
        `**Affiliation:** ${displayValue(x.affiliation, 'None')}`,
        `**Occupation:** ${x.occupation || '—'}`,
        `**Origin:** ${x.origin || '—'}`,
        ...details,
      ].join('\n');
    }
    case 'appearance': {
      const x = d.appearance || {};
      return `### Appearance\n**Height:** ${x.height || '—'}\n**Build:** ${x.build || '—'}\n\n${clip(x.description, 1200)}`;
    }
    case 'personality': {
      const x = d.personality || {};
      return `### Personality\n${clip(x.summary, 1400)}\n\n**Goals:** ${clip(x.goals, 400)}\n**Flaws:** ${clip(x.flaws, 400)}`;
    }
    case 'abilities': {
      const x = d.abilities || {};
      return `### Abilities / Equipment\n${clip(getAbilityDisplay(x), 1600)}\n\n-# Full specifications are handled through the Spec Claim system.`;
    }
    case 'history': {
      const x = d.history || {};
      return `### History\n${clip(x.summary, 1800)}`;
    }
    case 'rp': {
      const x = d.rp || {};
      return `### RP Information\n**Writer Notes:** ${clip(x.notes, 900)}\n\n**Wanted Connections:** ${clip(x.connections, 700)}`;
    }
    default:
      return 'Unknown tab.';
  }
}

function withDefaults(options, selectedValue) {
  return options.map(option => ({ ...option, default: option.value === selectedValue }));
}

export function buildSheetMessage(character, { editor = false, preview = false } = {}) {
  const tab = character.active_tab || 'basic';
  const theme = resolveTheme(character);
  const status = character.status.replaceAll('_', ' ').toUpperCase();
  const completion = getCompletion(character);

  const container = new ContainerBuilder().setAccentColor(theme.accent);
  const heading = `## DETECTIVE COMICS: HORIZON\n**Character Sheet** • ${status}${editor ? ` • ${completion.percent}% Complete` : ''}${preview ? ' • PREVIEW' : ''}`;

  if (theme.iconUrl) {
    container.addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(heading))
        .setThumbnailAccessory(new ThumbnailBuilder().setURL(theme.iconUrl)),
    );
  } else {
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(heading));
  }

  const portrait = character.data?.appearance?.image_url;
  if (portrait) {
    container.addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(portrait)),
    );
  }

  container.addSeparatorComponents(new SeparatorBuilder());
  container.addTextDisplayComponents(new TextDisplayBuilder().setContent(tabText(character, tab)));
  container.addSeparatorComponents(new SeparatorBuilder());

  if (preview) {
    return { flags: MessageFlags.IsComponentsV2, components: [container] };
  }

  const tabRow = new ActionRowBuilder();
  for (const t of TABS.slice(0, 5)) {
    const complete = completion.tabComplete[t.key];
    tabRow.addComponents(
      new ButtonBuilder()
        .setCustomId(`char:tab:${character.id}:${t.key}`)
        .setLabel(`${t.label}${complete ? ' ✓' : ''}`)
        .setEmoji(t.emoji)
        .setStyle(t.key === tab ? ButtonStyle.Primary : ButtonStyle.Secondary),
    );
  }

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`char:tab:${character.id}:rp`)
      .setLabel('RP Info')
      .setEmoji('🎭')
      .setStyle(tab === 'rp' ? ButtonStyle.Primary : ButtonStyle.Secondary),
  );

  if (editor) {
    row2.addComponents(
      new ButtonBuilder().setCustomId(`char:edit:${character.id}:${tab}`).setLabel('Edit This Tab').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`char:preview:${character.id}`).setLabel('Preview').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`char:submit:${character.id}`).setLabel('Submit').setStyle(ButtonStyle.Primary).setDisabled(!completion.complete),
    );
    if (tab === 'basic' && hasConditionalDetails(character)) {
      row2.addComponents(
        new ButtonBuilder().setCustomId(`char:details:${character.id}`).setLabel('Extra Details').setStyle(ButtonStyle.Secondary),
      );
    }
  }

  container.addActionRowComponents(tabRow, row2);

  if (editor && tab === 'basic') {
    const basic = character.data?.basic || {};
    const species = normalizeSpecies(basic.species) || 'human';
    const affiliation = normalizeAffiliation(basic.affiliation) || 'none';
    const mantle = normalizeMantle(basic.mantle) || 'none';

    container.addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`char:select:${character.id}:species`)
          .setPlaceholder('Select species')
          .addOptions(withDefaults(SPECIES_OPTIONS, species)),
      ),
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`char:select:${character.id}:affiliation`)
          .setPlaceholder('Select affiliation')
          .addOptions(withDefaults(AFFILIATION_OPTIONS, affiliation)),
      ),
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`char:select:${character.id}:mantle`)
          .setPlaceholder('Select major mantle (optional)')
          .addOptions(withDefaults(MANTLE_OPTIONS, mantle)),
      ),
    );
  }

  if (editor && tab === 'abilities') {
    const abilities = character.data?.abilities || {};
    const hasBaseline = String(abilities.baseline || abilities._auto_seed || '').trim();
    if (hasBaseline) {
      container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`char:baseline:${character.id}:keep`).setLabel('Keep Baseline').setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId(`char:baseline:${character.id}:edit`).setLabel('Edit Baseline').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId(`char:baseline:${character.id}:remove`).setLabel('Remove Baseline').setStyle(ButtonStyle.Danger),
        ),
      );
    }
  }

  return { flags: MessageFlags.IsComponentsV2, components: [container] };
}
