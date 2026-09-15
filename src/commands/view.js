import { MessageFlags } from 'discord.js';
import { getApprovedCharacterByOwner } from '../lib/supabase.js';
import { buildSheetMessage } from '../ui/sheet.js';

export async function viewCommand(interaction) {
  const target = interaction.options.getUser('user') || interaction.user;
  const character = await getApprovedCharacterByOwner(target.id);

  if (!character) {
    await interaction.reply({
      content: target.id === interaction.user.id
        ? 'You do not have an approved Horizon character to view yet.'
        : `${target} does not have an approved Horizon character.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  // Public, read-only sheet. Tabs can still be browsed, but no edit controls are shown.
  await interaction.reply(buildSheetMessage(character, { editor: false }));
}
