const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = async (client, interaction) => {
  try {
    if (interaction.isButton()) {
      if (interaction.customId === 'apply') {
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
            await interaction.update({ content: 'Application accepted!', components: [] });

            const followUpEmbed = new EmbedBuilder()
              .setTitle('Application Accepted')
              .setColor('#00FF00')
              .setDescription(`The application by <@${submittedUserId}> has been accepted.`)
              .setTimestamp();

            await logChannel.send({ content: `<@${submittedUserId}>`, embeds: [followUpEmbed] });

            const config = require('../config.json');
            const targetChannelId = config.applicationChannelId;
            const targetChannel = client.channels.cache.get(targetChannelId);

            if (targetChannel) {
              await targetChannel.send(`Congratulations <@${submittedUserId}>, your application has been accepted!`);
            } else {
              console.error('Target channel not found.');
            }

          } else if (buttonType === 'reject') {
            await interaction.update({ content: 'Application rejected!', components: [] });

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
        const name = interaction.fields.getTextInputValue('name');
        const age = interaction.fields.getTextInputValue('age');
        const experience = interaction.fields.getTextInputValue('experience');
        const reason = interaction.fields.getTextInputValue('reason');

        const submittedUserId = interaction.user.id;

        const embed = new EmbedBuilder()
          .setTitle('Staff Application')
          .addFields(
            { name: 'Name', value: name },
            { name: 'Age', value: age },
            { name: 'Experience', value: experience },
            { name: 'Reason', value: reason },
            { name: 'UserID', value: submittedUserId }
          )
          .setColor('#0099FF')
          .setTimestamp();

        const config = require('../config.json');
        const applyChannelId = config.applicationChannelId;
        const applyChannel = client.channels.cache.get(applyChannelId);

        if (applyChannel) {
          await applyChannel.send({ embeds: [embed] });
        } else {
          console.error('Apply channel not found.');
          await interaction.reply({ content: 'Failed to submit the application. Apply channel not found.', ephemeral: true });
        }

        await interaction.reply({ content: 'Application submitted successfully!', ephemeral: true });
      }
    }
  } catch (error) {
    console.error('Error handling interaction:', error);
    if (!interaction.replied) {
      await interaction.reply({ content: 'There was an error processing your request.', ephemeral: true });
    }
  }
};
