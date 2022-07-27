const { writeFileSync, createReadStream } = require('fs');
module.exports.config = {
    name: "tiktok",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "D-Jukie",
    description: "Thông tin từ nền tảng TikTok",
    commandCategory: "Phương tiện",
    usages: "[link]",
    cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const type = args[0];
    switch (type.toLowerCase()) {
        case "info":
            var username = args[1];
            var info = await global.tiktok.getInfoUser(username);
            var { user, stats } = info.userInfo,
                id = user.id,
                nickname = user.nickname,
                avatar = user.avatarMedium,
                signature = user.signature,
                username = user.uniqueId,
                followers = stats.followerCount,
                following = stats.followingCount,
                total_videos = stats.videoCount
            var msg = `Tên: ${nickname}\nID: ${id}\nAvatar: ${avatar}\nChữ ký: ${signature}\nUsername: ${username}\nSố người theo dõi: ${followers}\nSố người đang theo dõi: ${following}\nSố video: ${total_videos}`
            api.sendMessage(msg, threadID, messageID);
            break
        case 'search':
            var keyword = args.join(" ").slice(args[0].length + 1);
            var result = await global.tiktok.searchVideo(keyword);
            var msg = `Tìm thấy 6 kết quả\n`,
                num = 1
            for(let i = 0; i <= 5 ; i++) {
                msg += `${num++} - Mô tả: ${result[i].desc} \nTim: ${result[i].stats.diggCount}\nBình luận: ${result[i].stats.commentCount}\nLượt xem: ${result[i].stats.playCount}\nAuthor: ${result[i].author.nickname}\n\n`
            }
            msg += `Vui lòng reply theo thứ tự để tải video!`
            api.sendMessage(msg, threadID, (error, info) => global.client.handleReply.push({
                name: this.config.name,
                messageID: info.messageID,
                author: event.senderID,
                data: result
            }), messageID);
            break
        default: 
            var url = args[0];
            var data = await download(url, event.senderID);
            api.sendMessage({ body: `Mô tả: ${data.metaData.desc}\nTim: ${data.metaData.digg_count}\nLượt xem: ${data.metaData.play_count}\nNhạc: ${data.metaData.music}`, attachment: createReadStream(data.path)}, threadID, messageID);
            break
    }
}
module.exports.handleReply = async function ({ api, event, handleReply }) {
    const { threadID, messageID, senderID } = event;
    var data = handleReply.data;
    var num = parseInt(event.body);
    if(num <= 0 && num > 6) return
    var result = data[num - 1];
    var data = await download(result.id, senderID);
    api.unsendMessage(handleReply.messageID);
    return api.sendMessage({ body: `Mô tả: ${data.metaData.desc}\nTim: ${data.metaData.digg_count}\nLượt xem: ${data.metaData.play_count}\nNhạc: ${data.metaData.music}`, attachment: createReadStream(data.path)}, threadID, messageID);
}
async function download(url, senderID) {
    const axios = require('axios');
    const data = await global.tiktok.getData(url);
    var path = process.cwd() + "/lib/cache/tiktok-" +  senderID + ".mp4";
    var getVideo = (await axios.get(data.itemData.video.no_watermark.hd.url, { responseType: "arraybuffer" })).data;
    writeFileSync(path, Buffer.from(getVideo, "utf-8"));
    return {
        metaData: {
            desc: data.itemData.desc,
            digg_count: data.itemData.statistics.digg_count,
            play_count: data.itemData.statistics.play_count,
            comment_count: data.itemData.statistics.comment_count,
            music: data.itemData.music.title
        },
        path: path
    }
}