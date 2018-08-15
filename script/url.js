var schedule = require("node-schedule");
var request = require('request');
var url_conf = require('../conf/url.json');
var DomainModel = require('../model/Domain');
var exec = require('child_process').exec;

function get_url() {
    DomainModel.find(function (err,data) {
        var cmdStr = 'curl "'+data[0].domain_name+'/tuiguang/weitiao/2" -H "Proxy-Connection: keep-alive" -H "Cache-Control: max-age=0" -H "Upgrade-Insecure-Requests: 1" -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36" -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8" -H "Accept-Encoding: gzip, deflate" -H "Accept-Language: zh-CN,zh;q=0.9" -H "Cookie: UM_distinctid=1653c458c9b0-0f01b8cc94247e-37664109-100200-1653c458c9e23; CNZZDATA1274293334=785464905-1534314516-^%^7C1534314516" --compressed'
        exec(cmdStr, function(err,stdout,stderr){
          if(stdout.indexOf('data-author="mingxingshuo"') == -1){
              request.get('http://www.rrdtjj.top/transfer/update_links?domain_name=' + url_conf.url, function (err1, response1, data1) {

              })
              request.get('https://pushbear.ftqq.com/sub?sendkey=5162-6de1c6d9b764985ba73f486a4405dc66&text=' + encodeURIComponent('老板你的服务器又挂鸟') + '&desp=233333', function (err2, response2, data2) {

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