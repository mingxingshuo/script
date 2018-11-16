var schedule = require("node-schedule");
var UserModel = require('../model/User.js');
// var WechatAPI = require('wechat-api');
var weichat_conf = require('../conf/weichat.json');
var getClient = require('../util/get_weichat_client');
var async = require('async');

function next_up(_id, code) {
    if (code && code <= Object.keys(weichat_conf).length) {
        return update_user(_id, code, next_up);
    } else {
        console.log('update_user end');
        return;
    }
}

function get_user() {
    update_user(null, '1', next_up);
}

function update_user(_id, code, next) {
    UserModel.fetch_openid(_id, code, function (error, users) {
        var user_arr = [];
        users.forEach(function (user) {
            user_arr.push(user.openid)
        })
        if (user_arr.length == 0) {
            console.log(user_arr, '-------------------user null')
            return next(null, (parseInt(code) + 1).toString())
        } else if (user_arr.length == 1) {
            getClient.getClient(code).getUser(user_arr[0], function (err, data) {
                if (err) {
                    console.log(err, '----------------nickname err1')
                }
                UserModel.findOneAndUpdate({openid: data.openid}, {
                    nickname: data.nickname,
                    headimgurl: data.headimgurl,
                    sex:data.sex
                }, function (err, result) {
                    if (err) {
                        console.log(err)
                    }
                });
                return next(null, (parseInt(code) + 1).toString())
            })
        } else {
            getClient.getClient(code).batchGetUsers(user_arr, function (err, data) {
                if (err) {
                    console.log(err, '----------------nickname err2')
                    if (users.length == 50) {
                        return next(users[49]._id, code);
                    } else {
                        return next(null, (parseInt(code) + 1).toString())
                    }
                }
                if (data && data.user_info_list) {
                    async.eachLimit(data.user_info_list,10,function (info,callback) {
                        if(info.nickname){
                            UserModel.findOneAndUpdate({openid: info.openid}, {
                                nickname: info.nickname,
                                headimgurl: info.headimgurl,
                                sex:info.sex
                            }, function (err, result) {
                                if (err) {
                                    console.log(err)
                                }
                                callback(null)
                            });
                        }else{
                            callback(null)
                        }
                    },function (error, result){
                        if(error){
                            console.log(error,'--------------error')
                        }
                        if (users.length == 50) {
                            return next(users[49]._id, code);
                        } else {
                            return next(null, (parseInt(code) + 1).toString())
                        }
                    })
                }
            })
        }
    })
}

var rule = new schedule.RecurrenceRule();
var times = [1];
rule.hour = times;
var j = schedule.scheduleJob(rule, function () {
    console.log('更新用户信息');
    get_user();
});