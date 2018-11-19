var wechat_util = require('../util/get_weichat_client');
var MenuModel = require('../model/Menu');
var async = require('async');
var schedule = require("node-schedule");

function get_timing_menu() {
    MenuModel.find({is_timing: true}, function (err, menus) {
        if (menus) {
            menus.forEach(function (menu) {
                send_timing(null, menu);
            })
        } else {
            console.log('============= 未找到信息 ==========')
        }
    });
}

function send_timing(user_id, menu) {
    if (menu.timing_time && Date.now() - new Date(menu.timing_time).getTime() >= 60 * 1000 && Date.now() - new Date(menu.timing_time).getTime() < 120 * 1000) {
        createMenu(menu.code,menu.values)
    }
}

async function createMenu(code,menu) {
    var menu = {"button":menu}
    console.log(menu,'---------------------menu')
    var api = await WechatUtil.getClient(code);
    if(menu.button.length==0){
        api.removeMenu(function(err,res){
            console.log(res);
            api.getMenu(function(err,res_m){
                console.log(JSON.stringify(res_m));
            });
        });
        return
    }else{
        api.removeMenu(function(err,res){
            if(err){
                console.log('--------removeMenu-----err-----')
                console.log(err)
                console.log(res)
            }
            api.createMenu(menu, function(err,res){
                if(err){
                    console.log('--------createMenu-----err-----')
                    console.log(err)
                    console.log(res)
                }
                api.getMenu(function(err,res_m){
                    console.log(err)
                    console.log(JSON.stringify(res_m));
                });
            });
        });
        return
    }
}

var rule = new schedule.RecurrenceRule();
var times = [1];
rule.second = times;
var j = schedule.scheduleJob(rule, function () {
    console.log('更新菜单栏');
    get_timing_menu()
});
