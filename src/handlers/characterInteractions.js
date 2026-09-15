import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} from 'discord.js';
import { ENV } from '../config.js';
import { getCompletion } from '../lib/completion.js';
import {
  applyAutoAbilitySeed,
  isStaffAssignedMantle,
  normalizeAffiliation,
  normalizeMantle,
  normalizeSpecies,
} from '../lib/presets.js';
import { buildDetailsModal, buildEditModal, buildReviewNoteModal } from '../ui/modals.js';
import { buildSheetMessage } from '../ui/sheet.js';
import { getActiveCharacterByMantle, getCharacterById, updateCharacter } from '../lib/supabase.js';

function isReviewer(interaction) {
  if (interaction.memberPermissions?.has('ManageGuild')) return true;
  if (!ENV.reviewerRoleId) return false;
  return interaction.member?.roles?.cache?.has(ENV.reviewerRoleId) || false;
}

async function updatePublicSheet(client, character) {
  if (!character.sheet_message_id) return;
  const thread = await client.channels.fetch(character.thread_id).catch(() => null);
  if (!thread?.isTextBased()) return;
  const msg = await thread.messages.fetch(character.sheet_message_id).catch(() => null);
  if (msg) await msg.edit(buildSheetMessage(character, { editor: false }));
}

function splitPipe(value) {
  const [a = '', b = ''] = String(value || '').split('|').map(x => x.trim());
  return [a, b];
}

export async function handleCharacterComponent(interaction, client) {
  const parts = interaction.customId.split(':');

  if (parts[0] === 'char' && parts[1] === 'tab') {
    const [, , id, tab] = parts;
    let character = await getCharacterById(id);
    const owns = character.owner_discord_id === interaction.user.id;
    character = await updateCharacter(id, { active_tab: tab });
    await interaction.update(buildSheetMessage(character, { editor: owns && character.status !== 'pending' }));
    return true;
  }

  if (parts[0] === 'char' && parts[1] === 'preview') {
    const [, , id] = parts;
    const character = await getCharacterById(id);
    if (character.owner_discord_id !== interaction.user.id) {
      await interaction.reply({ content: 'Only the character owner can preview this sheet.', flags: MessageFlags.Ephemeral });
      return true;
    }
    await interaction.reply({
      ...buildSheetMessage(character, { editor: false, preview: true }),
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    });
    return true;
  }

  if (parts[0] === 'char' && parts[1] === 'details') {
    const [, , id] = parts;
    const character = await getCharacterById(id);
    if (character.owner_discord_id !== interaction.user.id) {
      await interaction.reply({ content: 'Only the character owner can edit these details.', flags: MessageFlags.Ephemeral });
      return true;
    }
    await interaction.showModal(buildDetailsModal(character));
    return true;
  }

  if (parts[0] === 'char' && parts[1] === 'select') {
    const [, , id, field] = parts;
    let character = await getCharacterById(id);
    if (character.owner_discord_id !== interaction.user.id) {
      await interaction.reply({ content: 'Only the character owner can change these selections.', flags: MessageFlags.Ephemeral });
      return true;
    }
    if (character.status === 'pending') {
      await interaction.reply({ content: 'This character is currently under review.', flags: MessageFlags.Ephemeral });
      return true;
    }

    const selected = interaction.values?.[0];
    const basic = { ...(character.data?.basic || {}) };

    if (field === 'species') basic.species = normalizeSpecies(selected);
    if (field === 'affiliation') basic.affiliation = normalizeAffiliation(selected);
    if (field === 'mantle') basic.mantle = normalizeMantle(selected);

    const abilities = applyAutoAbilitySeed(character, basic);
    const nextData = { ...(character.data || {}), basic, abilities };
    character = await updateCharacter(id, { data: nextData });

    await updatePublicSheet(client, character);
    await interaction.update(buildSheetMessage(character, { editor: true }));
    return true;
  }

  if (parts[0] === 'char' && parts[1] === 'baseline') {
    const [, , id, action] = parts;
    let character = await getCharacterById(id);
    if (character.owner_discord_id !== interaction.user.id) {
      await interaction.reply({ content: 'Only the character owner can edit abilities.', flags: MessageFlags.Ephemeral });
      return true;
    }
    if (action === 'edit') {
      await interaction.showModal(buildEditModal(character, 'abilities'));
      return true;
    }

    const abilities = { ...(character.data?.abilities || {}) };
    if (action === 'keep') abilities.baseline_state = 'kept';
    if (action === 'remove') abilities.baseline_state = 'removed';
    const nextData = { ...(character.data || {}), abilities };
    character = await updateCharacter(id, { data: nextData });
    await updatePublicSheet(client, character);
    await interaction.update(buildSheetMessage(character, { editor: true }));
    return true;
  }

  if (parts[0] === 'char' && parts[1] === 'edit') {
    const [, , id, tab] = parts;
    const character = await getCharacterById(id);
    if (character.owner_discord_id !== interaction.user.id) {
      await interaction.reply({ content: 'Only the character owner can edit this sheet.', flags: MessageFlags.Ephemeral });
      return true;
    }
    if (character.status === 'pending') {
      await interaction.reply({ content: 'This character is currently under review.', flags: MessageFlags.Ephemeral });
      return true;
    }
    await interaction.showModal(buildEditModal(character, tab));
    return true;
  }

  if (parts[0] === 'char' && parts[1] === 'submit') {
    const [, , id] = parts;
    let character = await getCharacterById(id);
    if (character.owner_discord_id !== interaction.user.id) {
      await interaction.reply({ content: 'Only the character owner can submit this sheet.', flags: MessageFlags.Ephemeral });
      return true;
    }

    const completion = getCompletion(character);
    if (!completion.complete) {
      await interaction.reply({ content: `Your sheet is **${completion.percent}% complete**. Finish the required sections before submitting.`, flags: MessageFlags.Ephemeral });
      return true;
    }

    const name = character.data?.basic?.name;
    const assignedMantle = normalizeMantle(character.data?.basic?.mantle);
    const aliasMantle = normalizeMantle(character.data?.basic?.alias);
    if (isStaffAssignedMantle(aliasMantle) && assignedMantle !== aliasMantle) {
      await interaction.reply({
        content: `The **${aliasMantle}** mantle is staff-assigned. Ask staff to assign it to this sheet before submitting.`,
        flags: MessageFlags.Ephemeral,
      });
      return true;
    }

    const reviewChannel = await client.channels.fetch(ENV.reviewChannelId);
    const reviewRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`review:approve:${id}`).setLabel('Approve').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`review:changes:${id}`).setLabel('Request Changes').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`review:deny:${id}`).setLabel('Deny').setStyle(ButtonStyle.Danger),
    );

    const reviewMessage = await reviewChannel.send({
      content: `**CHARACTER SUBMISSION**\nCharacter: **${name}**\nWriter: <@${character.owner_discord_id}>\nThread: <#${character.thread_id}>`,
      components: [reviewRow],
    });

    character = await updateCharacter(id, {
      status: 'pending',
      review_message_id: reviewMessage.id,
      review_note: null,
    });
    await updatePublicSheet(client, character);
    await interaction.update(buildSheetMessage(character, { editor: false }));
    await interaction.followUp({ content: 'Character submitted for staff review.', flags: MessageFlags.Ephemeral });
    return true;
  }

  if (parts[0] === 'review') {
    if (!isReviewer(interaction)) {
      await interaction.reply({ content: 'You do not have permission to review characters.', flags: MessageFlags.Ephemeral });
      return true;
    }
    const [, action, id] = parts;
    if (action === 'approve') {
      let character = await getCharacterById(id);
      const mantle = normalizeMantle(character.data?.basic?.mantle);
      if (isStaffAssignedMantle(mantle)) {
        const taken = await getActiveCharacterByMantle(mantle, character.id);
        if (taken) {
          await interaction.reply({
            content: `The **${mantle}** mantle is already occupied by **${taken.data?.basic?.name || 'another approved character'}**.`,
            flags: MessageFlags.Ephemeral,
          });
          return true;
        }
      }

      character = await updateCharacter(id, { status: 'approved', review_note: null });
      await updatePublicSheet(client, character);
      await interaction.update({ content: `${interaction.message.content}\n\n✅ **APPROVED** by <@${interaction.user.id}>`, components: [] });
      const owner = await client.users.fetch(character.owner_discord_id).catch(() => null);
      if (owner) await owner.send(`Your character **${character.data?.basic?.name || 'character'}** has been approved in Horizon.`).catch(() => {});
      return true;
    }
    if (action === 'changes' || action === 'deny') {
      await interaction.showModal(buildReviewNoteModal(id, action));
      return true;
    }
  }

  return false;
}

export async function handleCharacterModal(interaction, client) {
  const parts = interaction.customId.split(':');

  if (parts[0] === 'char' && parts[1] === 'details') {
    const [, , id] = parts;
    let character = await getCharacterById(id);
    if (character.owner_discord_id !== interaction.user.id) {
      await interaction.reply({ content: 'Only the character owner can edit these details.', flags: MessageFlags.Ephemeral });
      return true;
    }
    const details = { ...(character.data?.details || {}) };
    for (const row of interaction.components) {
      for (const component of row.components) details[component.customId] = component.value;
    }
    const nextData = { ...(character.data || {}), details };
    character = await updateCharacter(id, { data: nextData });
    await updatePublicSheet(client, character);
    await interaction.reply({ content: 'Details saved.', flags: MessageFlags.Ephemeral });
    return true;
  }

  if (parts[0] === 'char' && parts[1] === 'modal') {
    const [, , id, tab] = parts;
    let character = await getCharacterById(id);
    if (character.owner_discord_id !== interaction.user.id) {
      await interaction.reply({ content: 'Only the character owner can edit this sheet.', flags: MessageFlags.Ephemeral });
      return true;
    }

    const section = { ...(character.data?.[tab] || {}) };
    for (const row of interaction.components) {
      for (const component of row.components) section[component.customId] = component.value;
    }

    if (tab === 'basic') {
      const [age, speciesDetail] = splitPipe(section.age_species_detail);
      section.age = age;
      section.species_detail = speciesDetail;
      delete section.age_species_detail;
    }

    if (tab === 'abilities') {
      section.baseline_state = 'kept';
      delete section.summary;
    }

    const nextData = { ...(character.data || {}), [tab]: section };
    character = await updateCharacter(id, { data: nextData, status: character.status === 'denied' ? 'draft' : character.status });
    await updatePublicSheet(client, character);
    await interaction.reply({ content: 'Saved.', flags: MessageFlags.Ephemeral });
    return true;
  }

  if (parts[0] === 'review' && parts[1] === 'modal') {
    if (!isReviewer(interaction)) {
      await interaction.reply({ content: 'You do not have permission to review characters.', flags: MessageFlags.Ephemeral });
      return true;
    }
    const [, , action, id] = parts;
    const note = interaction.fields.getTextInputValue('note');
    let character = await getCharacterById(id);
    const status = action === 'changes' ? 'changes_requested' : 'denied';
    character = await updateCharacter(id, { status, review_note: note });
    await updatePublicSheet(client, character);

    const label = action === 'changes' ? 'CHANGES REQUESTED' : 'DENIED';
    await interaction.update({ content: `${interaction.message.content}\n\n**${label}** by <@${interaction.user.id}>\n${note}`, components: [] });
    const owner = await client.users.fetch(character.owner_discord_id).catch(() => null);
    if (owner) await owner.send(`Your Horizon character **${character.data?.basic?.name || 'character'}** was updated by staff:\n\n${note}`).catch(() => {});
    return true;
  }

  return false;
}
