var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var connect_url = require('../conf/proj.json').mongodb;
var db = mongoose.createConnection(connect_url);

var UserTagSchema = new Schema({
    id: Number,
    name: String,
    sex:String,
    code:Number
});

var UserTagModel = db.model('UserTag', UserTagSchema);
module.exports = UserTagModel;

