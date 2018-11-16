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
    fetch(id, sex, codes, cb) {
        if (sex) {
            if (id) {
                return this.find({
                    _id: {$lt: id},
                    subscribe_flag: true,
                    $or: [{send_time: {$lt: Date.now() - 2 * 3600 * 1000}}, {send_time: null}],
                    sex: sex,
                    // tagIds: {$elemMatch: {$eq: tagId}},
                    code: {$in: codes},
                    action_time: {$gt: Date.now() - 48 * 3600 * 1000}
                })
                    .limit(50)
                    .sort({'_id': -1})
                    .exec(cb);
            } else {
                return this.find({
                    subscribe_flag: true,
                    $or: [{send_time: {$lt: Date.now() - 2 * 3600 * 1000}}, {send_time: null}],
                    // tagIds: {$elemMatch: {$eq: tagId}},
                    sex: sex,
                    code: {$in: codes},
                    action_time: {$gt: Date.now() - 48 * 3600 * 1000}
                })
                    .limit(50)
                    .sort({'_id': -1})
                    .exec(cb);
            }
        } else {
            if (id) {
                return this.find({
                    _id: {$lt: id},
                    subscribe_flag: true,
                    $or: [{send_time: {$lt: Date.now() - 2 * 3600 * 1000}}, {send_time: null}],
                    code: {$in: codes},
                    action_time: {$gt: Date.now() - 48 * 3600 * 1000}
                })
                    .limit(50)
                    .sort({'_id': -1})
                    .exec(cb);
            } else {
                return this.find({
                    subscribe_flag: true,
                    $or: [{send_time: {$lt: Date.now() - 2 * 3600 * 1000}}, {send_time: null}],
                    code: {$in: codes},
                    action_time: {$gt: Date.now() - 48 * 3600 * 1000}
                })
                    .limit(50)
                    .sort({'_id': -1})
                    .exec(cb);
            }
        }

    },
    fetch_time(id, sex, codes, pre, last, cb) {
        if (sex) {
            if (id) {
                return this.find({
                    _id: {$lt: id},
                    subscribe_flag: true,
                    // tagIds: {$elemMatch: {$eq: tagId}},
                    sex: sex,
                    code: {$in: codes},
                    createAt: {$gte: pre, $lt: last}
                })
                    .limit(50)
                    .sort({'_id': -1})
                    .exec(cb);
            } else {
                return this.find({
                    subscribe_flag: true,
                    // tagIds: {$elemMatch: {$eq: tagId}},
                    sex: sex,
                    code: {$in: codes},
                    createAt: {$gte: pre, $lt: last}
                })
                    .limit(50)
                    .sort({'_id': -1})
                    .exec(cb);
            }
        } else {
            if (id) {
                return this.find({
                    _id: {$lt: id},
                    subscribe_flag: true,
                    code: {$in: codes},
                    createAt: {$gte: pre, $lt: last}
                })
                    .limit(50)
                    .sort({'_id': -1})
                    .exec(cb);
            } else {
                return this.find({
                    subscribe_flag: true,
                    code: {$in: codes},
                    createAt: {$gte: pre, $lt: last}
                })
                    .limit(50)
                    .sort({'_id': -1})
                    .exec(cb);
            }
        }
    }
}

var UserModel = db.model('User', UserSchema);

module.exports = UserModel;