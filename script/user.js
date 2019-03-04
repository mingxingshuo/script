var wechat_util = require('../util/get_weichat_client');
var MessageModel = require('../model/Message');
var UserModel = require('../model/Userconf');
var async = require('async');
var schedule = require("node-schedule");

// FuUserModel.deleteOne({openid: 'oD4KE1G7wwq8LSU1TZ5gRD3IPfxQ'}, function (err, data) {
//     console.log(data, '-------------------data1')
// })
// FuUserModel.deleteOne({openid: 'oD4KE1MZaV-YEQ_LQQFGw367X9Bk'}, function (err, data) {
//     console.log(data, '-------------------data1')
// })
// FuUserModel.deleteOne({openid: 'oD4KE1NQKvYHSrTraGiBet3SzpuM'}, function (err, data) {
//     console.log(data, '-------------------data1')
// })
// FuUserModel.deleteOne({openid: 'oD4KE1IxZ33wN_cRakxCZHCgcn8s'}, function (err, data) {
//     console.log(data, '-------------------data1')
// })

function get_message() {
    MessageModel.find({task: true,timing_time: {$lte: (Date.now() - 60 *1000), $gt: (Date.now() - 120 *1000)}}, function (err, messages) {
        if (messages.length) {
            messages.forEach(function (message) {
                send_users(null, message);
            })
        } else {
            console.log('============= 未找到信息 ==========')
        }
    });
}

function send_users(user_id, message) {
    var pre = new Date(Date.now() - (message.delay + 1) * 60 * 1000);
    var last = new Date(Date.now() - message.delay * 60 * 1000);
    UserModel.fetch(user_id, message.sex, message.tagId, message.codes, pre, last, function (err, users) {
        async.eachLimit(users, 10, async function (user) {
            var client = await wechat_util.getClient(user.code);
            if (message.type == 0) {
                client.sendNews(user.openid, message.contents, function (err, res) {
                    console.log(err);
                });
            } else if (message.type == 1) {
                client.sendText(user.openid, message.contents[0].description, function (error, res) {
                    console.log(error);
                })
            } else if (message.type == 2) {
                client.sendImage(user.openid, message.mediaId, function (error, res) {
                    console.log(error);
                })
            }
        }, function (err) {
            if (users.length == 50) {
                send_users(users[49]._id, message);
            }
        })
    });
}

function get_timing_message() {
    MessageModel.find({is_timing: true,timing_time: {$lte: (Date.now() - 60 *1000), $gt: (Date.now() - 120 *1000)}}, function (err, messages) {
        if (messages) {
            messages.forEach(function (message) {
                send_timing(null, message);
            })
        } else {
            console.log('============= 未找到信息 ==========')
        }
    });
}

function send_timing(user_id, message) {
    if (user_id || (message.timing_time && Date.now() - new Date(message.timing_time).getTime() >= 60 * 1000 && Date.now() - new Date(message.timing_time).getTime() < 120 * 1000)) {
        UserModel.fetch(user_id, message.sex, message.tagId, message.codes, '', '', function (err, users) {
            console.log(users,'---------------------users')
            var l = []
            async.eachLimit(users, 10, async function (user) {
                l.push(user._id)
                var client = await wechat_util.getClient(user.code);
                if (message.type == 0) {
                    client.sendNews(user.openid, message.contents, function (err, res) {
                        console.log(err);
                    });
                } else if (message.type == 1) {
                    client.sendText(user.openid, message.contents[0].description, function (error, res) {
                        console.log(error);
                    })
                } else if (message.type == 2) {
                    client.sendImage(user.openid, message.mediaId, function (error, res) {
                        console.log(error);
                    })
                }
            }, function (err) {
                if (users.length == 50) {
                    UserModel.update({_id: {$in: l}}, {$set: {send_time: Date.now()}}, {
                        multi: true,
                        upsert: true
                    }, function () {
                    })
                    send_timing(users[49]._id, message);
                } else {
                    UserModel.update({_id: {$in: l}}, {$set: {send_time: Date.now()}}, {
                        multi: true,
                        upsert: true
                    }, function () {
                    })
                }
            })
        });
    }
}

var rule = new schedule.RecurrenceRule();
var times = [1];
rule.second = times;
var j = schedule.scheduleJob(rule, function () {
    console.log('--------发送客服消息--------------- :' + new Date());
    get_message()
    get_timing_message()
});
