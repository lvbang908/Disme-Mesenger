const fs = require('fs');
module.exports.config = {
    name: "sound",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "D-Jukie",
    description: "Phát nhạc thông qua link soundcloud hoặc từ khoá tìm kiếm",
    commandCategory: "Phương tiện",
    usages: "[searchMusic]",
    cooldowns: 0
};
module.exports.handleReply = async function ({ api, event, handleReply }) {
    try {
        var path = `${__dirname}/cache/sing-${event.senderID}.mp3`
        var data = await global.soundcloud.getData(handleReply.link[event.body -1]);
        data.timestart = Date.now()
        await global.utils.downloadFile(data.dataMusic.linkDownload[1].url, path);
        if (fs.statSync(path).size > 26214400) return api.sendMessage('Không thể gửi file vì dung lượng lớn hơn 25MB.', event.threadID, () => fs.unlinkSync(path), event.messageID);
        api.unsendMessage(handleReply.messageID)
        return api.sendMessage({ 
            body: `🎵 Title: ${data.dataMusic.title}\n⏱️Thời gian xử lý: ${Math.floor((Date.now()- data.timestart)/1000)} giây\n💿====DISME PROJECT====💿`,
            attachment: fs.createReadStream(path)}, event.threadID, ()=> fs.unlinkSync(path), 
         event.messageID)
            
    }
    catch (e) { return console.log(e) }
}
module.exports.run = async function ({ api, event, args }) {
    if (args.length == 0 || !args) return api.sendMessage('» Phần tìm kiếm không được để trống!', event.threadID, event.messageID);
    const keywordSearch = args.join(" ");
    var path = `${__dirname}/cache/sing-${event.senderID}.mp3`
    if (fs.existsSync(path)) { 
        fs.unlinkSync(path)
    }
    if (args.join(" ").indexOf("https://") == 0) {
        try {
            var data = await global.soundcloud.getData(args.join(" "));
            data.timestart = Date.now()
            await global.utils.downloadFile(data.dataMusic.linkDownload[1].url, path);
            if (fs.statSync(path).size > 26214400) return api.sendMessage('Không thể gửi file vì dung lượng lớn hơn 25MB.', event.threadID, () => fs.unlinkSync(path), event.messageID);
            return api.sendMessage({ 
                body: `🎵 Title: ${data.dataMusic.title}\n⏱️Thời gian xử lý: ${Math.floor((Date.now()- data.timestart)/1000)} giây\n💿====DISME PROJECT====💿`,
                attachment: fs.createReadStream(path)}, event.threadID, ()=> fs.unlinkSync(path), 
            event.messageID)
            
        }
        catch (e) { return console.log(e) }
    } else {
          try {
            var link = [],
                msg = "",
                num = 0
            const data = await global.soundcloud.search(args.join(" "), 6);
            for (let value of data) {
              link.push(value.dataMusic.permalink_url);
              num = num+=1
              msg += (`${num} - ${value.dataMusic.title}\n`);
            }
            var body = `»🔎 Có ${link.length} kết quả trùng với từ khoá tìm kiếm của bạn:\n\n${msg}» Hãy reply(phản hồi) chọn một trong những tìm kiếm trên`
            return api.sendMessage({
              body: body
            }, event.threadID, (error, info) => global.client.handleReply.push({
              type: 'reply',
              name: this.config.name,
              messageID: info.messageID,
              author: event.senderID,
              link
            }), event.messageID);
          } catch(e) {
            return api.sendMessage('Đã xảy ra lỗi, vui lòng thử lại trong giây lát!!\n' + e, event.threadID, event.messageID);
        }
    }
}