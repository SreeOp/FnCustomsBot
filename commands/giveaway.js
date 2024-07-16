const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Starts a giveaway')
    .addStringOption(option =>
      option.setName('prize')
        .setDescription('The prize for the giveaway')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('duration')
        .setDescription('Duration of the giveaway in seconds')
        .setRequired(true)),

  async execute(interaction) {
    const prize = interaction.options.getString('prize');
    const duration = interaction.options.getInteger('duration');
    
    const embed = new EmbedBuilder()
      .setTitle('🎉 Giveaway! 🎉')
      .setDescription(`Prize: **${prize}**\nReact with 🎉 to enter!\nEnds in: **${duration}** seconds`)
      .setColor(0x00ff00);

    await interaction.reply({ embeds: [embed], fetchReply: true });
    const message = await interaction.fetchReply();
    
    await message.react('🎉');

    setTimeout(async () => {
      const fetchedMessage = await message.fetch();
      const reactions = fetchedMessage.reactions.cache.get('🎉');
      
      if (!reactions) return interaction.followUp('No one entered the giveaway.');

      const users = await reactions.users.fetch();
      const filteredUsers = users.filter(user => !user.bot);

      if (filteredUsers.size === 0) {
        return interaction.followUp('No valid entries, giveaway canceled.');
      }

      const winner = filteredUsers.random();

      await interaction.followUp(`🎉 Congratulations ${winner}! You won the **${prize}**! 🎉`);
    }, duration * 1000);
  },
};
