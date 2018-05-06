# /react 方法

用法： (ryn) /react [操作] [参数]

操作为以下之一：

- a, n, add, new 添加
- t, attach 绑定
- d, destroy 删除
- T, detach 取消绑定
- s, separate 分离react
- m, modify 修改
- M, modifyjson json覆盖修改
- l, list 列出本群的react
- L, listall 列出所有react

格式

```json
{
  "reactID": {
  // a random ID representing this react
  
    // what will trigger this react
    "trigger": {
      "type": "TRIGGER_TYPE",
      "value": "TRIGGER_VALUE"
    }, 
    // if trigger is a regex, directly use string in "trigger" field.
    
    // what the bot would reply when triggered
    "reply": {
      "type": "REPLY_TYPE",
      "value": "REPLY_VALUE"
    },
    // if reply is a message, directly use string in "reply" field.
    // if you need multiple replies (either to choose from or reply in a sequence), use an array of reply objects or strings.
    
    // whether the bot will reply the "reply" field objects randomly or in a sequence. False if not present.
    "replySequence": false
  }
}
```

示例：

```json
{
  "3v781dr1": {
    "trigger": "^(wtd+)$",
    "reply": [
      "\\1",
      "(wtd!)"
    ]
  },
  "3v78ejwb": {
    "trigger": {
      "type": "notification",
      "value": "new_chat_members"
    },
    "reply": [
      {
        "type": "sticker",
        "value": "CAADBQADHQEAAoC6CwoxFcjTBmhRGAI"
      },
      "有新大佬来了。"
    ],
    "replySequence": true
  }
}
```
## new

`/react new [json object or array]`

新建一个react。如果带参数则通过参数新建一个或多个react。

系统将返回代表该react的id

## attach

`/react attach <id or id array> <chatid or chatid array>`

将某个react添加到指定的chatid上

