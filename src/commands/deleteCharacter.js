import { MessageFlags } from 'discord.js';
import { deleteCharacter, getActiveCharacterByOwner } from '../lib/supabase.js';

export async function deleteCharacterCommand(interaction, client) {
  if (!interaction.memberPermissions?.has('Administrator')) {
    await interaction.reply({ content: 'Only administrators can delete approved character records.', flags: MessageFlags.Ephemeral });
    return;
  }

  const user = interaction.options.getUser('user', true);
  const character = await getActiveCharacterByOwner(user.id);
  if (!character) {
    await interaction.reply({ content: `${user} does not have an active character record.`, flags: MessageFlags.Ephemeral });
    return;
  }

  const thread = await client.channels.fetch(character.thread_id).catch(() => null);
  if (thread?.isTextBased() && character.sheet_message_id) {
    const message = await thread.messages.fetch(character.sheet_message_id).catch(() => null);
    if (message) await message.delete().catch(() => {});
  }

  await deleteCharacter(character.id);

  if (thread?.isThread()) {
    await thread.setLocked(true).catch(() => {});
    await thread.setArchived(true).catch(() => {});
  }

  await interaction.reply({
    content: `Deleted **${character.data?.basic?.name || 'character'}** for ${user}. They may now create a new character.`,
    flags: MessageFlags.Ephemeral,
  });
}
