/*
* === Ryn React Module ===
* Main code of the '/react' command of Rynco Bot.
*/

import { padStart } from 'lodash'
import { Message } from 'node-telegram-bot-api'

interface triggerObject {
  type: string
  regex?: string
  time?: any
  sticker?: string
}

interface reactionObject {
  type: string
  text?: string
  sticker?: string
  photo?: string
}

interface Reaction {
  id: string
  trigger: triggerObject | string
  reaction: reactionObject | reactionObject[] | string
}

class Reaction {
  constructor(
    public id: string,
    public trigger: triggerObject | string,
    public reaction: reactionObject | string | reactionObject[]
  ) {}

  /*
  * -- Trigger types: --
  * 
  * - regex (default)
  *     triggered when an incoming message matches the specified regex pattern.
  *     will return the execution result.
  * - new_chat_member
  *     triggered whenever a new member is added to the group.
  * - left_chat_member
  *     triggered whenever a chat member leaves the group.
  * - time
  *     triggered when recieving a message at a specific time.
  *     (for example, after 8:00 every day)
  * - sticker
  *     triggered when a sticker is sent. sticker id may be specified.
  * - photo
  *     triggered when a photo is sent.
  * - reply
  *     triggered when being replied.
  */

  check = function(msg: Message): any {
    // checks if the message can trigger this react
    if (typeof this.trigger == 'string') {
      let regex = new RegExp(this.trigger, 'im')
      return regex.exec(msg.text) || false
    } else
      switch (this.trigger.type) {
        case 'regex':
          let regex = new RegExp(this.trigger.regex, 'im')
          return regex.exec(msg.text) || false
        case 'new_chat_member':
          return msg.new_chat_members || false
        case 'left_chat_member':
          return msg.left_chat_member || false
        case 'sticker':
          if (msg.sticker && this.trigger.sticker == msg.sticker.file_id)
            return msg.sticker
          else return msg.sticker || false
      }
  }

  /* -- Reply types: --
  * 
  * - text (default)
  *     replies a plain text message.
  *     use '${_variable_name}' to show variables. escape with '\${}'.
  *     use '\\1' (written as \1) to refer to regex substrings.
  * - sticker
  *     replies a sticker.
  *     if you want to random from multiple stickers, use an array of stickerid.
  * - photo
  *     same as above.
  */
}

export default class RynReact {
  constructor(private bot, private reacts: Reaction[]) {}

  static reaction = Reaction

  // generate an id for the react
  getReactID = function(): string {
    var date = new Date()
    var timestamp = (date.getFullYear() % 100) * 100 + date.getMonth()
    var hash = padStart(timestamp.toString(36).slice(0, 3), 3, '0')
    hash =
      hash +
      padStart(
        Math.floor(Math.random() * 46656)
          .toString(36)
          .slice(0, 3),
        3,
        '0'
      )
    return hash
  }

  // /react n
  // /react add|new [json object or array]
  createNewReact = function(preset = null) {}

  // /react r
  // /react replace <reactID> <json object>

  // /react c
  // /react copy|duplicate <reactID>

  // /react a
  // /react apply <reactID> <chatID>

  // /react d
  // /react delete|destroy|remove <reactID> [more reactIDs]

  // /react m
  // /react modify|change <reactID> <attr> <newAttr>

  // /react l
  // /react list [-c chatID | -a] [-n number]
}
