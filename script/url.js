var schedule = require("node-schedule");
var request = require('request');
var url_conf = require('../conf/url.json');
var DomainModel = require('../model/Domain');

function get_url() {
    DomainModel.find(function (err,data) {
        request.get(data[0].domain_name+'/tuiguang/weitiao/2', function (err, response, data) {
            if (response.statusCode != 200 || data.indexOf('data-author="mingxingshuo"') == -1) {
                request.get('http://www.rrdtjj.top/transfer/update_links?domain_name='+url_conf.url, function (err1, response1, data1) {

                })
                request.get('https://pushbear.ftqq.com/sub?sendkey=5162-6de1c6d9b764985ba73f486a4405dc66&text='+encodeURIComponent('老板你的服务器又挂鸟')+'&desp=233333', function (err2, response2, data2) {

                })
            }
        })
    })
}
var rule = new schedule.RecurrenceRule();
var times = [1];
rule.second = times;
var j = schedule.scheduleJob(rule, function () {
    console.log('更新url信息');
    get_url();
});