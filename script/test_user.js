var ConfigModel = require('../model/Config');
var wechat_util = require('../util/get_weichat_client.js')

function get_user() {
    let code = process.argv.slice(2)[0]
    update_user(null, code)
}

function update_user(_id, code) {
    OpenidModel.fetch(_id, code, async function (err, users) {
        var user_arr = []
        users.forEach(function (user) {
            user_arr.push(user.openid)
        })
        let client = await wechat_util.getClient(code)
        if (user_arr.length == 0) {
            console.log(user_arr, '-------------------user null')
            return
        } else {
            client.batchGetUsers(user_arr, async function (err, data) {
                if (err) {
                    update_user(_id, code);
                } else {
                    if (data.errcode) {
                        await RecordModel.findOneAndUpdate({code: code}, {
                            code: code,
                            user_openid: user_arr[0],
                            errcode: data.errcode
                        }, {upsert: true})
                        return
                    }
                    if (data && data.user_info_list) {
                        let userArr = []
                        async.eachLimit(data.user_info_list, 100, function (info, callback) {
                            if (info.nickname) {
                                userArr.push({
                                    code: code,
                                    openid: info.openid,
                                    sex: info.sex.toString()
                                })
                            }
                            callback(null)
                        }, function (error) {
                            if (error) {
                                console.log(error, '--------------error')
                                return update_user(_id, code);
                            }
                            UserconfModel.insertMany(userArr, async function (error, docs) {
                                if (error) {
                                    console.log('------insertMany error--------');
                                    console.log(error);
                                    console.log('------------------------------');
                                    return update_user(_id, code);
                                }
                                await OpenidModel.deleteMany(users)
                                await RecordModel.findOneAndUpdate({code: code}, {
                                    user_openid: user_arr[user_arr.length - 1],
                                    $inc: {user_count: user_arr.length}
                                }, {upsert: true})
                                if (users.length == 100) {
                                    update_user(users[99]._id, code);
                                } else {
                                    return
                                }
                            })
                        })
                    } else {
                        await OpenidModel.deleteMany(users)
                        await RecordModel.findOneAndUpdate({code: code}, {
                            user_openid: user_arr[user_arr.length - 1],
                            $inc: {user_count: user_arr.length}
                        }, {upsert: true})
                        if (users.length == 100) {
                            update_user(users[99]._id, code);
                        } else {
                            return
                        }
                    }
                }
            })
        }
    })
}

get_user()