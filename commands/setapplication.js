const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setapplication')
    .setDescription('Sets the channel for staff applications')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel to set for applications')
        .setRequired(true)),
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    
    // Check if the user has the required permissions
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    // Save the channel ID to a JSON file or a database
    const config = require('../config.json');
    config.applicationChannelId = channel.id;

    const fs = require('fs');
    fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));

    await interaction.reply({ content: `Application channel set to ${channel}.`, ephemeral: true });
  },
};
