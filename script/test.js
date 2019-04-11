var wechat_util = require('../util/get_weichat_client.js')

async function test(code) {
    let client = await wechat_util.getClient(code)
    client.getTags(function (err,data) {
        console.log(data,'-----------------aaa')
    })
    // let user_arr = ['oVWfp5irPDm_FbVASNKS8Wbs9vDo','oVWfp5vz4RrH9riSItQR5VKPLHnk','x','xx']
    // client.batchGetUsers(user_arr, async function (err, data) {
    //     console.log(err, data, '----------------------')
    // })
}
test(225)