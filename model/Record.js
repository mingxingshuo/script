var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var connect_url = require('../conf/proj.json').mongodb;
var db = mongoose.createConnection(connect_url);

var OpenidSchema = new Schema({
    code: Number,
    follow_count:{type: Number, default: 0},
    follow_openid: String,
    follow_status:{type: Number, default: 0},//0未开始，1执行中，2执行结束
    follow_errcode:{type: Number, default: 0},
    user_count:{type: Number, default: 0},
    user_openid: String,
    user_status:{type: Number, default: 0},
    user_errcode:{type: Number, default: 0},
    tag_count:{type: Number, default: 0},
    tag_openid: String,
    tag_status:{type: Number, default: 0},
    tag_errcode:{type: Number, default: 0}
});


var OpenidModel = db.model('Openid', OpenidSchema);

module.exports = OpenidModel;