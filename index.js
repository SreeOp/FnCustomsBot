const { Client, GatewayIntentBits, Collection, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');
require('dotenv').config();

// Import the setStatus function
const setStatus = require('./functions/setStatus');
// Import the staff application function
const staffApplication = require('./functions/staffApplication');
// Import the deployCommands function
const deployCommands = require('./deploy-commands');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Initialize commands collection
client.commands = new Collection();

// Command files
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Set commands to the collection
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

// Ready event
client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  // Set the bot's status
  setStatus(client);

  // Deploy commands
  await deployCommands();

  // Send the application message
  const applyChannelId = process.env.APPLY_CHANNEL_ID;
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

// Interaction create event
client.on('interactionCreate', async interaction => {
  console.log(`Received interaction: ${interaction.id} (${interaction.type})`);

  if (!interaction.isCommand() && !interaction.isButton() && !interaction.isModalSubmit()) return;

  try {
    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) return;

      const memberRoles = interaction.member.roles.cache;
      const allowedRoles = process.env.ALLOWED_ROLES.split(',');
      const hasPermission = allowedRoles.some(role => memberRoles.has(role));

      if (!hasPermission) {
        return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
      }

      await command.execute(interaction);
    } else if (interaction.isButton() || interaction.isModalSubmit()) {
      await staffApplication(client, interaction);
    }
  } catch (error) {
    console.error('Error handling interaction:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: 'There was an error processing your request.', ephemeral: true });
    } else {
      await interaction.followUp({ content: 'There was an error processing your request.', ephemeral: true });
    }
  }
});

// Login to Discord with your app's token from environment variables
client.login(process.env.DISCORD_TOKEN);

// Set up an Express server
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
