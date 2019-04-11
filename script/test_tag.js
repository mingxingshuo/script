var ConfigModel = require('../model/Config');
var wechat_util = require('../util/get_weichat_client.js')

async function tag() {
    let code = process.argv.slice(2)[0]
    let tags = await UserTagModel.find({code: code})
    for (let tag of tags) {
        get_tag(null, code, tag.tagId, tag.sex)
    }
}

async function get_tag(_id, code, tagId, sex) {
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
            next(null, null, null, null)
        } else {
            client.membersBatchtagging(tagId, user_arr, async function (error, res) {
                if (error) {
                    return next(_id, code, tagId, sex);
                }
                if (res.errcode) {
                    await RecordModel.findOneAndUpdate({code: code}, {
                        code: code,
                        tag_openid: user_arr[0],
                        errcode: res.errcode
                    }, {upsert: true})
                    return next(null, null, null, null)
                }
                await UserconfModel.deleteMany(users)
                await RecordModel.findOneAndUpdate({code: code}, {
                    tag_openid: user_arr[user_arr.length - 1],
                    $inc: {tag_count: user_arr.length}
                }, {upsert: true})
                if (users.length == 50) {
                    next(users[49]._id, code, tagId, sex);
                } else {
                    next(null, null, null, null)
                }
            })
        }
    })
}
tag()