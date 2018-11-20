var wechat_util = require('../util/get_weichat_client');
var MenuModel = require('../model/Menu');
var MenuTimeModel = require('../model/MenuTime');
var schedule = require("node-schedule");

function get_timing_menu() {
    MenuTimeModel.find(function (err, menutimes) {
        if (menutimes) {
            menutimes.forEach(function (menutime) {
                send_timing(menutime);
            })
        } else {
            console.log('============= 未找到信息 ==========')
        }
    });
}

async function send_timing(menutime) {
    if (menutime.time && Date.now() - new Date(menutime.time).getTime() >= 60 * 1000 && Date.now() - new Date(menutime.time).getTime() < 120 * 1000) {
        for (let code of menutime.codes) {
            let data = {
                code: code,
                values: menutime.values
            }
            await MenuModel.update({code: code}, data)
            createMenu(code, menutime.values)
        }
    }
}

async function createMenu(code, menu) {
    var menu = {"button": menu}
    var api = await wechat_util.getClient(code);
    if (menu.button.length == 0) {
        api.removeMenu(function (err, res) {
            console.log(res);
            api.getMenu(function (err, res_m) {
                console.log(JSON.stringify(res_m));
            });
        });
        return
    } else {
        api.removeMenu(function (err, res) {
            if (err) {
                console.log('--------removeMenu-----err-----')
                console.log(err)
                console.log(res)
            }
            api.createMenu(menu, function (err, res) {
                if (err) {
                    console.log('--------createMenu-----err-----')
                    console.log(err)
                    console.log(res)
                }
                api.getMenu(function (err, res_m) {
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
