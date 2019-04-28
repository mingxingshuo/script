var UserconfModel = require('../model/Userconf');
var UserTagModel = require('../model/UserTag')
var RecordModel = require('../model/Record')
var wechat_util = require('../util/get_weichat_client.js')
var ConfigModel = require('../model/Config');

async function tag() {
    let code = process.argv.slice(2)[0]
    let tags = await UserTagModel.find({code: code})
    let config = await ConfigModel.findOne({code: code})
    for (let tag of tags) {
        console.log(tag, '------tag')
        let sex = tag.sex
        let id = tag.id
        if (sex == "0" && config.attribute == 1) {
            let tag1 = await UserTagModel.findOne({code: code, sex: '1'})
            id = tag1.id
        } else if (sex == "0" && config.attribute == 2) {
            let tag2 = await UserTagModel.findOne({code: code, sex: '2'})
            id = tag2.id
        }
        get_tag(null, code, id, sex)
    }
}

function get_tag(_id, code, tagId, sex) {
    console.log(code, '----------------code')
    if (code) {
        update_tag(_id, code, tagId, sex, get_tag);
    } else {
        console.log('update_tag end');
        return
    }
}

function update_tag(_id, code, tagId, sex, next) {
    UserconfModel.fetchTag(_id, code, sex, async function (error, users) {
        var user_arr = [];
        users.forEach(function (user) {
            user_arr.push(user.openid)
        })
        let client = await wechat_util.getClient(code)
        if (user_arr.length == 0) {
            console.log(user_arr, '-------------------user null')
            return next(null, null, null, null)
        } else {
            client.membersBatchtagging(tagId, user_arr, async function (error, res) {
                if (error) {
                    console.log(error, '---------------error')
                }
                if (res.errcode) {
                    await RecordModel.findOneAndUpdate({code: code}, {
                        code: code,
                        tag_openid: user_arr[0],
                        tag_errcode: res.errcode
                    }, {upsert: true})
                    return next(null, null, null, null)
                }
                await UserconfModel.remove({code: code, openid: {$in: user_arr}})
                await RecordModel.findOneAndUpdate({code: code}, {
                    tag_openid: user_arr[user_arr.length - 1],
                    $inc: {tag_count: user_arr.length}
                }, {upsert: true})
                if (users.length == 50) {
                    return next(users[49]._id, code, tagId, sex);
                } else {
                    return next(null, null, null, null)
                }
            })
        }
    })
}
tag()
