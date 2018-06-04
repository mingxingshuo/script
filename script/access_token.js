var schedule = require("node-schedule");
var API = require('wechat-api');
var TokenModel = require('../model/Token')

function accessToken() {
    var api = new API('wxc1dd5571c22e9c87', 'b83082aceb231d585f18992322ed4983', function (callback) {
        // 传入一个获取全局token的方法
        TokenModel.findOne({code: 1}, function (err, data) {
            console.log(data.accessToken, '-------------------get token1')
            callback(null, data.accessToken);
        })
    }, async function (token, callback) {
        // 请将token存储到全局，跨进程、跨机器级别的全局，比如写到数据库、redis等
        // 这样才能在cluster模式及多机情况下使用，以下为写入到文件的示例
        console.log(token, '-------------------set token')
        TokenModel.findOneAndUpdate({code: 1}, {$set:{accessToken: token.accessToken,expireTime:token.expireTime}}, function (err, data) {

        })
    });
    // api.sendText("oD4KE1IxZ33wN_cRakxCZHCgcn8s", "test", function (err, result) {
    //
    // })
    api.sendText()
}
accessToken()

var rule = new schedule.RecurrenceRule();
var times = [1, 54,55];
rule.minute = times;
var j = schedule.scheduleJob(rule, function () {
    console.log('更新access_token')
    accessToken()
});