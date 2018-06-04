var schedule = require("node-schedule");
var API = require('wechat-api');
var TokenModel = require('../model/Token')

function test() {
    TokenModel.findOne({code: 1}, function (err, data) {
        console.log(data.accessToken, '-------------------mytoken')
    })
    // var api = new API('wxc1dd5571c22e9c87', 'b83082aceb231d585f18992322ed4983', function (callback) {
    //     // 传入一个获取全局token的方法
    //     TokenModel.findOne({code: 1}, function (err, data) {
    //         console.log(data.accessToken, '-------------------get token2')
    //         callback(null, data.accessToken);
    //     })
    // })
    var api = new API('wxc1dd5571c22e9c87', 'b83082aceb231d585f18992322ed4983')
    api.sendText("oD4KE1IxZ33wN_cRakxCZHCgcn8s", "test", function (err, result) {

    })
}
test()
var rule = new schedule.RecurrenceRule();
var times = [1];
rule.second = times;
var j = schedule.scheduleJob(rule, function () {
    console.log('测试access_token')
    test()
});
