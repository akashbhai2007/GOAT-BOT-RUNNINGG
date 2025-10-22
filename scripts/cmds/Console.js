/*
AUTHOR: MOHAMMAD AKASH
COMMAND: console
DESCRIPTION: Fake terminal-style console output with status lines
COMPATIBLE: Goat Bot V2
*/

module.exports = {
  config: {
    name: "console",
    version: "1.0.3",
    role: 0,
    author: "MOHAMMAD AKASH",
    description: "Simulate a full console boot sequence",
    category: "fun",
    usages: "console <text>",
    cooldowns: 3
  },

  onStart: async function ({ api, event, args }) {
    const input = args.join(" ");
    if (!input) {
      return api.sendMessage("💻 | Usage: console <command>", event.threadID);
    }

    const banner = `
░█████╗░██╗░░██╗░█████╗░░██████╗██╗░░██╗
██╔══██╗██║░██╔╝██╔══██╗██╔════╝██║░░██║
███████║█████═╝░███████║╚█████╗░███████║
██╔══██║██╔═██╗░██╔══██║░╚═══██╗██╔══██║
██║░░██║██║░╚██╗██║░░██║██████╔╝██║░░██║
╚═╝░░╚═╝╚═╝░░╚═╝╚═╝░░╚═╝╚═════╝░╚═╝░░╚═╝
`;

    // Step-wise animation messages
    const sequence = [
      "🧠 Initializing system modules...",
      "⚙️ Booting up virtual environment...",
      "📡 Connecting to main server...",
      "💾 Loading configuration files...",
      "✅ Successfully initialized!",
      "🚀 Bot Running... All Systems Active 🔥",
      `\n> ${input}\n\nOutput:\n✅ Command executed successfully!\nSystem: ACTIVE\nUser: MOHAMMAD AKASH 👑`
    ];

    // Send the first banner
    api.sendMessage("```\n" + banner + "\n```", event.threadID, async (err, info) => {
      for (let i = 0; i < sequence.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1200));
        api.editMessage("```\n" + banner + "\n```\n" + sequence.slice(0, i + 1).join("\n"), info.messageID);
      }
    });
  }
};
