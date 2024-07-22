const { Client, GatewayIntentBits, Collection, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');
require('dotenv').config();

const setStatus = require('./functions/setStatus');
const staffApplication = require('./functions/staffApplication');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  setStatus(client);

  // Load the application channel from the config file
  const config = require('./config.json');
  const applyChannelId = config.applicationChannelId;
  const applyChannel = client.channels.cache.get(applyChannelId);

  if (applyChannel) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('apply')
        .setLabel('Apply for Staff')
        .setStyle(ButtonStyle.Primary)
    );

    await applyChannel.send({
      content: 'Click the button below to apply for a staff position.',
      components: [row],
    });
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand() && !interaction.isButton() && !interaction.isModalSubmit()) return;

  if (interaction.isCommand()) {
    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    const memberRoles = interaction.member.roles.cache;
    const allowedRoles = process.env.ALLOWED_ROLES.split(',');
    const hasPermission = allowedRoles.some(role => memberRoles.has(role));

    if (!hasPermission) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (!interaction.replied) {
        await interaction.reply({ content: 'There was an error executing that command!', ephemeral: true });
      } else {
        await interaction.followUp({ content: 'There was an error executing that command!', ephemeral: true });
      }
    }
  } else if (interaction.isButton() || interaction.isModalSubmit()) {
    try {
      await staffApplication(client, interaction);
    } catch (error) {
      console.error('Error handling interaction:', error);
      if (!interaction.replied) {
        await interaction.reply({ content: 'There was an error processing your request.', ephemeral: true });
      }
    }
  }
});

client.login(process.env.DISCORD_TOKEN);

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
