const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "text_voice",
    version: "2.0.0",
    author: "MOHAMMAD AKASH",
    countDown: 3,
    role: 0,
    shortDescription: "নির্দিষ্ট টেক্সটে কিউট ভয়েস রিপ্লাই দেয় 😍",
    longDescription: "যখন কেউ নির্দিষ্ট টেক্সট (শব্দ/বাক্য) লিখবে, বট সেই অনুযায়ী ভয়েস পাঠাবে — টেক্সট যেখানেই থাকুক না কেন।",
    category: "noprefix"
  },

  onChat: async function ({ api, event }) {
    try {
      const { threadID, messageID, body } = event;
      if (!body) return;

      // সব ছোট হরফে ও ইমোজি-স্পেশাল ক্যারেক্টার বাদ দিয়ে প্রসেস করো
      const msg = body.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").trim();

      // 🔊 ভয়েস ম্যাপ (তুমি চাইলে এখানে যত খুশি যোগ করতে পারো)
      const textAudioMap = [
        { key: /i\s*love\s*you/, url: "https://files.catbox.moe/npy7kl.mp3" },
        { key: /i\s*love\s*you\s*baby/, url: "https://files.catbox.moe/npy7kl.mp3" },
        { key: /mata\s*beta/, url: "https://files.catbox.moe/5rdtc6.mp3" },
        { key: /good\s*morning/, url: "https://files.catbox.moe/jd4qxp.mp3" },
        { key: /miss\s*you/, url: "https://files.catbox.moe/1piy13.mp3" },
      ];

      // ✅ যেকোনো regex মিললেই ধরবে
      const match = textAudioMap.find(item => item.key.test(msg));
      if (!match) return;

      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);

      const filePath = path.join(cacheDir, `${Date.now()}.mp3`);

      // ভয়েস ডাউনলোড করো
      const res = await axios.get(match.url, { responseType: "arraybuffer" });
      await fs.writeFile(filePath, res.data);

      // ভয়েস পাঠাও
      api.sendMessage(
        {
          body: "🎧 ভয়েস আসতেছে ভাই 😍",
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        () => fs.unlink(filePath, () => {}),
        messageID
      );

    } catch (err) {
      console.error("❌ ERROR:", err);
      api.sendMessage("⚠️ ভয়েস পাঠানো যায়নি ভাই 😅", event.threadID, event.messageID);
    }
  }
};
