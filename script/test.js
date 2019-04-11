var UserconfModel = require('../model/Userconf');
var ConfigModel = require('../model/Config');
var OpenidModel = require('../model/Openid');
var UserTagModel = require('../model/UserTag')
var RecordModel = require('../model/Record')
var wechat_util = require('../util/get_weichat_client.js')

async function test(code) {
    // await RecordModel.update({_id:'5caf03cde2e9e277aa62d246'},{follow_openid:'oVWfp5goiCUf1IOidyepPmLyvEq0'})
    let client = await wechat_util.getClient(code)
    // UserTagModel.remove({code: code}, function (err, doc) {
    //     client.getTags(function (err, res) {
    //         console.log(res, '------------------res')
    //         for (let i of res.tags) {
    //             console.log(i, '--------------------i')
    //             if (i.name == "明星说男" || i.name == "明星说女" || i.name == "明星说未知") {
    //                 client.deleteTag(i.id, function (error, res) {
    //                     console.log(res)
    //                 })
    //             }
    //         }
    //     })
    // })
    // client.createTag("明星说未知", async function (err, data) {
    //     client.createTag("明星说男", async function (err, data1) {
    //         client.createTag("明星说女", async function (err, data2) {
    //             await UserTagModel.create({id: data.tag.id, name: "未知", code: code})
    //             await UserTagModel.create({id: data1.tag.id, name: "男", code: code})
    //             await UserTagModel.create({id: data2.tag.id, name: "女", code: code})
    //         })
    //     })
    // })

    client.getTags(function (err, data) {
        console.log(data, '-----------------aaa')
    })
    // let user_arr = ['oVWfp5goiCUf1IOidyepPmLyvEq0']
    // client.batchGetUsers(user_arr, async function (err, data) {
    //     console.log(err, data, '----------------------')
    // })
}
test(225)