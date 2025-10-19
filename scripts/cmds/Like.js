const lastLikeMap = new Map();

module.exports = {
  config: {
    name: "like",
    version: "1.0.3",
    author: "MOHAMMAD AKASH",
    countDown: 3,
    role: 0,
    shortDescription: "Send /like command & get the reply back",
    longDescription: "Sends your /like <uid> to another group and returns that group's success message back to you.",
    category: "system",
    guide: "{pn} <uid>",
  },

  // যখন কমান্ড পাঠানো হয়
  onStart: async function ({ api, event, args }) {
    const targetTid = "6601227983317461"; // টার্গেট গ্রুপ
    const sourceTid = event.threadID; // আপনার গ্রুপ
    const uid = args[0];

    if (!uid)
      return api.sendMessage("⚠️ অনুগ্রহ করে একটি UID দিন।\nউদাহরণ: /like 6650913413", sourceTid, event.messageID);

    const sendMessage = `/like ${uid}`;

    // পাঠানোর সোর্স মনে রাখে
    lastLikeMap.set(targetTid, sourceTid);

    // পাঠানো হচ্ছে
    api.sendMessage(sendMessage, targetTid, (err) => {
      if (err) return api.sendMessage("❌ টার্গেট গ্রুপে পাঠানো ব্যর্থ হয়েছে!", sourceTid, event.messageID);
      api.sendMessage(`✅ পাঠানো হয়েছে অন্য গ্রুপে:\n➡️ ${sendMessage}`, sourceTid, event.messageID);
    });
  },

  // যখন টার্গেট গ্রুপে মেসেজ আসে
  onEvent: async function ({ api, event }) {
    try {
      const { threadID, body } = event;
      if (!body) return;

      // টার্গেট গ্রুপের মেসেজ কিনা চেক
      if (!lastLikeMap.has(threadID)) return;

      const sourceTid = lastLikeMap.get(threadID);

      // যদি সেই মেসেজে SUCCESS বা LIKE SUCCESS থাকে
      if (
        body.toLowerCase().includes("like success") ||
        body.toLowerCase().includes("free fire like") ||
        body.toLowerCase().includes("success✅") ||
        body.toLowerCase().includes("✅")
      ) {
        // এখন রিপ্লাই পাঠাবে মূল গ্রুপে
        api.sendMessage(`💬 রিপ্লাই পাওয়া গেছে টার্গেট গ্রুপ থেকে:\n\n${body}`, sourceTid);
      }
    } catch (e) {
      console.log(e);
    }
  },
};
