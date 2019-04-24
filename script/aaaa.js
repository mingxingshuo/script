var express = require('express');
var router = express.Router();
var UserconfModel = require('../model/Userconf');
var ConfigModel = require('../model/Config');
var OpenidModel = require('../model/Openid');
var wechat_util = require('../util/get_weichat_client.js')
var mem = require('../util/mem.js');
var async = require('async');
var UserTagModel = require('../model/UserTag')

async function a() {
    let code = process.argv.slice(2)[0]
    if (code) {
        let client = await wechat_util.getClient(code)
        let config = await ConfigModel.findOne({code: code})
        async.waterfall([
            function (callback) {
                UserTagModel.remove({code: code}, function (err, doc) {
                    client.getTags(function (err, res) {
                        if (res) {
                            console.log(res, '------------------res')
                            for (let i of res.tags) {
                                console.log(i, '--------------------i')
                                if (i.name == "明星说男" || i.name == "明星说女" || i.name == "明星说未知") {
                                    client.deleteTag(i.id, function (error, res) {
                                        console.log(res)
                                    })
                                }
                            }
                            callback(null)
                        } else {
                            callback(null)
                        }
                    })
                })
            }, function (callback) {
                client.createTag("明星说未知", async function (err, data) {
                    console.log(data, '---------------------data')
                    await UserTagModel.create({id: data.tag.id, name: "未知", code: code})
                    if (config.attribute == 0) {
                        get_tag(null, code, data.tag.id, '0', function () {
                            callback(null)
                        })
                    }else{
                        callback(null)
                    }
                })
            }, function (callback) {
                client.createTag("明星说男", async function (err, data) {
                    await UserTagModel.create({id: data.tag.id, name: "男", code: code})
                    get_tag(null, code, data.tag.id, '1', function () {
                        if (config.attribute == 1) {
                            get_tag(null, code, data.tag.id, '0', function () {
                                callback(null)
                            })
                        }else{
                            callback(null)
                        }
                    })
                })
            }, function (callback) {
                client.createTag("明星说女", async function (err, data) {
                    await UserTagModel.create({id: data.tag.id, name: "女", code: code})
                    get_tag(null, code, data.tag.id, '2', function () {
                        if (config.attribute == 2) {
                            get_tag(null, code, data.tag.id, '0', function () {
                                callback(null)
                            })
                        }else{
                            callback(null)
                        }
                    })
                })
            }], async function (error) {
            await OpenidModel.remove({code: code})
            await ConfigModel.update({code: code}, {status: 1})
            console.log('jieguan end')
            return
        })
    }
}

async function get_tag(_id, code, tagId, sex, back) {
    if (code) {
        update_tag(_id, code, tagId, sex, get_tag, back);
    } else {
        console.log('update_tag end');
        back(null);
    }
}

function update_tag(_id, code, tagId, sex, next, back) {
    UserconfModel.fetchTag(_id, code, sex, async function (error, users) {
        var user_arr = [];
        users.forEach(function (user) {
            user_arr.push(user.openid)
        })
        let client = await wechat_util.getClient(code)
        if (user_arr.length == 0) {
            console.log(user_arr, '-------------------user null')
            next(null, null, null, null, back)
        } else {
            client.membersBatchtagging(tagId, user_arr, async function (error, res) {
                console.log(res)
                if (res) {
                    if (res.errcode == 45009) {
                        let conf = await ConfigModel.findOne({code: code})
                        let appid = conf.appid
                        client.clearQuota(appid, function (err, data) {
                            console.log(err, data, '------------------------------')
                            console.log('clearQuota end')
                            update_tag(users[0]._id, code, tagId, sex, back)
                        })
                    } else {
                        if (users.length == 50) {
                            next(users[49]._id, code, tagId, sex, back);
                        } else {
                            next(null, null, null, null, back)
                        }
                    }
                } else {
                    update_tag(users[0]._id, code, tagId, sex, back)
                }
            })
        }
    })
}

a()
