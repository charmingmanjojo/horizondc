import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import {
  getSuggestedAbilities,
  isLanternAffiliation,
  normalizeAffiliation,
  normalizeSpecies,
} from '../lib/presets.js';

function input(id, label, value = '', style = TextInputStyle.Short, required = false, maxLength = 1000) {
  return new ActionRowBuilder().addComponents(
    new TextInputBuilder()
      .setCustomId(id)
      .setLabel(label)
      .setStyle(style)
      .setRequired(required)
      .setMaxLength(maxLength)
      .setValue(String(value || '').slice(0, maxLength)),
  );
}

export function buildEditModal(character, tab) {
  const d = character.data?.[tab] || {};
  const modal = new ModalBuilder().setCustomId(`char:modal:${character.id}:${tab}`).setTitle(`Edit ${tab}`);

  if (tab === 'basic') {
    modal.addComponents(
      input('name', 'Character Name', d.name, TextInputStyle.Short, true, 100),
      input('alias', 'Alias / Codename', d.alias, TextInputStyle.Short, false, 100),
      input('age_species_detail', 'Age | Alien Species (if applicable)', `${d.age || ''} | ${d.species_detail || ''}`, TextInputStyle.Short, true, 180),
      input('occupation', 'Occupation', d.occupation, TextInputStyle.Short, false, 120),
      input('origin', 'Origin / Nationality / Homeworld', d.origin, TextInputStyle.Paragraph, false, 700),
    );
  } else if (tab === 'appearance') {
    modal.addComponents(
      input('height', 'Height', d.height, TextInputStyle.Short, false, 80),
      input('build', 'Build', d.build, TextInputStyle.Short, false, 120),
      input('image_url', 'Portrait Image URL', d.image_url, TextInputStyle.Short, false, 500),
      input('description', 'Appearance Description', d.description, TextInputStyle.Paragraph, true, 1800),
    );
  } else if (tab === 'personality') {
    modal.addComponents(
      input('summary', 'Personality', d.summary, TextInputStyle.Paragraph, true, 2000),
      input('goals', 'Goals / Motivations', d.goals, TextInputStyle.Paragraph, false, 900),
      input('flaws', 'Flaws / Fears', d.flaws, TextInputStyle.Paragraph, false, 900),
    );
  } else if (tab === 'abilities') {
    const suggested = getSuggestedAbilities(character);
    modal.addComponents(
      input('baseline', 'Race / Affiliation Baseline', d.baseline ?? suggested, TextInputStyle.Paragraph, false, 1800),
      input('custom', 'Personal Abilities / Equipment', d.custom ?? d.summary ?? '', TextInputStyle.Paragraph, false, 2000),
    );
  } else if (tab === 'history') {
    modal.addComponents(input('summary', 'History / Backstory', d.summary, TextInputStyle.Paragraph, true, 4000));
  } else if (tab === 'rp') {
    modal.addComponents(
      input('notes', 'Writer Notes', d.notes, TextInputStyle.Paragraph, false, 1500),
      input('connections', 'Wanted Connections', d.connections, TextInputStyle.Paragraph, false, 1200),
    );
  }

  return modal;
}

export function buildDetailsModal(character) {
  const basic = character.data?.basic || {};
  const d = character.data?.details || {};
  const species = normalizeSpecies(basic.species);
  const affiliation = normalizeAffiliation(basic.affiliation);
  const modal = new ModalBuilder().setCustomId(`char:details:${character.id}`).setTitle('Character Details');
  let fieldCount = 0;

  if (species === 'alien') {
    modal.addComponents(
      input('homeworld', 'Homeworld', d.homeworld || basic.origin, TextInputStyle.Short, true, 120),
      input('alien_culture', 'Culture / Species Notes', d.alien_culture, TextInputStyle.Paragraph, false, 900),
    );
    fieldCount += 2;
  } else if (species === 'kryptonian') {
    modal.addComponents(
      input('kryptonian_lineage', 'House / Lineage (optional)', d.kryptonian_lineage, TextInputStyle.Short, false, 120),
      input('kryptonian_status', 'Survivor / Descendant / Background', d.kryptonian_status, TextInputStyle.Paragraph, false, 700),
    );
    fieldCount += 2;
  } else if (species === 'atlantean') {
    modal.addComponents(
      input('atlantean_kingdom', 'Kingdom / Region', d.atlantean_kingdom, TextInputStyle.Short, false, 120),
      input('atlantean_background', 'Atlantean Background', d.atlantean_background, TextInputStyle.Paragraph, false, 700),
    );
    fieldCount += 2;
  } else if (species === 'amazonian') {
    modal.addComponents(
      input('amazon_origin', 'Amazon Community / Origin', d.amazon_origin, TextInputStyle.Short, false, 120),
      input('amazon_background', 'Amazon Background', d.amazon_background, TextInputStyle.Paragraph, false, 700),
    );
    fieldCount += 2;
  }

  if (isLanternAffiliation(affiliation)) {
    modal.addComponents(
      input('lantern_sector', 'Lantern Sector', d.lantern_sector, TextInputStyle.Short, true, 80),
      input('lantern_status', 'Lantern Status / Experience', d.lantern_status, TextInputStyle.Short, true, 120),
    );
    fieldCount += 2;
  }

  // Modal must have at least one field. This is a fallback for future conditional types.
  if (!fieldCount) {
    modal.addComponents(input('notes', 'Additional Details', d.notes, TextInputStyle.Paragraph, false, 1200));
  }

  return modal;
}

export function buildReviewNoteModal(characterId, action) {
  const title = action === 'changes' ? 'Request Changes' : 'Deny Character';
  return new ModalBuilder()
    .setCustomId(`review:modal:${action}:${characterId}`)
    .setTitle(title)
    .addComponents(input('note', 'Reason / Requested Changes', '', TextInputStyle.Paragraph, true, 1800));
}
