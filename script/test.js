var UserconfModel = require('../model/Userconf');
var ConfigModel = require('../model/Config');
var OpenidModel = require('../model/Openid');
var UserTagModel = require('../model/UserTag')
var RecordModel = require('../model/Record')
var wechat_util = require('../util/get_weichat_client.js')
var async = require('async');

async function test() {
    let code = process.argv.slice(2)[0]
    // await RecordModel.update({_id:'5caf03cde2e9e277aa62d246'},{follow_openid:'oVWfp5goiCUf1IOidyepPmLyvEq0'})
    let client = await wechat_util.getClient(code)
    // async.waterfall([
    //     function (back) {
    //         UserTagModel.remove({code: code}, function (err, doc) {
    //             client.getTags(function (err, res) {
    //                 console.log(res, '------------------res')
    //                 for (let i of res.tags) {
    //                     console.log(i, '--------------------i')
    //                     if (i.name == "明星说男" || i.name == "明星说女" || i.name == "明星说未知") {
    //                         client.deleteTag(i.id, function (error, res) {
    //                             console.log(res)
    //                         })
    //                     }
    //                 }
    //                 back(null)
    //             })
    //         })
    //     }, function (back) {
    //         client.createTag("明星说未知", async function (err, data) {
    //             client.createTag("明星说男", async function (err, data1) {
    //                 client.createTag("明星说女", async function (err, data2) {
    //                     await UserTagModel.create({id: data.tag.id, name: "未知", code: code, sex: '0'})
    //                     await UserTagModel.create({id: data1.tag.id, name: "男", code: code, sex: '1'})
    //                     await UserTagModel.create({id: data2.tag.id, name: "女", code: code, sex: '2'})
    //                     back(null)
    //                 })
    //             })
    //         })
    //     }, function (back) {
    //         client.getTags(function (err, data) {
    //             console.log(data, '-----------------aaa')
    //         })
    //     }])

    client.getTags(function (err, data) {
        console.log(data, '-----------------aaa')
    })
    // let user_arr = ['oVWfp5goiCUf1IOidyepPmLyvEq0']
    // client.batchGetUsers(user_arr, async function (err, data) {
    //     console.log(err, data, '----------------------')
    // })
}
test()