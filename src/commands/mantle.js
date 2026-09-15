import { MessageFlags } from 'discord.js';
import { ENV } from '../config.js';
import { getActiveCharacterByMantle, getCharacterByThread, updateCharacter } from '../lib/supabase.js';
import { buildSheetMessage } from '../ui/sheet.js';

function isStaff(interaction) {
  if (interaction.memberPermissions?.has('ManageGuild')) return true;
  if (!ENV.reviewerRoleId) return false;
  return interaction.member?.roles?.cache?.has(ENV.reviewerRoleId) || false;
}

export async function mantleCommand(interaction, client) {
  if (!isStaff(interaction)) {
    await interaction.reply({ content: 'You do not have permission to assign limited mantles.', flags: MessageFlags.Ephemeral });
    return;
  }

  const channel = interaction.channel;
  if (!channel?.isThread() || channel.parentId !== ENV.characterForumId) {
    await interaction.reply({ content: 'Use this command inside the character\'s forum post.', flags: MessageFlags.Ephemeral });
    return;
  }

  let character = await getCharacterByThread(channel.id);
  if (!character) {
    await interaction.reply({ content: 'No character sheet exists in this post.', flags: MessageFlags.Ephemeral });
    return;
  }

  const mantle = interaction.options.getString('mantle', true);
  if (mantle !== 'none') {
    const taken = await getActiveCharacterByMantle(mantle, character.id);
    if (taken) {
      await interaction.reply({
        content: `The **${mantle}** mantle is already occupied by **${taken.data?.basic?.name || 'another approved character'}**.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
  }

  const basic = { ...(character.data?.basic || {}), mantle };
  character = await updateCharacter(character.id, { data: { ...(character.data || {}), basic } });

  if (character.sheet_message_id) {
    const msg = await channel.messages.fetch(character.sheet_message_id).catch(() => null);
    if (msg) await msg.edit(buildSheetMessage(character, { editor: false }));
  }

  await interaction.reply({
    content: mantle === 'none' ? 'Limited mantle cleared.' : `Assigned **${mantle}** to **${basic.name || 'this character'}**.`,
    flags: MessageFlags.Ephemeral,
  });
}
