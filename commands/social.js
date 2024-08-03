const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('socialmedia')
        .setDescription('Sends a custom embed with a link button.')
        .addStringOption(option => 
            option.setName('title')
                .setDescription('The title of the embed')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('image')
                .setDescription('The URL of the image for the embed')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('buttonname')
                .setDescription('The text on the button')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('buttonurl')
                .setDescription('The URL the button links to')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('emojiid')
                .setDescription('The ID of the custom emoji for the button')
                .setRequired(false)), // Made optional; can be set to true if required

    async execute(interaction) {
        const title = interaction.options.getString('title');
        const imageUrl = interaction.options.getString('image');
        const buttonName = interaction.options.getString('buttonname');
        const buttonUrl = interaction.options.getString('buttonurl');
        const emojiId = interaction.options.getString('emojiid');

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setImage(imageUrl)
            .setColor(0xFF4D00); // Custom color code

        const button = new ButtonBuilder()
            .setLabel(buttonName)
            .setStyle(ButtonStyle.Link)
            .setURL(buttonUrl);

        if (emojiId) {
            button.setEmoji(emojiId); // Set the custom emoji by ID if provided
        }

        const row = new ActionRowBuilder().addComponents(button);

        // Send the message directly to the channel
        await interaction.channel.send({ embeds: [embed], components: [row] });

        // Acknowledge the interaction without sending a visible reply
        await interaction.deferReply({ ephemeral: true });
        await interaction.deleteReply();
    }
};
