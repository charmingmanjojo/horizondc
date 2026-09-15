import 'dotenv/config';
import { PermissionFlagsBits, REST, Routes, SlashCommandBuilder } from 'discord.js';
import { ENV } from './config.js';

const commands = [
  new SlashCommandBuilder().setName('create').setDescription('Create or open a Horizon character sheet.'),
  new SlashCommandBuilder().setName('sheet').setDescription('Open your character sheet editor in this forum post.'),
  new SlashCommandBuilder()
    .setName('view')
    .setDescription('View an approved Horizon character sheet anywhere in the server.')
    .addUserOption(option => option.setName('user').setDescription('Character owner; leave blank to view your own').setRequired(false)),
  new SlashCommandBuilder()
    .setName('mantle')
    .setDescription('Assign or clear a staff-controlled mantle in this character post.')
    .addStringOption(option => option
      .setName('mantle')
      .setDescription('Mantle to assign')
      .setRequired(true)
      .addChoices(
        { name: 'Batman', value: 'batman' },
        { name: 'Robin', value: 'robin' },
        { name: 'Clear Mantle', value: 'none' },
      )),
  new SlashCommandBuilder()
    .setName('delete-character')
    .setDescription('Delete a user\'s active character record so they can make a new one.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(option => option.setName('user').setDescription('Character owner').setRequired(true)),
].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(ENV.token);
await rest.put(Routes.applicationGuildCommands(ENV.clientId, ENV.guildId), { body: commands });
console.log('Registered Horizon character commands.');
