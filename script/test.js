var wechat_util = require('../util/get_weichat_client.js')

async function test(code) {
    let client = await wechat_util.getClient(code)
    // client.getTags(function (err,data) {
    //     console.log(data,'-----------------aaa')
    // })
    let user_arr = ['oVWfp5goiCUf1IOidyepPmLyvEq0']
    client.batchGetUsers(user_arr, async function (err, data) {
        console.log(err, data, '----------------------')
    })
}
test(225)