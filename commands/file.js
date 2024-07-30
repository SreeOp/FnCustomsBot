const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('booster')
    .setDescription('Send a message with an image and a download button')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The message to send')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('image')
        .setDescription('URL of the image to include')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('downloadurl')
        .setDescription('URL for the download button')
        .setRequired(true)),
  async execute(interaction) {
    const message = interaction.options.getString('message');
    const imageUrl = interaction.options.getString('image');
    const downloadUrl = interaction.options.getString('downloadurl');

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('Download')
          .setStyle(ButtonStyle.Link)
          .setURL(downloadUrl)
      );

    try {
      await interaction.deferReply({ ephemeral: true }); // Acknowledge the interaction first
      await interaction.channel.send({
        content: message,
        files: [imageUrl],
        components: [row]
      });
      await interaction.editReply({ content: 'Message sent!', ephemeral: true });
    } catch (error) {
      console.error(error);

      // Check if interaction is already acknowledged before replying
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'Failed to send message.', ephemeral: true });
      } else if (interaction.deferred) {
        await interaction.editReply({ content: 'Failed to send message.', ephemeral: true });
      }
    }
  },
};
