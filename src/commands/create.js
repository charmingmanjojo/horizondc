import { MessageFlags } from 'discord.js';
import { ENV } from '../config.js';
import { createCharacter, getActiveCharacterByOwner, getCharacterByThread, updateCharacter } from '../lib/supabase.js';
import { buildSheetMessage } from '../ui/sheet.js';

export async function createCommand(interaction) {
  const channel = interaction.channel;
  if (!channel?.isThread() || channel.parentId !== ENV.characterForumId) {
    await interaction.reply({
      content: 'Character sheets can only be created inside the designated Character Creation forum.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  let character = await getCharacterByThread(channel.id);
  if (character) {
    if (character.owner_discord_id !== interaction.user.id) {
      await interaction.reply({ content: 'This forum post already belongs to another character.', flags: MessageFlags.Ephemeral });
      return;
    }
    await interaction.reply({ ...buildSheetMessage(character, { editor: character.status !== 'pending' }), flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral });
    return;
  }

  const existing = await getActiveCharacterByOwner(interaction.user.id);
  if (existing) {
    const name = existing.data?.basic?.name || 'Unnamed Character';
    const status = existing.status.replaceAll('_', ' ');
    await interaction.reply({
      content: `You already have an active character: **${name}** (${status}).\nUse <#${existing.thread_id}> to continue that sheet. An approved character must be deleted by an administrator before you can create a new one.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  character = await createCharacter({ ownerDiscordId: interaction.user.id, guildId: interaction.guildId, threadId: channel.id });
  const publicMessage = await channel.send(buildSheetMessage(character, { editor: false }));
  character = await updateCharacter(character.id, { sheet_message_id: publicMessage.id });

  await interaction.reply({ ...buildSheetMessage(character, { editor: true }), flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral });
}
