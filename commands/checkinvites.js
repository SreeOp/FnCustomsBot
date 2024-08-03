const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('checkinvites')
        .setDescription('Check your or another user\'s invites.')
        .addUserOption(option => 
            option.setName('user')
                  .setDescription('The user to check invites for')
                  .setRequired(false)),
    async execute(interaction) {
        // Get the guild and member
        const guild = interaction.guild;
        const member = interaction.options.getMember('user') || interaction.member;

        try {
            // Fetch all invites of the guild
            const invites = await guild.invites.fetch();
            // Calculate the total number of uses for invites created by the member
            const userInvites = invites.filter(inv => inv.inviter.id === member.id);
            const totalUses = userInvites.reduce((acc, invite) => acc + invite.uses, 0);

            // Create an embed message
            const embed = new EmbedBuilder()
                .setColor(0xFF4D00) // Color code as an integer
                .setTitle('Invite Check')
                .setDescription(`${member.displayName} has ${totalUses} invite(s).`)
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp()
                .setFooter({ text: 'Invite Information' });

            // Reply with the embed
            interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'Failed to fetch invites.', ephemeral: true });
        }
    },
};
