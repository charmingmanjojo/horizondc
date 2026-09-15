import { MessageFlags } from 'discord.js';
import { ENV } from '../config.js';
import { getCharacterByThread } from '../lib/supabase.js';
import { buildSheetMessage } from '../ui/sheet.js';

export async function sheetCommand(interaction) {
  const channel = interaction.channel;
  if (!channel?.isThread() || channel.parentId !== ENV.characterForumId) {
    await interaction.reply({ content: 'Use this inside your Character Creation forum post.', flags: MessageFlags.Ephemeral });
    return;
  }
  const character = await getCharacterByThread(channel.id);
  if (!character) {
    await interaction.reply({ content: 'No character sheet exists here yet. Use `/create` first.', flags: MessageFlags.Ephemeral });
    return;
  }
  if (character.owner_discord_id !== interaction.user.id) {
    await interaction.reply({ content: 'Only the owner can open the editor.', flags: MessageFlags.Ephemeral });
    return;
  }
  await interaction.reply({ ...buildSheetMessage(character, { editor: character.status !== 'pending' }), flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral });
}
