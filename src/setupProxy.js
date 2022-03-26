/*
 * @Author: your name
 * @Date: 2021-12-16 17:03:31
 * @LastEditTime: 2021-12-16 17:13:19
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /Dapp/RHOS/rhos/src/setupProxy.js
 */
// 跨域代理设置
const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
    app.use(createProxyMiddleware('/api', {
        target: 'http://hos.pulianhong.com',
        secure: false,
        changeOrigin: true,
        pathRewrite: {
            "^/api": "/api"
        }
    }))
}