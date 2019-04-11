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
                get_users(code, null, function () {
                    callback(null)
                })
            }, function (callback) {
                get_user(null, code, function () {
                    callback(null)
                })
            }, function (callback) {
                client.createTag("明星说未知", async function (err, data) {
                    console.log(data, '---------------------data')
                    await UserTagModel.create({id: data.tag.id, name: "未知", code: code})
                    get_tag(null, code, data.tag.id, '0', function () {
                        callback(null)
                    })
                })
            }, function (callback) {
                client.createTag("明星说男", async function (err, data) {
                    await UserTagModel.create({id: data.tag.id, name: "男", code: code})
                    get_tag(null, code, data.tag.id, '1', function () {
                        callback(null)
                    })
                })
            }, function (callback) {
                client.createTag("明星说女", async function (err, data) {
                    await UserTagModel.create({id: data.tag.id, name: "女", code: code})
                    get_tag(null, code, data.tag.id, '2', function () {
                        callback(null)
                    })
                })
            }], async function (error) {
            await OpenidModel.remove({code: code})
            await ConfigModel.update({code: code}, {status: 1})
            console.log('jieguan end')
            return
        })
    }
})

async function get_users(code, openid, callback) {
    console.log('code : ' + code + ' , openid : ' + openid);
    let client = await wechat_util.getClient(code)
    if (openid) {
        client.getFollowers(openid, async function (err, result) {
            if (err) {
                get_users(code, openid, callback);
            } else {
                if (result.errcode) {
                    await RecordModel.findOneAndUpdate({code: code}, {
                        code: code,
                        follow_openid: openid,
                        errcode: result.errcode
                    }, {upsert: true})
                    return callback(null)
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
                            return get_users(code, openid, callback);
                        }
                        if (result.next_openid) {
                            await RecordModel.findOneAndUpdate({code: code}, {
                                follow_openid: result.next_openid,
                                $inc: {follow_count: result.count}
                            }, {upsert: true})
                            console.log('-----------code -------' + code + '---------update--contitue------')
                            get_users(code, result.next_openid, callback);
                        } else {
                            await RecordModel.findOneAndUpdate({code: code}, {
                                follow_openid: result.data.openid[result.data.openid.length - 1],
                                $inc: {follow_count: result.count}
                            }, {upsert: true})
                            console.log('-----------code -------' + code + '---------update--end')
                            callback(null)
                        }
                    })
                } else {
                    console.log('not have openid arr-----------code -------' + code + '---------update--end')
                    callback(null)
                }
            }
        });
    } else {
        client.getFollowers(async function (err, result) {
            if (err) {
                get_users(code, openid, callback);
            } else {
                if (result.errcode) {
                    console.log('-------getFollowers error-------', err)
                    await RecordModel.findOneAndUpdate({code: code}, {
                        code: code,
                        errcode: result.errcode
                    }, {upsert: true})
                    return callback(null)
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
                            return get_users(code, openid, callback);
                        }
                        if (result.next_openid) {
                            await RecordModel.findOneAndUpdate({code: code}, {
                                follow_openid: result.next_openid,
                                $inc: {follow_count: result.count}
                            }, {upsert: true})
                            console.log('-----------code -------' + code + '---------update--contitue------')
                            get_users(code, result.next_openid, callback);
                        } else {
                            await RecordModel.findOneAndUpdate({code: code}, {
                                follow_openid: result.data.openid[result.data.openid.length - 1],
                                $inc: {follow_count: result.count}
                            }, {upsert: true})
                            console.log('-----------code -------' + code + '---------update--end')
                            callback(null)
                        }
                    })
                } else {
                    console.log('not have openid arr -----------code -------' + code + '---------update--end')
                    callback(null)
                }
            }
        });
    }
}

function get_user(_id, code, back) {
    OpenidModel.fetch(_id, code, async function (err, users) {
        var user_arr = []
        users.forEach(function (user) {
            user_arr.push(user.openid)
        })
        let client = await wechat_util.getClient(code)
        if (user_arr.length == 0) {
            console.log(user_arr, '-------------------user null')
            return back(null)
        } else {
            client.batchGetUsers(user_arr, async function (err, data) {
                if (err) {
                    get_user(_id, code, back);
                } else {
                    if (data.errcode) {
                        await RecordModel.findOneAndUpdate({code: code}, {
                            code: code,
                            user_openid: user_arr[0],
                            errcode: data.errcode
                        }, {upsert: true})
                        return back(null)
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
                                return get_user(_id, code, back);
                            }
                            UserconfModel.insertMany(userArr, async function (error, docs) {
                                if (error) {
                                    console.log('------insertMany error--------');
                                    console.log(error);
                                    console.log('------------------------------');
                                    return get_user(_id, code, back);
                                }
                                await OpenidModel.remove({openid: {$in: user_arr}})
                                await RecordModel.findOneAndUpdate({code: code}, {
                                    user_openid: user_arr[user_arr.length - 1],
                                    $inc: {user_count: user_arr.length}
                                }, {upsert: true})
                                if (users.length == 100) {
                                    get_user(users[99]._id, code, back);
                                } else {
                                    back(null)
                                }
                            })
                        })
                    } else {
                        back(null)
                    }
                }
            })
        }
    })
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
                if (error) {
                    return next(_id, code, tagId, sex, back);
                }
                if (res.errcode) {
                    await RecordModel.findOneAndUpdate({code: code}, {
                        code: code,
                        tag_openid: user_arr[0],
                        errcode: res.errcode
                    }, {upsert: true})
                    return next(null, null, null, null, back)
                }
                await UserconfModel.remove({openid: {$in: user_arr}})
                await RecordModel.findOneAndUpdate({code: code}, {
                    tag_openid: user_arr[user_arr.length - 1],
                    $inc: {tag_count: user_arr.length}
                }, {upsert: true})
                if (users.length == 50) {
                    next(users[49]._id, code, tagId, sex, back);
                } else {
                    next(null, null, null, null, back)
                }
            })
        }
    })
}

module.exports = router;
