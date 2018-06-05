var schedule = require("node-schedule");
var UserModel = require('../model/User.js');
// var WechatAPI = require('wechat-api');
var weichat_conf = require('../conf/weichat.json');
var getClient = require('../util/get_weichat_client');

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
        } else if (user_arr.length == 1) {
            getClient.getClient(code).getUser(user_arr[0], function (err, data) {
                if (err) {
                    console.log(err, '----------------err')
                }
                UserModel.findOneAndUpdate({openid: data.openid}, {
                    nickname: data.nickname,
                    headimgurl: data.headimgurl
                }, function (err, result) {
                    if (err) {
                        console.log(err)
                    }
                });
            })
        } else {
            getClient.getClient(code).batchGetUsers(user_arr, function (err, data) {
                if (err) {
                    console.log(err, '----------------err')
                }
                if (data && data.user_info_list) {
                    data.user_info_list.forEach(function (info) {
                        UserModel.findOneAndUpdate({openid: info.openid}, {
                            nickname: info.nickname,
                            headimgurl: info.headimgurl
                        }, function (err, result) {
                            if (err) {
                                console.log(err)
                            }
                        });
                    })
                }
            })
        }
        if (users.length == 50) {
            return next(users[49]._id, code);
        } else {
            return next(null, (parseInt(code) + 1).toString())
        }
    })
}

function next_up_nickname(_id, code) {
    if (code && code <= Object.keys(weichat_conf).length) {
        return update_nickname(_id, code, next_up_nickname);
    } else {
        console.log('update_nickname end');
        return;
    }
}

function get_nickname() {
    update_nickname(null, '1', next_up_nickname);
}

function update_nickname(_id, code, next) {
    // console.log(code,'-------------code')
    UserModel.fetch_nickname(_id, code, function (error, users) {
        // console.log(users, '-------------------nicknames')
        var user_arr = [];
        users.forEach(function (user) {
            user_arr.push(user.openid)
        })
        if (user_arr.length == 0) {
            console.log(user_arr, '-------------------nickname null')
        } else if (user_arr.length == 1) {
            getClient.getClient(code).getUser(user_arr[0], function (err, data) {
                if (err) {
                    console.log(err, '----------------nickname err')
                }
                UserModel.findOneAndUpdate({openid: data.openid}, {
                    nickname: data.nickname,
                    headimgurl: data.headimgurl
                }, function (err, result) {
                    if (err) {
                        console.log(err)
                    }
                });
            })
        } else {
            getClient.getClient(code).batchGetUsers(user_arr, function (err, data) {
                if (err) {
                    console.log(err, '----------------nickname err')
                }
                if (data && data.user_info_list) {
                    data.user_info_list.forEach(function (info) {
                        UserModel.findOneAndUpdate({openid: info.openid}, {
                            nickname: info.nickname,
                            headimgurl: info.headimgurl
                        }, function (err, result) {
                            if (err) {
                                console.log(err)
                            }
                        });
                    })
                }
            })
        }
        if (users.length == 50) {
            return next(users[49]._id, code);
        } else {
            return next(null, (parseInt(code) + 1).toString())
        }
    })
}

// console.log('更新用户昵称头像信息');
// get_nickname();

var rule = new schedule.RecurrenceRule();
var times = [1, 6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56];
rule.minute = times;
var j = schedule.scheduleJob(rule, function () {
    console.log('更新用户昵称头像信息');
    get_nickname();
});

var rule_nickname = new schedule.RecurrenceRule();
var times_nickname = [23];
rule_nickname.hour = times_nickname;
var j = schedule.scheduleJob(rule_nickname, function () {
    console.log('更新用户信息');
    get_user();
});