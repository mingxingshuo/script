var wechat_util = require('../util/get_weichat_client.js')

async function test() {
    let client = await wechat_util.getClient(225)
    let user_arr = ['aa', 'bb']
    client.batchGetUsers(user_arr, async function (err, data) {
        console.log(err, data, '----------------------')
    })
}
test()