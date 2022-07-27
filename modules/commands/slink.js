module.exports.config = {
  name: "slink",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "D-Jukie",
  description: "Rút gọn url gốc của bạn (nó có thể dài hơn link cũ) =)))",
  commandCategory: "other",
  usages: "[link]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const axios = require("axios");
  var url = args.join(' ')
  if (event.type == "message_reply") {
    var url = event.messageReply.body;
  }
  const { data } = await axios.get('https://www.phamvandien.xyz/slink?url=' + url)
  return api.sendMessage("Link đã rút gọn: " + data.url, event.threadID, event.messageID);
}