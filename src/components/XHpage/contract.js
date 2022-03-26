/*
 * @Author: your name
 * @Date: 2021-12-07 11:02:36
 * @LastEditTime: 2021-12-21 09:09:07
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /Dapp/RHOS/rhos/src/components/XHpage/contract.js
 */

import { Toast } from "antd-mobile";
import authAbi from "./authabi.json"
import xhAbi from "./xhabx.json"
import contractaddress from "@/config/abi/contractAddress.js"


// USDT合约地址
let usdtAddr = null;
// TEA合约地址
let nowCoinAddr = null;
// 销毁合约地址
let xhAddr = contractaddress.xhContractAddress;

let pageUSDTauthContract = null
let pageNowCoinContract = null
let pageXHcontract = null

// 当前用户地址
let userAddr = null

// 为绑定上级初始化
export function xhBindInit(user_Addr) {
    // 设置用户地址
    userAddr = user_Addr
    pageXHcontract = new window.web3.eth.Contract(xhAbi.abi, xhAddr)
}

export function contractInit(usdt_Addr, nowCoin_Addr, user_Addr) {
    // USDT合约地址
    usdtAddr = usdt_Addr;
    // TEA合约地址
    nowCoinAddr = nowCoin_Addr;
    // 设置用户地址
    userAddr = user_Addr

    pageUSDTauthContract = new window.web3.eth.Contract(authAbi.abi, usdtAddr)
    pageNowCoinContract = new window.web3.eth.Contract(authAbi.abi, nowCoinAddr)
    pageXHcontract = new window.web3.eth.Contract(xhAbi.abi, xhAddr)
    
}

// 授权usdt
export function authUSDT() {
    return new Promise((resolve, reject) => {
        Toast.show({
            icon: 'loading',
            maskClickable: false,
            duration: 0
        })
        console.log(xhAddr)
        pageUSDTauthContract.methods.approve(xhAddr, "9999999999999999999999999999")
            .send({ from: userAddr })
            .on('receipt', (receipt) => {
                // 交易收据
                resolve('receipt', receipt)
            })
            .on('error', (error, receipt) => {
                Toast.show({
                    icon: 'fail',
                    content: '授权失败'
                })
                console.log({ error: error, receipt: receipt })
                reject({ error: error, receipt: receipt })
            })
    })
}

// 授权当前币种
export function authNowCoin() {
    return new Promise((resolve, reject) => {
        Toast.show({
            icon: 'loading',
            maskClickable: false,
            duration: 0
        })
        console.log(xhAddr)
        pageNowCoinContract.methods.approve(xhAddr, '99999999999999999999999999')
            .send({ from: userAddr })
            .on('receipt', (receipt) => {
                // 交易收据
                resolve('receipt', receipt)
            })
            .on('error', (error, receipt) => {
                Toast.show({
                    icon: 'fail',
                    content: '授权失败'
                })
                console.log({ error: error, receipt: receipt })
                reject({ error: error, receipt: receipt })
            })
    })
}

// 查看当前阶段USDT和当前币种的比例
export function getUSDTandNowLv() {
    return new Promise((resolve, reject) => {
        pageXHcontract.methods.usdtHos()
            .call()
            .then((res) => {
                resolve(res)
            })
    })
}

// 查看当前UDST数量
export function getUSDNum() {
    return new Promise((resolve, reject) => {
        pageUSDTauthContract.methods.balanceOf(userAddr)
            .call()
            .then((res) => {
                resolve(res)
            })
    })
}

// 查看当前币种余额
export function getNowCoinNum() {
    return new Promise((resolve, reject) => {
        pageNowCoinContract.methods.balanceOf(userAddr)
            .call()
            .then((res) => {
                resolve(res)
            })
    })
}

// 提交销毁
export function submit(suanli, nowCoinInpNum, nowUSDTInpNum) {
    return new Promise((resolve, reject) => {
        Toast.show({
            icon: 'loading',
            maskClickable: false,
            duration: 0
        })
        console.log(nowCoinAddr, suanli, nowCoinInpNum, nowUSDTInpNum)
        pageXHcontract.methods.hosToken(nowCoinAddr, suanli, nowCoinInpNum, nowUSDTInpNum)
            .send({ from: userAddr })
            .on('receipt', (receipt) => {
                // 交易收据
                resolve(receipt)
            })
            .on('error', (error, receipt) => {
                Toast.show({
                    icon: 'fail',
                    content: '质押失败'
                })
                console.log({ error: error, receipt: receipt })
                reject({ error: error, receipt: receipt })
            })
    })
}
export function isActive() {
    return new Promise((resolve, reject) => {
        pageXHcontract.methods.isActive(userAddr)
                .call()
                .then((res) => {
                    resolve(res)
                }).catch(err => {
                    reject(err)
                })
    })
}
// 销毁合约绑定上级
export function bindup(bindAddress) {
    return new Promise((resolve, reject) => {
        Toast.show({
            icon: 'loading',
            maskClickable: false,
            duration: 0
        })
        pageXHcontract.methods.bindIntro(bindAddress)
            .send({ from: userAddr })
            .on('receipt', (receipt) => {
                // 交易收据
                resolve('receipt', receipt)
            })
            .on('error', (error, receipt) => {
                Toast.show({
                    icon: 'fail',
                    content: '绑定失败'
                })
                console.log({ error: error, receipt: receipt })
                reject({ error: error, receipt: receipt })
            })
    })
}

// 获取静态奖励封顶数值
export function readStaticTop() {
    return new Promise((resolve, reject) => {
        pageXHcontract.methods.getUserLastHos()
            .call()
            .then((res) => {
                resolve(res)
            })
    })
}

// 获取静态奖励
export function readStatic() {
    return new Promise((resolve, reject) => {
        pageXHcontract.methods.earned(userAddr)
            .call()
            .then((res) => {
                resolve(res)
            })
    })
}
// 领取静态奖
export function getStatic() {
    Toast.show({
        icon: 'loading',
        maskClickable: false,
        duration: 0
    })
    return new Promise((resolve, reject) => {
        pageXHcontract.methods.takeProfit()
            .send({ from: userAddr })
            .on('receipt', (receipt) => {
                Toast.show({
                    icon: 'success',
                    content: '领取成功'
                })
                // 交易收据
                resolve(receipt)
            })
            .on('error', (error, receipt) => {
                Toast.show({
                    icon: 'fail',
                    content: '领取失败'
                })
                console.log({ error: error, receipt: receipt })
                reject({ error: error, receipt: receipt })
            })
    })
}