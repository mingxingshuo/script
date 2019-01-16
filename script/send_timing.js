var MaterialModel = require('../model/Material');
var MsgHistoryModel = require('../model/MsgHistory');
var send_tag_message = require('./send_tag_message');
var schedule = require("node-schedule");

async function get_timing_message() {
    let messages = await MaterialModel.find({isTiming: true});
    console.log("-----------------------定时任务  messages----------------------------", messages)
    if (messages.length != 0) {
      messages.forEach(function (message) {
          send_timing(message._id, message.tagId, message.mediaId, message.timing);
      })
    } else {
      console.log('============= 未找到群发消息的信息 ==========')
    }
}

async function send_timing(id, tagId, mediaId, timing) {
  if(timing && Date.now() - timing >= 60 * 1000 && Date.now() - timing < 120 * 1000 ) {
    let docs = await send_tag_message.get_message(id, tagId, mediaId);
    console.log("-------------------send_timing   docs----------------------------", docs)
    if(!docs){
      return
    }
    await MaterialModel.findById(id, async (err, result) => {
      if(err) {
        return
      } else {
        result = result.toObject()
        delete result._id;
        result.tagId = tagId
        result.msg_id = docs.msg_id
        result.update_time = Date.now() / 1000
        console.log("send_timing -----result-------------------------------------", result)
        await MsgHistoryModel.create(result)
      }
    })
  }
}

var rule = new schedule.RecurrenceRule();
var times = [1];
rule.second = times;
var j = schedule.scheduleJob(rule, function () {
    get_timing_message()
});
