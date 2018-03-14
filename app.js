var TelegramBot = require('node-telegram-bot-api');
var token = 'TELEGRAM-API';
var bot = new TelegramBot(token, {polling: true});
var firebase = require("firebase");

firebase.initializeApp({
  serviceAccount: "firebase.json",
  databaseURL: "https://DATABASE-URL.firebaseio.com"
});

var db = firebase.database();
var listCollection = db.ref('server/data/');

//BOT DIRECTIVES
bot.onText(/\/start/, function(msg, match) {
  var chatID = msg.chat.id;
  var name = msg.chat.first_name;

  if (name == undefined) {
    name = "all";
  }

  var output = "hey " + name + "! this is a list bot, of sorts. \
  to use this list bot, type /add [item], /delete [index of item], \
  /clear, /peek. \n\n please do not store important information in \
  the lists -- data is not encrypted.";
  bot.sendMessage(chatID, output);
});


bot.onText(/\/add/, function(msg, match) {
  var chatID = msg.chat.id;

  //getting the input item from user
  var item = match["input"];
  item = item.substring(5);

  var list = db.ref("server/data/chatIDs/" + chatID + "/list");
  list.once("value", function(snapshot) {
    var originalList = snapshot.val();
    //in case the list has yet to be initialized
    if (originalList == null) {
      originalList = [];
    }
    originalList.push(item);
    list.set(originalList);
    printListInChat(chatID);
  });
});


bot.onText(/\/delete/, function(msg, match) {
  chatID = msg.chat.id;
  var entry = Number(msg.text.substring(7));
  console.log(entry);

  if (isNaN(entry)) {
    bot.sendMessage(chatID, "Please enter a valid index!");
  } else {
      var list = db.ref("server/data/chatIDs/" + chatID + "/list");
      list.once("value", function(snapshot) {

        var originalList = snapshot.val();
        //in case list has yet to be initialized
        if (originalList == null) {
          bot.sendMessage(chatID, "List empty now; nothing to delete!");
        } else {
          var length = originalList.length;
          if (entry > -1 && entry <= length) {
            //offset zero-based index
            originalList.splice(entry - 1, 1);
            console.log(originalList);
            list.set(originalList);
            printListInChat(chatID);
          } else {
            bot.sendMessage(chatID, "Please enter a valid index!");
          }
        }
      });
  }
})

bot.onText(/\/clear/, function(msg, match) {
    var chatID = msg.chat.id;
    var list = db.ref("server/data/chatIDs/" + chatID + "/list");
    list.set([]);
    bot.sendMessage(chatID, "List emptied!");
});


bot.onText(/\/peek/, function(msg, match) {
  var chatID = msg.chat.id;
  printListInChat(chatID);
});


//HELPER FUNCTIONS
function printListInChat(userChatID) {
  var list = db.ref("server/data/chatIDs/" + userChatID + "/list");

  list.once("value", function(snapshot) {
    var output = "";
    var data = snapshot.val();
    if (data != null) {
      output += "\n" + "* ~ List ~ *" + "\n";
      output += "========\n";
      for (var i = 0; i < data.length; i ++) {
        output += (i+1) + ". " + data[i] + "\n";
      };
      bot.sendMessage(userChatID, output);
    } else {
      bot.sendMessage(userChatID, "List is empty!");
    }
  });
}
