var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var connect_url = require('../conf/proj.json').mongodb;
var db = mongoose.createConnection(connect_url);

var UserconfSchema = new Schema({
    openid: String,
    code: Number,
    sign: {type: Number, default: 0},          //标记
    fatherid: String,                             //父id
    hostid: String,                               //主id
    rebate: {type: Number, default: 0},          //购买返利
    friend_rebate: {type: Number, default: 0},  //好友返利
    friend: Array,                                //所有好友
    valid_friend: Array,                         //有效好友
    nickname: String,
    unionid: String,
    sex: {type: String, default: "0"},
    province: String,
    city: String,
    country: String,
    headimgurl: String,
    tagIds: Array,
    all_count: {type: Number, default: 0},
    finished_count: {type: Number, default: 0},
    unfinished_count: {type: Number, default: 0},
    current_balance: {type: Number, default: 0},
    addup_cash: {type: Number, default: 0},
    auction: {type: Number, default: 0},
    action_time: Number,
    send_time: Number,
    subscribe_time: Number,
    unsubscribe_time: Number,
    subscribe_flag: {type: Boolean, default: true},
    referee: String,
    createAt: {
        type: Date,
        default: Date.now
    },
    updateAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: {createdAt: 'createAt', updatedAt: 'updateAt'}
});

UserconfSchema.statics = {
    fetch(id, sex, tagId, codes, pre, last, cb) {
        let sql = {
            subscribe_flag: true,
            //$or: [{send_time: {$lt: Date.now() - 2 * 3600 * 1000}}, {send_time: null}],
            code: {$in: codes},
            action_time: {$gt: Date.now() - 48 * 3600 * 1000}
        }
        if (sex && sex != "all") {
            sql.sex = sex
        }
        if (tagId) {
            sql.tagIds = {$elemMatch: {$eq: tagId}}
        }
        if (id) {
            sql._id = {$lt: id}
        }
        if (pre && last) {
            sql.createAt = {$gte: pre, $lt: last}
        }

        return this.find(sql)
            .limit(50)
            .sort({'_id': -1})
            .exec(cb);

    },
    fetch_openid(id, code, cb){
        if (id) {
            return this.find({_id: {$lt: id}, code: code, sign: {$ne: 1}, subscribe_flag: true}, ['openid'])
                .limit(50)
                .sort({'_id': -1})
                .exec(cb);
        } else {
            return this.find({code: code, sign: {$ne: 1}, subscribe_flag: true}, ['openid'])
                .limit(50)
                .sort({'_id': -1})
                .exec(cb);
        }
    },
    fetchTag(id, code, sex, cb){
        if (id) {
            return this.find({_id: {$lt: id}, code: code, sex: sex}, ['openid'])
                .limit(50)
                .sort({'_id': -1})
                .exec(cb);
        } else {
            return this.find({code: code, sex: sex}, ['openid'])
                .limit(50)
                .sort({'_id': -1})
                .exec(cb);
        }
    }
}

var UserconfModel = db.model('Userconf', UserconfSchema);

module.exports = UserconfModel;