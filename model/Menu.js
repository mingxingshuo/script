var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var connect_url = require('../conf/proj.json').mongodb;
var db = mongoose.createConnection(connect_url);

var MenuSchema = new Schema({
    is_timing:Boolean,
    timing_time:Date,
    code: Number,
    values: Array
});

var MenuModel = db.model('Menu', MenuSchema);
module.exports = MenuModel;

