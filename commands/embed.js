const { SlashCommandBuilder } = require('discord.js');

// Define the role IDs allowed to use the command
const AllowedRoleIDs = ['1220620597957234769', '1167836416546447412']; // Replace with actual role IDs

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Send an embedded message')
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Title of the embed')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Description of the embed')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('image')
        .setDescription('Image URL for the embed')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('footer')
        .setDescription('Footer text for the embed')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('color')
        .setDescription('Embed color in HEX format')
        .setRequired(false)),
  async execute(interaction) {
    // Check if user has any of the allowed roles by ID
    const memberRoles = interaction.member.roles.cache;
    const hasAllowedRole = memberRoles.some(role => AllowedRoleIDs.includes(role.id));

    if (!hasAllowedRole) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    const title = interaction.options.getString('title') || '\u200B';
    const description = interaction.options.getString('description') || '\u200B';
    const image = interaction.options.getString('image');
    const footer = interaction.options.getString('footer') || '\u200B';
    let color = interaction.options.getString('color');

    // Validate color format if provided
    if (color && !/^#([0-9a-fA-F]{6})$/.test(color)) {
      return interaction.reply({ content: 'Invalid color format. Please use HEX format (#RRGGBB).', ephemeral: true });
    }

    // Convert HEX color to integer
    if (color) {
      color = parseInt(color.replace('#', ''), 16);
    } else {
      color = 0x0099ff; // Default color if not provided or invalid
    }

    const embed = {
      color: color,
      title: title,
      description: description,
      image: { url: image },
      footer: { text: footer }
    };

    try {
      await interaction.channel.send({ embeds: [embed] });
      await interaction.reply({ content: 'Embed message sent!', ephemeral: true });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Failed to send embed message.', ephemeral: true });
    }
  },
};
