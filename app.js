var TelegramBot = require('node-telegram-bot-api');
var firebase = require("firebase");

var token = '246332843:AAGEehkw7lLxaKp1yuBBney0HTu-hf67t4E';
var bot = new TelegramBot(token, {polling: true});


var list = [];
//default listName
var listName = "Groceries";
var chatID = "";

bot.onText(/\/start/, function(msg, match) {
  chatID = msg.chat.id;
  var user = msg.chat.first_name;

  if (user == undefined) {
    user = "all";
  }
  output = "hey " + user + "! this is a list bot, of sorts. \
  to use this list bot, type /add [item], /delete [index of item], \
  /clear, /changeListName [new list name], /peek";
  bot.sendMessage(chatID, output);
});

bot.onText(/\/add/, function(msg, match) {
  chatID = msg.chat.id;
  var item = match["input"];
  list.push(item.substring(4));
  bot.sendMessage(chatID, listToString());
});

bot.onText(/\/delete/, function(msg, match) {
  chatID = msg.chat.id;
  var entry = Number(msg.text.substring(7));
  if (entry > -1 && entry <= list.length) {
    //offset zero-based index
    list.splice(entry - 1, 1);
  }

  bot.sendMessage(chatID, listToString());
})

bot.onText(/\/clear/, function(msg, match) {
    chatID = msg.chat.id;
    list = [];
    bot.sendMessage(chatID, listName + " list emptied!");
});

bot.onText(/\/peek/, function(msg, match) {
  chatID = msg.chat.id;
  bot.sendMessage(chatID, listToString());
})

bot.onText(/\/changeListName/, function(msg, match) {
  listName = msg.text.substring(16);
})


//HELPER FUNCTIONS
function listToString() {
    var output = "";
    output += "\n" + listName + "\n";
    output += "=======\n";
    for (var i = 0; i < list.length; i ++) {
      output += (i+1) + ". " + list[i] + "\n";
    }
    return output;
}

function print(){
  for (var i = 0; i < list.length; i++) {
    console.log(idToList[chatID][i]);
  }
}
