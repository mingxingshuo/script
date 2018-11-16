var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var connect_url = require('../conf/proj.json').mongodb;
var db = mongoose.createConnection(connect_url);

var MessageSchema = new Schema({
    task: Boolean,
    sex: String,
    type: Number,//0链接 1文本 2 图片 3
    img: String,
    url: String,
    title: String,
    delay: Number,
    des: String,
    take_over: Boolean,
    is_timing: Boolean,
    timing_time: Date,
    time: String,
    tagId: Number,
    contents: [{
        title: String,
        description: String,
        url: String,
        picurl: String
    }],
    codes: [String],
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

MessageSchema.statics = {
    fetch(id, codes, cb) {
        if (id) {
            return this.find({_id: {$lt: id}, code: {$in: codes}})
                .limit(50)
                .sort({'_id': -1})
                .exec(cb);
        } else {
            return this.find({code: {$in: codes}})
                .limit(50)
                .sort({'_id': -1})
                .exec(cb);
        }

    }
}

var MessageModel = db.model('Message', MessageSchema);

module.exports = MessageModel;