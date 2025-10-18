const axios = require("axios");
const simsim = "http://www.noobs-api.rf.gd/dipto/baby";

module.exports = {
  config: {
    name: "baby",
    version: "1.0.5",
    author: "MOHAMMAD AKASH",
    countDown: 0,
    role: 0,
    shortDescription: "Cute AI Baby Chatbot",
    longDescription: "Talk, Teach & Chat with Emotion — Baby AI chatbot powered by Dipto API",
    category: "fun",
    guide: {
      en: "{p}baby [message]\n{p}baby teach [Question] - [Answer]\n{p}baby edit [Question] - [OldReply] - [NewReply]\n{p}baby remove [Question] - [Reply]\n{p}baby list"
    }
  },

  onStart: async function ({ api, event, args, message, usersData }) {
    try {
      const senderID = event.senderID;
      const senderName = await usersData.getName(senderID);
      const query = args.join(" ").toLowerCase();

      if (!query) {
        const ran = ["বলো না baby 😚", "হুমম বলো...", "আমি আছি তোমার পাশে 😌"];
        const r = ran[Math.floor(Math.random() * ran.length)];
        return message.reply(r, (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, { commandName: "baby", author: senderID });
          }
        });
      }

      // remove
      if (["remove", "rm"].includes(args[0])) {
        const parts = query.replace(/^(remove|rm)\s*/, "").split(" - ");
        if (parts.length < 2) return message.reply("Use: baby remove [Question] - [Reply]");
        const [ask, ans] = parts;
        const res = await axios.get(`${simsim}?remove=${encodeURIComponent(ask)}&reply=${encodeURIComponent(ans)}&senderID=${senderID}`);
        return message.reply(res.data.message);
      }

      // list
      if (args[0] === "list") {
        const res = await axios.get(`${simsim}?list=all`);
        if (res.data)
          return message.reply(`♾ Total Teach: ${res.data.length || "unknown"}\n♻️ Total Response: ${res.data.responseLength || "unknown"}`);
        else return message.reply("Failed to fetch list from Dipto API.");
      }

      // edit
      if (args[0] === "edit") {
        const parts = query.replace("edit ", "").split(" - ");
        if (parts.length < 3) return message.reply("Use: baby edit [Question] - [OldReply] - [NewReply]");
        const [ask, oldReply, newReply] = parts;
        const res = await axios.get(`${simsim}?edit=${encodeURIComponent(ask)}&old=${encodeURIComponent(oldReply)}&replace=${encodeURIComponent(newReply)}&senderID=${senderID}`);
        return message.reply(res.data.message || "Reply updated successfully!");
      }

      // teach
      if (args[0] === "teach") {
        const parts = query.replace("teach ", "").split(" - ");
        if (parts.length < 2) return message.reply("Use: baby teach [Question] - [Reply]");
        const [ask, ans] = parts;
        const res = await axios.get(`${simsim}?teach=${encodeURIComponent(ask)}&reply=${encodeURIComponent(ans)}&senderID=${senderID}&senderName=${encodeURIComponent(senderName)}`);
        return message.reply(res.data.message || "Reply added successfully!");
      }

      // normal chat
      const res = await axios.get(`${simsim}?text=${encodeURIComponent(query)}&senderID=${senderID}&senderName=${encodeURIComponent(senderName)}`);
      const replyText = res.data.reply || res.data.message || "No response.";
      message.reply(replyText, (err, info) => {
        if (!err) {
          global.GoatBot.onReply.set(info.messageID, { commandName: "baby", author: senderID });
        }
      });

    } catch (err) {
      console.error(err);
      message.reply(`Error in baby command: ${err.message}`);
    }
  },

  onReply: async function ({ api, event, Reply, message, usersData }) {
    try {
      const senderName = await usersData.getName(event.senderID);
      const replyText = event.body ? event.body.toLowerCase() : "";
      if (!replyText) return;

      const res = await axios.get(`${simsim}?text=${encodeURIComponent(replyText)}&senderID=${event.senderID}&senderName=${encodeURIComponent(senderName)}`);
      const replyMsg = res.data.reply || res.data.message || "No reply found.";
      message.reply(replyMsg, (err, info) => {
        if (!err) {
          global.GoatBot.onReply.set(info.messageID, { commandName: "baby", author: event.senderID });
        }
      });

    } catch (err) {
      console.error(err);
      message.reply(`Error in baby reply: ${err.message}`);
    }
  },

  onChat: async function ({ api, event, message, usersData }) {
    try {
      const raw = event.body ? event.body.toLowerCase().trim() : "";
      if (!raw) return;

      const senderName = await usersData.getName(event.senderID);
      const senderID = event.senderID;

      // 🎀 trigger words
      if (["baby", "bot", "bby", "jannu", "xan", "বেপি", "বট", "বেবি", "oi", "oii", "mim", "sadiya"].includes(raw)) {
        const greetings = [
          "বেশি bot Bot করলে leave নিবো কিন্তু😒😒",
          "শুনবো না😼 তুমি আমার বস আকাশ কে প্রেম করাই দাও নাই🥺পচা তুমি🥺",
          "আমি আবাল দের সাথে কথা বলি না, ok? 😒",
          "এতো ডেকো না, প্রেম এ পরে যাবো তো🙈",
          "ওমা, তুমি আবার কে রে!😹",
          "চুপ করো না হলে থাপ্পড় দিবো কিন্তু🥱",
          "তুমি মনে হয় আকাশ ভাই এর ফ্যান 😏",
          "তোমারে block দিমু এখন 😾",
          "বস আকাশ আসলে তবেই কথা বলব 😎",
          "আজকে মুড ভালো, বেশি ভাবিও না 💅",
        ];
        const randomReply = greetings[Math.floor(Math.random() * greetings.length)];
        return message.reply({
          body: `@${senderName} ${randomReply}`,
          mentions: [{ tag: `@${senderName}`, id: senderID }]
        }, (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, { commandName: "baby", author: senderID });
          }
        });
      }

      // 💬 if starts with baby/bot + message
      const prefixes = ["baby ", "bot ", "bby ", "jannu ", "xan ", "বেপি ", "বট ", "বেবি "];
      const prefixMatch = prefixes.find(p => raw.startsWith(p));
      if (prefixMatch) {
        const query = raw.replace(prefixMatch, "").trim();
        if (!query) return;
        const res = await axios.get(`${simsim}?text=${encodeURIComponent(query)}&senderID=${senderID}&senderName=${encodeURIComponent(senderName)}`);
        const replyMsg = res.data.reply || res.data.message || "No response.";
        message.reply(replyMsg, (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, { commandName: "baby", author: senderID });
          }
        });
      }

    } catch (err) {
      console.error(err);
    }
  }
};
