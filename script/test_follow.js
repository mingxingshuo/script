var RecordModel = require('../model/Record')
var wechat_util = require('../util/get_weichat_client.js')

async function users() {
    let code = process.argv.slice(2)[0]
    let record = await RecordModel.findOne({code: code})
    let openid = record.follow_openid
    get_users(code, openid)
}

async function get_users(code, openid) {
    let client = await wechat_util.getClient(code)
    client.getFollowers(openid, async function (err, result) {
        if (err) {
            get_users(code, openid);
        } else {
            if (result.errcode) {
                await RecordModel.findOneAndUpdate({code: code}, {
                    code: code,
                    follow_openid: openid,
                    errcode: result.errcode
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
                            follow_openid: next_openid,
                            $inc: {follow_count: result.count}
                        }, {upsert: true})
                        console.log('-----------code -------' + code + '---------update--contitue------')
                        get_users(code, result.next_openid);
                    } else {
                        await RecordModel.findOneAndUpdate({code: code}, {
                            follow_openid: result.data.openid[result.data.openid.length - 1],
                            $inc: {follow_count: result.count}
                        }, {upsert: true})
                        console.log('-----------code -------' + code + '---------update--end')
                        return
                    }
                })
            } else {
                console.log('not have openid arr-----------code -------' + code + '---------update--end')
                return
            }
        }
    });
}


users()
