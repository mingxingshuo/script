var OpenidModel = require('../model/Openid');
var RecordModel = require('../model/Record')
var wechat_util = require('../util/get_weichat_client.js')

async function users() {
    let code = process.argv.slice(2)[0]
    let record = await RecordModel.findOne({code: code})
    console.log(record, '-----------------------record')
    if (record) {
        let openid = record.follow_openid
        get_users(code, openid)
    } else {
        get_users(code, null)
    }
}

async function get_users(code, openid) {
    let client = await wechat_util.getClient(code)
    if (openid) {
        client.getFollowers(openid, async function (err, result) {
            if (err) {
                console.log(err, '------------------error')
            } else {
                if (result.errcode) {
                    await RecordModel.findOneAndUpdate({code: code}, {
                        code: code,
                        follow_openid: openid,
                        follow_errcode: result.errcode
                    }, {upsert: true})
                    return
                }
                if (result && result.data && result.data.openid) {
                    var openids = [];
                    for (var index in result.data.openid) {
                        openids.push({'openid': result.data.openid[index], 'code': code});
                    }
                    OpenidModel.insertMany(openids, async function (error, docs) {
                        if (error) {
                            console.log('------insertMany error--------');
                            console.log(error);
                            console.log('------------------------------');
                            return get_users(code, openid);
                        }
                        if (result.next_openid) {
                            await RecordModel.findOneAndUpdate({code: code}, {
                                follow_openid: result.next_openid,
                                $inc: {follow_count: result.count}
                            }, {upsert: true})
                            console.log('-----------code -------' + code + '---------update--contitue------')
                            setTimeout(function () {
                                get_users(code, result.next_openid);
                            }, 60 * 1000)
                        } else {
                            await RecordModel.findOneAndUpdate({code: code}, {
                                follow_openid: result.data.openid[result.data.openid.length - 1],
                                $inc: {follow_count: result.count}
                            }, {upsert: true})
                            console.log(code + '-------follow---end')
                            return
                        }
                    })
                } else {
                    console.log(code + '-------follow---end')
                    return
                }
            }
        });
    } else {
        client.getFollowers(async function (err, result) {
            if (err) {
                console.log(err, '------------------error')
            } else {
                if (result.errcode) {
                    await RecordModel.findOneAndUpdate({code: code}, {
                        code: code,
                        follow_openid: openid,
                        follow_errcode: result.errcode
                    }, {upsert: true})
                    return
                }
                if (result && result.data && result.data.openid) {
                    var openids = [];
                    for (var index in result.data.openid) {
                        openids.push({'openid': result.data.openid[index], 'code': code});
                    }
                    OpenidModel.insertMany(openids, async function (error, docs) {
                        if (error) {
                            console.log('------insertMany error--------');
                            console.log(error);
                            console.log('------------------------------');
                            return get_users(code, openid);
                        }
                        if (result.next_openid) {
                            await RecordModel.findOneAndUpdate({code: code}, {
                                follow_openid: result.next_openid,
                                $inc: {follow_count: result.count}
                            }, {upsert: true})
                            console.log('-----------code -------' + code + '---------update--contitue------')
                            setTimeout(function () {
                                get_users(code, result.next_openid);
                            }, 60 * 1000)
                        } else {
                            await RecordModel.findOneAndUpdate({code: code}, {
                                follow_openid: result.data.openid[result.data.openid.length - 1],
                                $inc: {follow_count: result.count}
                            }, {upsert: true})
                            console.log(code + '-------follow---end')
                            return
                        }
                    })
                } else {
                    console.log(code + '-------follow---end')
                    return
                }
            }
        });
    }
}

users()
