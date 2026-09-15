import 'dotenv/config';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { ENV } from './config.js';
import { createCommand } from './commands/create.js';
import { deleteCharacterCommand } from './commands/deleteCharacter.js';
import { mantleCommand } from './commands/mantle.js';
import { sheetCommand } from './commands/sheet.js';
import { viewCommand } from './commands/view.js';
import { handleCharacterComponent, handleCharacterModal } from './handlers/characterInteractions.js';

for (const [key, value] of Object.entries(ENV)) {
  if (['reviewerRoleId'].includes(key)) continue;
  if (!value) throw new Error(`Missing environment setting: ${key}`);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, c => console.log(`Horizon Character Bot online as ${c.user.tag}`));

client.on(Events.InteractionCreate, async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === 'create') return await createCommand(interaction);
      if (interaction.commandName === 'sheet') return await sheetCommand(interaction);
      if (interaction.commandName === 'view') return await viewCommand(interaction);
      if (interaction.commandName === 'mantle') return await mantleCommand(interaction, client);
      if (interaction.commandName === 'delete-character') return await deleteCharacterCommand(interaction, client);
    }
    if (interaction.isButton() || interaction.isStringSelectMenu()) return await handleCharacterComponent(interaction, client);
    if (interaction.isModalSubmit()) return await handleCharacterModal(interaction, client);
  } catch (error) {
    console.error(error);
    const payload = { content: 'Something went wrong while processing that character action.', ephemeral: true };
    if (interaction.replied || interaction.deferred) await interaction.followUp(payload).catch(() => {});
    else await interaction.reply(payload).catch(() => {});
  }
});

client.login(ENV.token);
