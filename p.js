// Telegram Bot @rynco_bot

const version = '0.2.17 beta'

// ===

const TelegramBot = require('node-telegram-bot-api')
const fs = require('fs')
const _ = require('lodash')
const os = require('os')
const http = require('http')
const cp = require('child_process')
const timer = require('timers')
try {
  const yaml = require('js-yaml')
} catch (e) {
  yamlNotPresent = true
  cp.exec('npm install --save js-yaml')
}
// const pix = require('rippix.js')

//

const defaultConfig = {
  token: '',
  approvedUsers: [],
  approvementTokens: [],
  stickers: {
    serviceUnavil: [],
    success: [],
    fail: [],
    random: []
  },
  expectStickerFrom: [],
  replies: {
    ping: ['Pong!'],
    success: ['Got that!', 'Gocha~!'],
    approvement: ['Approvement success!'],
    disapprovement: ['Nope.'],
    fail: ['Hmmmm... Not working'],
    errMessage: ['Error message:'],
    serviceUnavil: ['Service not avaliable for now. Try again later?'],
    version: ['Rynco Bot v#{version}\nReady to be teased every time!'],
    forceRefresh: ["Refresh complete! Here's the new config:"]
  },
  usages: {
    approve:
      'Can only be used in private chats.\n/approve [token]\nNeedless to explain\n\n/approve [add|once|remove] [token]\nadd, add once or delete the targeted approvement token.*\n* Can only be used by approved users',
    reply:
      'Can only be used by approved users in private chats.\n/reply [scenario] [reply]\n\nscenario: when you want this reply to be triggered in. Current avaliable: ping, success, fail, errMessage, serviceUnavil, version*, forceRefresh\nreply: words or sentences to be said. Use "\\n" to refer to line feed.\n\n* Use "#{version}" to replace the version number.',
    listReplies: '/list-replies [scenario]\n\n'
  },
  _randomMargin: 0.1,
  _repeatTimeCoef: 250
}

const jsondir = 'https://github.com/wfcrs/rndfd/raw/master/foods.json'

var config = new Object()
try {
  // if (fs.existsSync('botconfig.yml') && !yamlNotPresent) {
  //   config = _.assign(
  //     defaultConfig,
  //     yaml.safeLoad(
  //       fs.readFileSync('botconfig.yml', { flag: 'r', encoding: 'utf8' })
  //     )
  //   )
  // } else {
  config = _.assign(
    defaultConfig,
    JSON.parse(
      fs.readFileSync('botconfig.json', {
        flag: 'r',
        encoding: 'utf8'
      })
    )
  )
  // }
} catch (e) {
  console.log(e)
}

//
const bot = new TelegramBot(config.token, { polling: true })

// After booting up

if (config.restartTo) {
  bot.sendMessage(config.restartTo, 'Restart complete!')
  config.restartTo = null
  refreshConfig()
}

//

Array.prototype.random = function() {
  return this[Math.floor(Math.random() * this.length)]
}

function getKeys(msg) {
  http.get(jsondir, function (response) {
    response.setEncoding('utf8');
    var Data = '';
    response.on('data', function (data) {    //加载到内存
        Data += data;
    }).on('end', function () {          //加载完
      sum = 0
      bot.sendMessage(msg.chat.id, ".")
      foods = Data
      Object.keys(foods).map((v, i) => (sum += foods[v].weight))
      r = Math.random() * sum
      var selectedFood
      for (food of Object.keys(foods)) {
        r -= foods[food]
        if (r <= 0) {
          selectedFood = foods[food].name
          break
        }
      }
      bot.sendMessage(msg.chat.id, selectedFood, {
        reply_to_message_id: msg.message_id
      })
    })
})
}

function isUserApproved(userId) {
  return config.approvedUsers.indexOf(userId) != -1
}

function serviceUnavil(chatId) {
  bot.sendSticker(chatId, config.stickers.serviceUnavil.random())
  bot.sendMessage(chatId, config.replies.serviceUnavil.random())
  console.log(`Sent sticker ${sticker}`)
}

function refreshConfig() {
  // if (yamlNotPresent)
  fs.writeFileSync('botconfig.json', JSON.stringify(config, null, 2))
  // else
  // fs.writeFileSync('botconfig.yml', yaml.safeDump(config))
  console.log('Config changed and saved.')
}

function reportError(chatId, e) {
  bot.sendMessage(
    chatId,
    [config.replies.fail.random(), config.replies.errMessage.random(), e].join(
      '\n'
    )
  )
}

function reportSuccess(chatId) {
  bot.sendMessage(chatId, config.replies.success.random())
}

function forceRefreshConfig() {
  config = new Object()
  try {
    // if (fs.existsSync('botconfig.yml')) {
    //   config = _.assign(
    //     defaultConfig,
    //     yaml.safeLoad(
    //       fs.readFileSync('botconfig.yml', { flag: 'r', encoding: 'utf8' })
    //     )
    //   )
    // } else {
    config = _.assign(
      defaultConfig,
      JSON.parse(
        fs.readFileSync('botconfig.json', {
          flag: 'r',
          encoding: 'utf8'
        })
      )
    )
    // }
  } catch (e) {
    return e
  }
}

function getVersion() {
  return config.replies.version.random().replace('#{version}', version)
}

function addToken(token, once, chatId) {
  index = config.approvementTokens.findIndex((v, i, o) => {
    return v.token == token
  })
  if (index != -1) {
    config.approvementTokens.push({ token: token, once: once })
    reportSuccess(chatId)
  } else {
    reportError(
      chatId,
      'TokenAlreadyExistException: The token you requested to add is ALREADY IN the list.'
    )
  }
}

function removeToken(token, chatId) {
  index = config.approvementTokens.findIndex((v, i, o) => {
    return v.token == token
  })
  if (index != -1) {
    config.approvementTokens.remove(index)
    reportSuccess(chatId)
  } else {
    reportError(
      chatId,
      'TokenNotFoundException: The token you requested to remove is NOT in the list.'
    )
  }
}

function addSticker(sticker, category, msg) {
  if (msg.chat.type != 'private') return
  config.stickers[category].push(msg.sticker.file_id)
  _.uniq(config.stickers)
  refreshConfig()
  bot.sendMessage(message.chat.id, config.replies.success.random())
  console.log(config.stickers)
}

// function executeWithPasscode(passcode, , func){

// }

//
//

// bot.onText(/\/(yandere|yande\.re|y\/) *([0-9]*)/, (msg, match) => {})

// bot.onText(/.*wtd.*/, (msg, match) => {
//   bot.sendMessage(msg.chat.id, '(wtd!)')
// })

// bot.onText(/\/servunaviltest/, (msg, match) => {
//   serviceUnavil(msg.chat.id)
// })

// // Ping
// bot.onText(/\/ping/, (msg, match) => {
//   bot.sendMessage(msg.chat.id, config.replies.ping.random())
// })
// // Repeat Mio
// bot.onText(/\/repeatmio/, (msg, match) => {
//   bot.sendMessage(msg.chat.id, config.replies.repeatMio.random())
// })

// bot.onText(/\/reply( +(.+?) +(.+))?/, (msg, match) => {
//   if (!isUserApproved(msg.from.id)) {
//     reportError(
//       msg.chat.id,
//       'UserNotApprovedException: Please run this command AFTER being approved.'
//     )
//     return
//   } else if (match[1]) {
//     try {
//       config.replies[match[2]].push(match[3].replace('\\n', '\n'))
//       reportSuccess(msg.chat.id)
//     } catch (e) {
//       reportError(msg.chat.id, e)
//     }
//     refreshConfig()
//   } else {
//     bot.sendMessage(msg.chat.id, _replyUsage)
//   }
// })
// bot.onText(/\/listReplies( (.+))?/, (msg, match) => {
//   if (match[2]) {
//   }
// })

// bot.onText(/\/v/, (msg, match) => {
//   bot.sendMessage(msg.chat.id, getVersion())
// })

// bot.onText(/\/dumpConfig/, (msg, match) => {
//   if (msg.chat.type != 'private') return
//   if (!isUserApproved(msg.from.id)) {
//     reportError(
//       msg.chat.id,
//       'UserNotApprovedException: Please run this command AFTER being approved.'
//     )
//     return
//   } else {
//     refreshConfig()
//   }
// })
// bot.onText(/\/refreshConfig/, (msg, match) => {
//   if (!isUserApproved(msg.from.id)) {
//     reportError(
//       msg.chat.id,
//       'UserNotApprovedException: Please run this command AFTER being approved.'
//     )
//     return
//   }
//   try {
//     forceRefreshConfig()
//     bot.sendMessage(
//       msg.chat.id,
//       [
//         config.replies.forcerefresh.random(),
//         '----',
//         getVersion()
//         // JSON.stringify(config)
//       ].join('\n')
//     )
//   } catch (e) {
//     reportError(e)
//   }
// })

// bot.onText(/\/approve( (.+)( (.+))?)?/, (msg, match) => {
//   chatId = msg.chat.id
//   if (match[1]) {
//     token = match[4] || match[2]
//     if (match[4]) {
//       if (!isUserApproved(msg.from.id)) {
//         reportError(
//           chatId,
//           'UserNotApprovedException: Please run this command AFTER being approved.'
//         )
//         return
//       }
//       switch (match[2]) {
//         case 'add':
//           addToken(token, false, chatId)
//           break
//         case 'once':
//           addToken(token, true, chatId)
//           break
//         case 'remove':
//           removeToken(token, chatId)
//           break
//         case 'list':
//           serviceUnavil(chatId)
//           break
//         case 'clean':
//           serviceUnavil(chatId)
//           break
//       }
//     } else {
//       index = config.approvementTokens.findIndex((v, i, o) => {
//         return v.token == token
//       })
//       if (token == config.token || index >= 0) {
//         config.approvedUsers.push(msg.from.id)
//         config.approvedUsers = _.sortedUniq(_.sort(config.approvedUsers))
//         if (config.approvementTokens[index].once == true)
//           config.approvementTokens.remove(index)
//         bot.sendMessage(msg.chat.id, config.replies.approvement.random())
//       } else {
//         bot.sendMessage(msg.chat.id, config.replies.disapprovement.random())
//       }
//     }
//   } else {
//     bot.sendMessage(msg.chat.id, config.usages.approve)
//   }
// })

bot.onText(/\/restart/, (msg, match) => {
  // serviceUnavil(msg.chat.id)
  if (!isUserApproved(msg.from.id)) {
    reportError(
      msg.chat.id,
      'UserNotApprovedException: Please run this command AFTER being approved.'
    )
    return
  }
  config.restartTo = msg.chat.id
  refreshConfig()
  cp.execSync('forever restart all')
})

bot.onText(/\/system (.+)/, (msg, match) => {
  serviceUnavil(msg.chat.id)
  return
  if (!isUserApproved(msg.from.id)) {
    reportError(
      msg.chat.id,
      'UserNotApprovedException: Please run this command AFTER being approved.'
    )
    return
  }
  bot.sendMessage(msg.chat.id, cp.execSync(match[1]))
})

bot.onText(/\/eatwhat/, msg => {
  getKeys(msg)
})

bot.onText(/\/pingme/, msg => {
  bot.sendMessage(msg.chat.id, msg.from.id)
})

bot.onText(/^[^\\\/].*/, msg => {
  if (msg.from && !msg.from.is_bot) {
    if (msg.text.includes('复读')) {
      bot.sendMessage(msg.chat.id, msg.text)
      return
    }
    random = Math.random()
    if (random < config._randomMargin) {
      timer.setTimeout(
        (id, tx, reply) => {
          bot.sendMessage(id, tx, reply)
        },
        msg.text.length * 100,
        msg.chat.id,
        msg.text,
        { reply_to_message_id: msg.message_id }
      )
    }
  }
  // if (msg.chat.type == 'private')
  //   bot.sendMessage(msg.chat.id, `RndNum: ${random}`)
})
