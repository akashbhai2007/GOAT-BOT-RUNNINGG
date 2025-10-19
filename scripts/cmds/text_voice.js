const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "text_voice",
    version: "1.2.0",
    author: "MOHAMMAD AKASH",
    countDown: 3,
    role: 0,
    shortDescription: "নির্দিষ্ট টেক্সটে কিউট মেয়ের ভয়েস প্লে করে 😍",
    longDescription: "যখন কেউ নির্দিষ্ট টেক্সট বা তার কাছাকাছি কিছু লিখবে, তখন বট সেই অনুযায়ী ভয়েস পাঠাবে। (ইমোজি বা অতিরিক্ত শব্দ থাকলেও চিনবে)",
    category: "noprefix"
  },

  onChat: async function ({ api, event }) {
    try {
      const { threadID, messageID, body } = event;
      if (!body) return;

      // ছোট হরফে কনভার্ট ও ইমোজি-স্পেশাল ক্যারেক্টার বাদ দাও
      const msg = body.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").trim();

      // 🎧 ভয়েস লিস্ট (কীওয়ার্ড অনুযায়ী)
      const textAudioMap = [
        { key: /i\s*love\s*you/, url: "https://files.catbox.moe/npy7kl.mp3" },
        { key: /mata\s*beta/, url: "https://files.catbox.moe/5rdtc6.mp3" },
      ];

      // যদি কোনো regex match করে
      const match = textAudioMap.find(item => item.key.test(msg));
      if (!match) return;

      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);

      const filePath = path.join(cacheDir, `${Date.now()}.mp3`);

      // ভয়েস ডাউনলোড
      const response = await axios.get(match.url, { responseType: "arraybuffer" });
      await fs.writeFile(filePath, response.data);

      // ভয়েস পাঠানো
      await api.sendMessage(
        {
          body: "🎧 কিউট ভয়েস আসছে 😍",
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        () => fs.unlink(filePath, () => {}),
        messageID
      );

    } catch (err) {
      console.error(err);
      api.sendMessage("⚠️ ভয়েস পাঠানো যায়নি ভাই 😅", event.threadID, event.messageID);
    }
  }
};
