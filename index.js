const Wechat = require('wechat4u');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const CronJob = require('cron').CronJob;
const request = require('request')

let bot;
let username;

/**
 * 尝试获取本地登录数据，免扫码
 */
try {
  bot = new Wechat(require('./sync-data.json'));
} catch (e) {
  bot = new Wechat();
}

if (bot.PROP.uin) {
  // 存在登录数据时，可以随时调用restart进行重启
  bot.restart();
} else {
  bot.start();
}

/**
 * uuid事件，参数为uuid，根据uuid生成二维码
 */
bot.on('uuid', uuid => {
  qrcode.generate('https://login.weixin.qq.com/l/' + uuid, {
    small: true
  });
  console.log('二维码链接：', 'https://login.weixin.qq.com/qrcode/' + uuid);
});
/**
 * 登录用户头像事件，手机扫描后可以得到登录用户头像的Data URL
 */
bot.on('user-avatar', avatar => {
  console.log('登录用户头像Data URL：', avatar.substring(0, 100)) // 截取前100个字符
})
/**
 * 登录成功事件
 */
bot.on('login', () => {
  console.log('登录成功');
  fs.writeFileSync('./sync-data.json', JSON.stringify(bot.botData));
});
/**
 * 登出成功事件
 */
bot.on('logout', () => {
  console.log('登出成功')
  // 清除数据
  fs.unlinkSync('./sync-data.json')
});
/**
 * 联系人更新事件，参数为被更新的联系人列表
 */
bot.on('contacts-updated', contacts => {
  //console.log(contacts)
  if (!username) {
    console.log('联系人数量: ', Object.keys(bot.contacts).length);
    if (bot.Contact.getSearchUser('舍不得的他他他').length) {
      username = bot.Contact.getSearchUser('舍不得的他他他')[0].UserName;
      console.log('获取目标用户成功: ', username);
    }
    if (username) {
      bot.sendMsg('我想你了想你了想你了、正在由Nomo小助手守护，一个无所不能的小助手~', username)
        .catch(err => {
          bot.emit('error', err)
        })
        bot.sendMsg({
          file: fs.createReadStream('123.webp'),
          filename: '123.webp'
        }, username)
          .catch(err => {
            bot.emit('error', err)
          })
        bot.sendMsg({
          file: request('https://cdnjson.com/images/2023/12/20/123.webp'),
          filename: 'yybb.jpg'
        }, username)
          .catch(err => {
            bot.emit('error', err)
          })
      // bot.sendMsg('测试撤回', username)
      //   .then(res => {
      //     // 需要取得待撤回消息的MsgID
      //     return bot.revokeMsg(res.MsgID, username)
      //   })
      //   .catch(err => {
      //     console.log(err)
      //   })
    }
  }
});
/**
 * 错误事件，参数一般为Error对象
 */
bot.on('error', err => {
  console.error('错误：', err)
})
/**
 * 文件传输助手
 */
// bot.on('login', () => {
//   /**
//    * 演示发送消息到文件传输助手
//    * 通常回复消息时可以用 msg.FromUserName
//    */
//   let ToUserName = 'filehelper'

//   /**
//    * 发送文本消息，可以包含emoji(😒)和QQ表情([坏笑])
//    */
//   bot.sendMsg('发送文本消息，可以包含emoji(😒)和QQ表情([坏笑])', ToUserName)
//     .catch(err => {
//       bot.emit('error', err)
//     })
// })
new CronJob('00 30 09 * * *', function () {
    if (username) {
        bot.sendMsg('早安', username)
            .catch(err => {
                bot.emit('send error', err);
            });
    }
}, null, true, 'Asia/Shanghai');

new CronJob('00 00 00 * * *', function () {
    if (username) {
        bot.sendMsg('晚安', username)
            .catch(err => {
                bot.emit('send error', err);
            });
    }
}, null, true, 'Asia/Shanghai');
