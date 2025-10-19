const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "needgf",
    version: "3.0.0",
    author: "MOHAMMAD AKASH",
    countDown: 5,
    role: 0,
    shortDescription: "তোর Gf এর প্রোফাইল পিক দেখায় 😍",
    longDescription: "প্রতি বার কমান্ড দিলে র‍্যান্ডম এক Facebook আইডির প্রোফাইল পিক পাঠায় 😘",
    category: "fun"
  },

  onStart: async function ({ api, event }) {
    try {
      const gfLinks = [
        "https://www.facebook.com/Tahiya.islam.Mim.172981",
        "https://www.facebook.com/profile.php?id=61579313473560",
        "https://www.facebook.com/profile.php?id=61579200578210",
        "https://www.facebook.com/profile.php?id=100080828841579",
        "https://www.facebook.com/ntojkuangpremikayi.2025",
        "https://www.facebook.com/profile.php?id=61581525114036",
        "https://www.facebook.com/profile.php?id=61580075994194",
        "https://www.facebook.com/profile.php?id=61581179957989",
        "https://www.facebook.com/labanno.akther.507",
        "https://www.facebook.com/profile.php?id=61582203020368",
        "https://www.facebook.com/profile.php?id=61577263375927",
        "https://www.facebook.com/profile.php?id=61576316681115",
        "https://www.facebook.com/profile.php?id=61580087063928",
        "https://www.facebook.com/profile.php?id=61580737480343",
        "https://www.facebook.com/profile.php?id=61581072464419",
        "https://www.facebook.com/profile.php?id=61581253517272"
      ];

      // 🎯 Random লিংক বাছাই
      const randomLink = gfLinks[Math.floor(Math.random() * gfLinks.length)];

      // 📎 আইডি এক্সট্রাক্ট করা
      let fbID = null;
      const idMatch = randomLink.match(/id=(\d+)/);
      if (idMatch) {
        fbID = idMatch[1];
      } else {
        const usernameMatch = randomLink.match(/facebook\.com\/([^/?]+)/);
        fbID = usernameMatch ? usernameMatch[1] : null;
      }

      if (!fbID) return api.sendMessage("😅 প্রোফাইল লিংক ঠিক নেই!", event.threadID, event.messageID);

      // 🔗 প্রোফাইল পিক আনা
      const res = await axios.get(`https://graph.facebook.com/${fbID}/picture?width=800&height=800&redirect=false`);
      const imgURL = res.data.data.url;

      const cacheDir = path.join(__dirname, "cache");
      fs.ensureDirSync(cacheDir);
      const filePath = path.join(cacheDir, `gf_${fbID}.jpg`);

      const img = await axios.get(imgURL, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, Buffer.from(img.data, "binary"));

      // 💬 মেসেজ পাঠানো
      const message = {
        body: `🎉এই নে লুচ্চা তোর Gf 😚\nএখন আমারে এখন আমারে ট্রিট দে 🐱\n${randomLink}`,
        attachment: fs.createReadStream(filePath)
      };

      api.sendMessage(message, event.threadID, () => fs.unlinkSync(filePath), event.messageID);

    } catch (error) {
      console.error("❌ Error:", error);
      api.sendMessage("কিছু একটা সমস্যা হইছে ভাই 😅", event.threadID, event.messageID);
    }
  }
};
