const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra"); // fs-extra ব্যবহার করা হবে, কারণ এটি fs এর চেয়ে বেশি কার্যকরী
const axios = require("axios");
const path = require("path"); // path মডিউল যোগ করা হয়েছে ফাইল পাথ তৈরির জন্য

module.exports = {
  config: {
    name: "wanted",
    aliases: ["wtd"], // আপনি চাইলে অন্য অ্যালিয়াস যোগ করতে পারেন
    version: "1.2.0",
    author: "Rx Abdullah Convert To Goat bot v2 by Akash",
    countdown: 5, // কুলডাউন সেকেন্ডে
    role: 0, // 0 = সব ইউজার, 1 = অ্যাডমিন, 2 = বট মালিক
    description: "Generate a wanted poster with user's avatar.",
    category: "fun",
    guide: {
      en: "{pn} mention\nor reply to a message." // {pn} কমান্ডের নাম দ্বারা প্রতিস্থাপিত হবে
    }
  },

  onstart: async function ({ api, event }) {
    try {
      const mentions = Object.keys(event.mentions || {});
      let targetuid;

      // টার্গেট ইউজার নির্ধারণ করুন (রিপ্লাই বা মেনশন)
      if (event.messageReply) {
        targetuid = event.messageReply.senderID;
      } else if (mentions.length > 0) {
        targetuid = mentions[0];
      } else {
        // যদি টার্গেট ইউজার না থাকে, তাহলে সেন্ডারকেই টার্গেট করা হবে (আগের লজিকে ছিল)
        // অথবা আপনি ইউজারকে রিপ্লাই বা মেনশন করতে বলতে পারেন।
        targetuid = event.senderID; 
        // আপনি চাইলে এটিও ব্যবহার করতে পারেন:
        // return api.sendMessage("Please reply to a message or mention a user to use this command.", event.threadID, event.messageID);
      }

      // টার্গেট ইউজারের তথ্য আনুন
      const userInfo = await api.getUserInfo(targetuid);
      const name = userInfo[targetuid].name;

      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir); // নিশ্চিত করুন যে /cache ফোল্ডার আছে
      
      const pathBg = path.join(cacheDir, "wanted_bg.png");
      const pathAvt = path.join(cacheDir, "wanted_avt.png");
      const pathOut = path.join(cacheDir, `wanted_${targetuid}_result.png`); // ফাইল নাম ইউনিক করা হয়েছে

      // 🖼️ ব্যাকগ্রাউন্ড (কাস্টম Imgur wanted poster)
      const bgLink = "https://i.imgur.com/hNj6wpU.jpeg"; // পরিষ্কার, উচ্চ মানের পোস্টার ফ্রেম
      const bgResponse = await axios.get(bgLink, { responseType: "arraybuffer" });
      fs.writeFileSync(pathBg, Buffer.from(bgResponse.data));

      // 👤 প্রোফাইল ছবি
      const avtLink = `https://graph.facebook.com/${targetuid}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const avtResponse = await axios.get(avtLink, { responseType: "arraybuffer" });
      fs.writeFileSync(pathAvt, Buffer.from(avtResponse.data));

      // 🧩 দুটি ছবি লোড করুন
      const base = await loadImage(pathBg);
      const avatar = await loadImage(pathAvt);
      const canvas = createCanvas(base.width, base.height);
      const ctx = canvas.getContext("2d");

      // 🖌️ ব্যাকগ্রাউন্ড এবং প্রোফাইল ছবি আঁকুন
      ctx.drawImage(base, 0, 0, canvas.width, canvas.height);

      // প্রোফাইল ছবির অবস্থান (GoatBot স্টাইল): ফ্রেমের মাঝখানে
      ctx.save();
      ctx.beginPath();
      ctx.arc(350, 420, 150, 0, Math.PI * 2, true); // গোলাকার মাস্ক
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, 200, 270, 300, 300);
      ctx.restore();

      // ✍️ টেক্সট (নাম)
      ctx.font = "bold 38px Times New Roman";
      ctx.fillStyle = "#3e2d00"; // গাঢ় খয়েরি রং
      ctx.textAlign = "center";

      // টেক্সট র্যাপিং ফাংশন
      const wrapText = async (ctx, text, maxWidth) => {
        if (ctx.measureText(text).width < maxWidth) return [text];
        const words = text.split(" ");
        const lines = [];
        let line = "";
        for (const word of words) {
          if (ctx.measureText(line + word).width < maxWidth) line += word + " ";
          else {
            lines.push(line.trim());
            line = word + " ";
          }
        }
        if (line) lines.push(line.trim());
        return lines;
      };

      const lines = await wrapText(ctx, name, 400); // নামের টেক্সট র্যাপ করা
      lines.forEach((line, i) => {
        ctx.fillText(line, canvas.width / 2, 640 + i * 42); // পোস্টারে নাম লেখা
      });

      // 🧾 ফলাফল সংরক্ষণ করুন
      const imgBuffer = canvas.toBuffer();
      fs.writeFileSync(pathOut, imgBuffer);

      // 📨 ছবি পাঠান
      api.sendMessage(
        {
          body: `🚨 WANTED ALERT 🚨\n${name} is a dangerous outlaw!\n💰 Reward: $1 (dead or alive)`,
          attachment: fs.createReadStream(pathOut)
        },
        event.threadID,
        () => {
          // টেম্পোরারি ফাইলগুলো ডিলিট করুন
          fs.unlinkSync(pathBg);
          fs.unlinkSync(pathAvt);
          fs.unlinkSync(pathOut);
        },
        event.messageID
      );

    } catch (e) {
      console.error("Error generating wanted image:", e); // বিস্তারিত ত্রুটি লগ করুন
      api.sendMessage("❌ Couldn't generate wanted image. Please try again later.", event.threadID, event.messageID);
    }
  }
};
