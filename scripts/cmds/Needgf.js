const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "needgf",
    version: "1.0.2",
    author: "MOHAMMAD AKASH",
    countDown: 5,
    role: 0,
    shortDescription: "র‌্যান্ডম গার্লফ্রেন্ড আইডি পাঠায়",
    longDescription: "gfdata.json ফাইল থেকে র‌্যান্ডম গার্লফ্রেন্ড আইডি ও প্রোফাইল ছবি পাঠায়",
    category: "fun",
    guide: "{p}needgf"
  },

  onStart: async function({ api, event }) {
    try {
      const filePath = path.join(__dirname, "gfdata.json");
      const raw = fs.readFileSync(filePath);
      const data = JSON.parse(raw);

      if (!data.links || data.links.length === 0)
        return api.sendMessage("⚠️ JSON ফাইলে কোনো লিংক নাই ভাই 😭", event.threadID, event.messageID);

      const randomLink = data.links[Math.floor(Math.random() * data.links.length)];

      // Facebook প্রোফাইল পিকচার বের করা (public API)
      const profilePic = `${randomLink}?type=large`;

      const msg = {
        body: `😍 আপনার নতুন গফ পাওয়া গেছে ভাই 😚\n\n👉 ${randomLink}`,
        attachment: await global.utils.getStreamFromURL(profilePic)
      };

      return api.sendMessage(msg, event.threadID, event.messageID);

    } catch (err) {
      console.error(err);
      return api.sendMessage("⚠️ কিছু একটা গন্ডগোল হইছে ভাই 😭", event.threadID, event.messageID);
    }
  }
};
