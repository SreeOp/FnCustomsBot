const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = async (client, interaction) => {
  try {
    if (interaction.isButton()) {
      if (interaction.customId === 'apply') {
        // Handle the application modal
        const modal = new ModalBuilder()
          .setCustomId('staffApplication')
          .setTitle('Staff Application');

        const questions = [
          { id: 'name', label: 'What is your name?' },
          { id: 'age', label: 'How old are you?' },
          { id: 'experience', label: 'Do you have any prior experience?' },
          { id: 'reason', label: 'Why do you want to be a staff member?' },
        ];

        const components = questions.map(question => new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId(question.id)
            .setLabel(question.label)
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        ));

        modal.setComponents(components);

        await interaction.showModal(modal);
      } else if (interaction.customId === 'accept' || interaction.customId === 'reject') {
        // Handle acceptance or rejection of the application
        const buttonType = interaction.customId;
        const message = interaction.message;

        if (!message.embeds.length) {
          console.error('No embed found in the interaction message.');
          return;
        }

        const embed = message.embeds[0];
        const submittedUserId = embed.fields.find(field => field.name === 'UserID')?.value;

        if (!submittedUserId) {
          console.error('Submitted user ID not found.');
          return;
        }

        const logChannelId = process.env.LOG_CHANNEL_ID;
        const logChannel = client.channels.cache.get(logChannelId);

        if (!logChannel) {
          console.error('Log channel not found.');
          await interaction.reply({ content: 'Failed to process the application. Log channel not found.', ephemeral: true });
          return;
        }

        try {
          if (buttonType === 'accept') {
            // Update interaction message
            await interaction.update({ content: 'Application accepted!', components: [] });

            // Send follow-up message to the log channel
            const followUpEmbed = new EmbedBuilder()
              .setTitle('Application Accepted')
              .setColor('#00FF00')
              .setDescription(`The application by <@${submittedUserId}> has been accepted.`)
              .setTimestamp();

            await logChannel.send({ content: `<@${submittedUserId}>`, embeds: [followUpEmbed] });
          } else if (buttonType === 'reject') {
            // Update interaction message
            await interaction.update({ content: 'Application rejected!', components: [] });

            // Send follow-up message to the log channel
            const followUpEmbed = new EmbedBuilder()
              .setTitle('Application Rejected')
              .setColor('#FF0000')
              .setDescription(`The application by <@${submittedUserId}> has been rejected.`)
              .setTimestamp();

            await logChannel.send({ content: `<@${submittedUserId}>`, embeds: [followUpEmbed] });
          }
        } catch (error) {
          console.error('Failed to update interaction or send follow-up message:', error);
          await interaction.reply({ content: 'Failed to process the application.', ephemeral: true });
        }
      }
    } else if (interaction.isModalSubmit()) {
      if (interaction.customId === 'staffApplication') {
        // Handle modal submission
        const name = interaction.fields.getTextInputValue('name');
        const age = interaction.fields.getTextInputValue('age');
        const experience = interaction.fields.getTextInputValue('experience');
        const reason = interaction.fields.getTextInputValue('reason');
        const submittedUserId = interaction.user.id;

        const logChannelId = process.env.LOG_CHANNEL_ID;
        const logChannel = client.channels.cache.get(logChannelId);

        if (!logChannel) {
          console.error('Log channel not found.');
          await interaction.reply({ content: 'Failed to submit application. Log channel not found.', ephemeral: true });
          return;
        }

        const embed = new EmbedBuilder()
          .setTitle('New Staff Application')
          .setColor('#00FF00')
          .addFields(
            { name: 'Name', value: name, inline: true },
            { name: 'Age', value: age, inline: true },
            { name: 'Experience', value: experience, inline: false },
            { name: 'Reason', value: reason, inline: false },
            { name: 'UserID', value: submittedUserId, inline: false }
          )
          .setTimestamp();

        const buttons = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('accept')
            .setLabel('Accept')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId('reject')
            .setLabel('Reject')
            .setStyle(ButtonStyle.Danger)
        );

        await logChannel.send({ embeds: [embed], components: [buttons] });
        await interaction.reply({ content: 'Thank you for your application! We will review it and get back to you soon.', ephemeral: true });
      }
    }
  } catch (error) {
    console.error('Error handling interaction:', error);
    if (!interaction.replied) {
      await interaction.reply({ content: 'There was an error processing your request.', ephemeral: true });
    }
  }
};
