var mongoose = require('mongoose');
// mongoose.set('debug',true)
var Schema = mongoose.Schema;
var connect_url = require('../conf/proj.json').mongodb;
var db = mongoose.createConnection(connect_url);

var UserSchema = new Schema({
    openid: String,
    code: String,
    nickname: String,
    unionid: String,
    sex: {type: String, default: "0"},
    province: String,
    city: String,
    country: String,
    headimgurl: String,
    action_time: Number,
    tagIds: Array,
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

UserSchema.statics = {
    fetch(id, sex, tagId, codes, pre, last, cb) {
        let sql = {
            subscribe_flag: true,
            $or: [{send_time: {$lt: Date.now() - 2 * 3600 * 1000}}, {send_time: null}],
            code: {$in: codes},
            action_time: {$gt: Date.now() - 48 * 3600 * 1000}
        }
        if (sex) {
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
    fetch_openid(id,code,cb){
        if (id) {
            return this.find({_id: {$lt: id},code:code}, ['openid'])
                .limit(50)
                .sort({'_id':-1})
                .exec(cb);
        }else {
            return this.find({code:code}, ['openid'])
                .limit(50)
                .sort({'_id':-1})
                .exec(cb);
        }
    }
}


var UserModel = db.model('User', UserSchema);

module.exports = UserModel;