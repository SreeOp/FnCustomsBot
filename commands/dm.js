const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dm')
    .setDescription('Send a direct message to a user')
    .addUserOption(option => 
      option.setName('target')
        .setDescription('The user to send the message to')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('message')
        .setDescription('The message to send')
        .setRequired(true)),
  async execute(interaction) {
    const targetUser = interaction.options.getUser('target');
    const message = interaction.options.getString('message');

    try {
      await targetUser.send(message);
      await interaction.reply({ content: `Message sent to ${targetUser.username}`, ephemeral: true });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error sending the message.', ephemeral: true });
    }
  },
};
