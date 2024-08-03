const { ActivityType } = require('discord.js');

// Array of status messages with their types
const statusMessages = [
  { name: "Florencia Customs", type: ActivityType.Playing },
  { name: "Custom Works", type: ActivityType.Watching },
  { name: "Tickets", type: ActivityType.Listening },
  { name: "#UnleashTheBeast", type: ActivityType.Playing }
];

let currentIndex = 0;

module.exports = (client) => {
  function updateStatus() {
    const currentStatus = statusMessages[currentIndex];
    currentIndex = (currentIndex + 1) % statusMessages.length;

    client.user.setPresence({
      activities: [{ name: currentStatus.name, type: currentStatus.type }],
      status: 'dnd', // You can set this to 'online', 'idle', or 'invisible' as needed
    });
  }

  // Update status every 25 seconds (25000 ms)
  setInterval(updateStatus, 25000);

  // Initial status set
  updateStatus();
};
