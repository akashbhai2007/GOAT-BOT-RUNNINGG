const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "needgf",
    version: "1.0.0",
    author: "MOHAMMAD AKASH",
    countDown: 10,
    role: 0,
    shortDescription: "র‍্যান্ডম গফ আইডি দেয় ❤️",
    longDescription: "সিঙ্গেলদের জন্য র‍্যান্ডম গফ লিংক সহ প্রোফাইল ছবি পাঠায় 😭",
    category: "fun",
    guide: "{pn}"
  },

  onStart: async function ({ message, event }) {
    try {
      // JSON ফাইল থেকে লিংক পড়া
      const dataPath = path.join(__dirname, "gfdata.json");
      const rawData = fs.readFileSync(dataPath);
      const jsonData = JSON.parse(rawData);
      const links = jsonData.links;

      if (!Array.isArray(links) || links.length === 0)
        return message.reply("⚠️ কোনো লিংক পাওয়া যায়নি `gfdata.json` এ!");

      // র‍্যান্ডম লিংক নির্বাচন
      const randomLink = links[Math.floor(Math.random() * links.length)];

      // প্রোফাইল আইডি/ইউজারনেম বের করা
      const idMatch = randomLink.match(/id=(\d+)/);
      const usernameMatch = randomLink.match(/facebook\.com\/([^/?]+)/);
      const userId = idMatch ? idMatch[1] : usernameMatch ? usernameMatch[1] : null;

      if (!userId)
        return message.reply("⚠️ প্রোফাইল আইডি পাওয়া যায়নি!");

      // প্রোফাইল পিকচার ডাউনলোড
      const imgUrl = `https://graph.facebook.com/${userId}/picture?width=720&height=720`;
      const imgPath = path.join(__dirname, "cache", `${event.senderID}_gf.jpg`);
      const response = await axios.get(imgUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(imgPath, Buffer.from(response.data, "binary"));

      // পাঠানো
      await message.reply({
        body: `এই নে বলদ তোরে গফ দিলাম 😤\n${randomLink}`,
        attachment: fs.createReadStream(imgPath)
      });

      // মেমরি ক্লিন
      fs.unlinkSync(imgPath);

    } catch (err) {
      console.error(err);
      message.reply("⚠️ কিছু একটা গন্ডগোল হইছে ভাই 😭");
    }
  }
};
