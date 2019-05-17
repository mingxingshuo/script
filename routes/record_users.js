var express = require('express');
var router = express.Router();
var UserconfModel = require('../model/Userconf');
var ConfigModel = require('../model/Config');
var OpenidModel = require('../model/Openid');
var UserTagModel = require('../model/UserTag')
var RecordModel = require('../model/Record')
var wechat_util = require('../util/get_weichat_client.js')
var mem = require('../util/mem.js');
var async = require('async');
var exec = require('child_process').exec;

router.get('/', async(req, res, next) => {
    let code = req.query.code
    if (code) {
        await mem.set('access_token' + code, '', 10)
        let client = await wechat_util.getClient(code)
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
                UserconfModel.remove({code: code}, function (err, doc) {
                    OpenidModel.remove({code: code}, function (err, doc) {
                        RecordModel.remove({code: code}, function (err, doc) {
                            callback(null)
                        })
                    })
                })
            }, function (callback) {
                client.createTag("明星说未知", async function (err, data) {
                    console.log(data, '---------------------data')
                    await UserTagModel.create({id: data.tag.id, name: "未知", code: code, sex: '0'})
                    callback(null)
                })
            }, function (callback) {
                client.createTag("明星说男", async function (err, data) {
                    await UserTagModel.create({id: data.tag.id, name: "男", code: code, sex: '1'})
                    callback(null)
                })
            }, function (callback) {
                client.createTag("明星说女", async function (err, data) {
                    await UserTagModel.create({id: data.tag.id, name: "女", code: code, sex: '2'})
                    callback(null)
                })
            }, function (callback) {
                let cmdStr = 'pm2 start /home/work/dahaoscript/script/jieguan.js ' + code + ' --name ' + code
                exec(cmdStr, function () {
                })
            }], async function (error) {
            return
        })
    }
})

module.exports = router;
