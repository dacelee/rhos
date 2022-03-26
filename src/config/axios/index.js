/*
 * @Author: your name
 * @Date: 2021-11-30 13:40:28
 * @LastEditTime: 2021-12-21 08:59:25
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /rhos/src/config/axios/index.js
 */
import axios from "axios"


let url;

url= "http://hos.pulianhong.com/api";
// 开发环境
// if (process.env.NODE_ENV === 'development') {
//     url = 'http://localhost:3000/api';
// }
axios.defaults.baseURL = url
//一些配置，发起请求和响应可以打印出来查看
axios.interceptors.request.use((config)=>{
    //这里是用户登录的时候，将token写入了sessionStorage中了，之后进行其他的接口操作时，进行身份验证。
    config.headers["x-token"] = localStorage.getItem("token") || '';
    return config;
})
// //在response中
// axios.interceptors.response.use(config =>{
//     return config;
// })
const http = {
    post: '',
    get: '',
    getParams: ''
}

http.post = function (api, data){  // post请求
    return new Promise((resolve, reject)=>{
        axios.post(api,data).then(response=>{
            if (response.status === 200) {
                resolve(response.data)
            } else {
                reject(response)
            }
        }).catch(err => {
            reject(err)
        })
    })
}
http.get = function (api, data){ // get请求
    return new Promise((resolve, reject)=>{
        axios.get(api,data).then(response=>{
            resolve(response)
        })
    })
}
http.getParams = function (api, param){ //get请求 需要传参
    return new Promise((resolve, reject)=>{
        axios.get(api, {params: param}).then(response => {
            resolve(response.data)
        }, err => {
            reject(err)
        }).catch((error) => {
            reject(error)
        })
    })
}

export default http