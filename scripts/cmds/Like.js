const lastLikeMap = new Map();

module.exports = {
  config: {
    name: "like",
    version: "1.0.2",
    author: "MOHAMMAD AKASH",
    countDown: 3,
    role: 0,
    shortDescription: "Send /like command & get reply back",
    longDescription: "Send /like command to another group and receive that group's reply back automatically.",
    category: "system",
    guide: "{pn} <uid>",
  },

  // যখন কমান্ড চালানো হবে
  onStart: async function ({ api, event, args }) {
    const targetTid = "6601227983317461"; // টার্গেট গ্রুপ
    const sourceTid = event.threadID; // যেখান থেকে পাঠানো হচ্ছে
    const uid = args[0];

    if (!uid)
      return api.sendMessage("⚠️ অনুগ্রহ করে একটি UID দিন। উদাহরণ: /like 2099807760", sourceTid, event.messageID);

    const sendMessage = `/like ${uid}`;

    // মনে রাখবে কোথা থেকে পাঠানো হয়েছে
    lastLikeMap.set(targetTid, sourceTid);

    api.sendMessage(sendMessage, targetTid, (err) => {
      if (err) return api.sendMessage("❌ মেসেজ পাঠানো যায়নি!", sourceTid, event.messageID);
      api.sendMessage(`✅ পাঠানো হয়েছে অন্য গ্রুপে:\n➡️ ${sendMessage}`, sourceTid, event.messageID);
    });
  },

  // ইভেন্ট ট্র্যাক করবে (রিপ্লাই ধরার জন্য)
  onEvent: async function ({ api, event }) {
    const { threadID, messageReply, body } = event;
    if (!lastLikeMap.has(threadID)) return;

    const sourceTid = lastLikeMap.get(threadID);

    // রিপ্লাই করা হয়েছে কিনা চেক
    if (messageReply || body) {
      const replyText = messageReply?.body || body;
      api.sendMessage(`💬 রিপ্লাই পাওয়া গেছে:\n${replyText}`, sourceTid);
    }
  }
};
