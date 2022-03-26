/*
 * @Author: your name
 * @Date: 2021-11-04 11:44:48
 * @LastEditTime: 2022-01-20 09:16:30
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /授权/auth_app/src/abi/MyWeb3.js
 */
import Web3 from "web3";
// 质押合约ABI.json
import zyabi from "./zhiya.abi.json"
// LP合约ABI.json
import lpabi from "./lp.abi.json"
// nft抽卡ABI.json
import ckabi from "./nftChouKa.abi.json"
// 水晶abi
import sjabi from "./shuijing.abi.json"
// 合约地址(质押、LP)
import contractAddress from './contractAddress'
import { Toast, Dialog } from "antd-mobile";


const MyWeb3 = {
    init() {
        return new Promise((resolve, reject) => {
            // let that = this
            let ethereum = window.ethereum
            //禁止自动刷新，metamask要求写的
            ethereum.autoRefreshOnNetworkChange = false
            //开始调用metamask *** 新版本 ***
            try {
                window.ethereum.request({ method: 'eth_requestAccounts' }).then(accounts => {
                    console.log(accounts)
                    // 初始化provider
                    let provider = window['ethereum'] || window.web3.currentProvider
                    //初始化Web3
                    window.web3 = new Web3(provider)
                    //获取到当前以太坊网络id
                    window.web3.eth.net.getId().then(result => {
                        console.log(result)
                        let currentChainId = result
                        //设置最大监听器数量，否则出现warning
                        window.web3.currentProvider.setMaxListeners(300)
                        //从json获取到当前网络id下的合约地址, currentChainId: 56是币安正式链， 97是币安测试链
                        console.log("----------ID:",currentChainId)
                        if (currentChainId === 97) {
                            // 实例化质押合约
                            window.zyContract = new window.web3.eth.Contract(zyabi.abi, contractAddress.zyContractAddress)
                            // 实例化LP合约
                            // window.lpContract = new window.web3.eth.Contract(lpabi.abi, contractAddress.lpContractAddress)
                            // 实例化HOS合约
                            window.hosContract = new window.web3.eth.Contract(lpabi.abi, contractAddress.hosContractAddress)
                            // 实例化nft抽卡合约
                            window.nftChoukaContract = new window.web3.eth.Contract(ckabi.abi, contractAddress.nftContractAddress)
                            // nftChoukaContract = new window.web3.eth.Contract(ckabi.abi, contractAddress.nftContractAddress)
                            // 实例化  领水晶收gas费的合约
                            // window.nftSjContract = new window.web3.eth.Contract(zyabi.abi, contractAddress.nftSJAddress)
                            //获取到当前(使用者)默认的以太坊地址
                            window.defaultAccount = accounts[0].toLowerCase()
                            // 监听事件
                            // this.listenerNewPlayer()
                            // 监听网络切换和账户切换
                            this.allEvents(ethereum)
                            resolve(true)
                        } else {
                            // alert("本项目仅支持币安测试链！")
                            Dialog.alert({
                                content: '本项目仅支持币安测试链！',
                                onConfirm: () => {
                                    window.location.reload()
                                },
                            })
                            reject('Unknow Your ChainId:' + currentChainId)
                        }
                    })
                }).catch(err => {
                    reject(err)
                })
            } catch (error) {
                if (error.code === 4001) {
                    // User rejected request
                }
                Dialog.alert({
                    content: '本项目仅支持币安测试链！',
                    onConfirm: () => {
                        window.location.reload()
                    },
                })
                reject(error)
            }
        })
    },
    // 判断是否激活
    isActive(userAddress) {
        return new Promise((resolve, reject) => {
            window.zyContract.methods.isActive(userAddress)
                .call()
                .then((res) => {
                    resolve(res)
                })
        })
    },
    // 绑定上级
    bindIntro(userAddress, bindAddress) {
        return new Promise((resolve, reject) => {
            Toast.show({
                icon: 'loading',
                maskClickable: false,
                duration: 0
            })
            window.zyContract.methods.bindIntro(bindAddress)
                .send({ from: userAddress })
                .on('receipt', (receipt) => {
                    // 交易收据
                    resolve(receipt)
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
    },
    // 获取用户当前可用的LP
    getUserLp(userAddress, lpContractAddress) {
        const lpContract = new window.web3.eth.Contract(lpabi.abi, lpContractAddress)
        return new Promise((resolve, reject) => {
            lpContract.methods.balanceOf(userAddress)
                .call()
                .then((res) => {
                    resolve(res)
                })
        })
    },
    // 获取用户当前可用的HOS数量
    getUserHOSNum(userAddress) {
        return new Promise((resolve, reject) => {
            window.hosContract.methods.balanceOf(userAddress)
                .call()
                .then((res) => {
                    resolve(res)
                })
        })
    },
    // 在HOS合约中授权
    authZYuseHOS(userAddress, type = 1) {
        Toast.show({
            icon: 'loading',
            maskClickable: false,
            duration: 0
        })
        let useContractAddress;
        // 质押合约使用HOS
        if (type === 1) {
            useContractAddress = contractAddress.zyContractAddress
        }
        // NFT抽卡合约使用HOS
        if (type === 2) {
            useContractAddress = contractAddress.nftContractAddress
        }
        return new Promise((resolve, reject) => {
            window.hosContract.methods.approve(useContractAddress, "9999999999999999999")
                .send({ from: userAddress })
                .on('receipt', (receipt) => {
                    Toast.show({
                        icon: 'success',
                        content: '授权成功'
                    })
                    // 交易收据
                    resolve(receipt)
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
    },
    // NFT充值
    transfer(userAddress, nftAddress, num) {
        Toast.show({
            icon: 'loading',
            maskClickable: false,
            duration: 0
        })
        let numToWei = window.web3.utils.toWei(num.toString(), "gwei");
        console.log(userAddress)
        return new Promise((resolve, reject) => {
            window.hosContract.methods.transfer(nftAddress, numToWei)
                .send({ from: userAddress })
                .on('receipt', (receipt) => {
                    // 交易收据
                    resolve(receipt)
                })
                .on('error', (error) => {
                    Toast.show({
                        icon: 'fail',
                        content: '充值失败'
                    })
                    console.log({ error: error })
                    reject({ error: error })
                })
        })
    },
    // 授权LP合约
    bindLpContract(userAddress, lpContractAddress) {
        Toast.show({
            icon: 'loading',
            maskClickable: false,
            duration: 0
        })
        const lpContract = new window.web3.eth.Contract(lpabi.abi, lpContractAddress)
        console.log(lpContractAddress)
        return new Promise((resolve, reject) => {
            lpContract.methods.approve(contractAddress.zyContractAddress, "9999999999999999999")
                .send({ from: userAddress })
                .on('receipt', (receipt) => {
                    Toast.show({
                        icon: 'success',
                        content: '授权成功'
                    })
                    // 交易收据
                    resolve(receipt)
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
    },
    // 执行质押LP(质押合约)
    zhiyaLP(userAddress, amount, destroyNo = 1, lpContractAddress) {
        Toast.show({
            icon: 'loading',
            maskClickable: false,
            duration: 0
        })
        return new Promise((resolve, reject) => {
            window.zyContract.methods.hosToken(lpContractAddress, amount, destroyNo)
                .send({ from: userAddress })
                // .on('transactionHash', (transactionHash) => {
                //     // 交易哈希
                //     resolve('transactionHash', transactionHash)
                // })
                // .on('confirmation', (confirmationNumber, receipt) => {
                //     // confirmationNumber: 交易确认数量
                //     resolve('confirmation', { confirmationNumber: confirmationNumber, receipt: receipt })
                // })
                .on('receipt', (receipt) => {
                    Toast.show({
                        icon: 'success',
                        content: '质押成功'
                    })
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
    },
    // 获取质押算力
    getLpsuanli(userAddress, amount, lpContractAddress) {
        return new Promise((resolve, reject) => {
            window.zyContract.methods.getLpHosPrice(lpContractAddress, amount)
                .call()
                .then((res) => {
                    resolve(res)
                })
        })
    },
    // 获取hos=usdt数量
    getHOStoUSDT() {
        return new Promise((resolve, reject) => {
            window.zyContract.methods.usdtHos()
                .call()
                .then((res) => {
                    resolve(res)
                })
        })
    },
    // 获取静态奖励
    readStatic(userAddress) {
        return new Promise((resolve, reject) => {
            window.zyContract.methods.earned(userAddress)
                .call()
                .then((res) => {
                    resolve(res)
                })
        })
    },
    // 领取静态奖
    getStatic(userAddress) {
        Toast.show({
            icon: 'loading',
            maskClickable: false,
            duration: 0
        })
        return new Promise((resolve, reject) => {
            window.zyContract.methods.takeProfit()
                .send({ from: userAddress })
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
    },
    // 发送 gas 费用
    sendGas(userAddress) {
        Toast.show({
            icon: 'loading',
            maskClickable: false,
            duration: 0
        })
        return new Promise((resolve, reject) => {
            // GAS 费用
            const gas = window.web3.utils.toWei(0.0003.toString());
            console.log(gas)
            // 创建随机数，创建订单编号
            const data_time = new Date().getTime();
            const random_1 = parseInt(Math.random() * Math.random() * 100) + '';
            const random_2 = parseInt(Math.random() * Math.random() * 100) + '';
            const orderNo = data_time + random_1 + random_2;
            window.zyContract.methods.extraGas(orderNo)
                .send(
                    {
                        from: userAddress,
                        value: gas
                    }
                )
                .on('receipt', (receipt) => {
                    // 交易收据
                    resolve(receipt)
                })
                .on('error', (error, receipt) => {
                    Toast.show({
                        icon: 'fail',
                        content: '发送失败'
                    })
                    console.log({ error: error, receipt: receipt })
                    reject({ error: error, receipt: receipt })
                })
        })
    },
    // 获取用户当前可用的水晶数量
    getUserSJNum(userAddress) {
        // 实例化  领水晶收gas费的合约
        const nftSjContract = new window.web3.eth.Contract(sjabi.abi, contractAddress.nftSJAddress)
        return new Promise((resolve, reject) => {
            nftSjContract.methods.balanceOf(userAddress, 1001)
                .call()
                .then((res) => {
                    resolve(res)
                })
        })
    },
    // // 领水晶前发送GAS费
    // sendSjGas(userAddress) {
    //     Toast.show({
    //         icon: 'loading',
    //         maskClickable: false,
    //         duration: 0
    //     })
    //     return new Promise((resolve, reject) => {
    //         // GAS 费用
    //         const gas = window.web3.utils.toWei(0.0003.toString());
    //         console.log(gas)
    //         // 创建随机数，创建订单编号
    //         const data_time = new Date().getTime();
    //         const random_1 = parseInt(Math.random() * Math.random() * 100) + '';
    //         const random_2 = parseInt(Math.random() * Math.random() * 100) + '';
    //         const orderNo = data_time + random_1 + random_2;
    //         window.nftSjContract.methods.extraGas(orderNo)
    //             .send(
    //                 {
    //                     from: userAddress,
    //                     value: gas
    //                 }
    //             )
    //             .on('receipt', (receipt) => {
    //                 // 交易收据
    //                 resolve(receipt)
    //             })
    //             .on('error', (error, receipt) => {
    //                 Toast.show({
    //                     icon: 'fail',
    //                     content: '发送失败'
    //                 })
    //                 console.log({ error: error, receipt: receipt })
    //                 reject({ error: error, receipt: receipt })
    //             })
    //     })
    // },
    // nft抽卡发送 100 HOS和 0.005 BNB
    sendFeiForNFT(userAddress, orderNo) {
        Toast.show({
            icon: 'loading',
            maskClickable: false,
            duration: 0
        })
        return new Promise((resolve, reject) => {
            // BNB 费用
            const gas = window.web3.utils.toWei(0.005.toString());
            console.log(gas)
            // 创建随机数，创建订单编号
            // const data_time = new Date().getTime();
            // const random_1 = parseInt(Math.random() * Math.random() * 100) + '';
            // const random_2 = parseInt(Math.random() * Math.random() * 100) + '';
            // const orderNo = data_time + random_1 + random_2;
            window.nftChoukaContract.methods.newNfOrder(orderNo)
                .send(
                    {
                        from: userAddress,
                        value: gas
                    }
                )
                .on('receipt', (receipt) => {
                    // 交易收据
                    resolve(receipt)
                })
                .on('error', (error, receipt) => {
                    Toast.show({
                        icon: 'fail',
                        content: '发送失败'
                    })
                    console.log({ error: error, receipt: receipt })
                    reject({ error: error, receipt: receipt })
                })
        })
    },
    // 监听newplayer事件
    listenerNewPlayer() {
        return new Promise((resolve, reject) => {
            window.nftChoukaContract.events.CreateNf({},function(err,res){
                resolve(res)
            })
        })
    },
    // 抽卡
    creatNFT(userAddress, orderID) {
        return new Promise((resolve, reject) => {
            // 创建随机数，创建订单编号
            const data_time = new Date().getTime();
            const random_1 = parseInt(Math.random() * Math.random() * 100) + '';
            const random_2 = parseInt(Math.random() * Math.random() * 100) + '';
            const randomNum = data_time + random_1 + random_2;
            window.nftChoukaContract.methods.createNf(userAddress, orderID, randomNum)
                .send({ from: userAddress })
                .on('receipt', (receipt) => {
                    Toast.clear()
                    // 交易收据
                    resolve(receipt)
                })
                .on('error', (error, receipt) => {
                    Toast.show({
                        icon: 'fail',
                        content: '抽卡失败'
                    })
                    console.log({ error: error, receipt: receipt })
                    reject({ error: error, receipt: receipt })
                })
        })

    },
    // 解压
    jieya(userAddress, jieyaNum, lpContractAddress) {
        Toast.show({
            icon: 'loading',
            maskClickable: false,
            duration: 0
        })
        return new Promise((resolve, reject) => {
            window.zyContract.methods.takeToken(jieyaNum, lpContractAddress)
                .send({ from: userAddress })
                .on('receipt', (receipt) => {
                    Toast.show({
                        icon: 'success',
                        content: '解压成功'
                    })
                    // 交易收据
                    resolve(receipt)
                })
                .on('error', (error, receipt) => {
                    Toast.show({
                        icon: 'fail',
                        content: '解压失败'
                    })
                    console.log({ error: error, receipt: receipt })
                    reject({ error: error, receipt: receipt })
                })
        })
    },
    //所有事件
    allEvents(ethereum) {
        // let that = this
        try {
            ethereum
                // 监听账户切换
                .on("accountsChanged", function (accounts) {
                    console.log("accountsChanged: " + accounts);
                    // 清理所有缓存
                    localStorage.clear();
                    // window.location.reload()
                    window.location.href = window.location.origin
                })
                // 监听切换网络 ID
                .on("chainChanged", function (networkVersion) {
                    console.log("networkChanged: " + networkVersion);
                    // 清理所有缓存
                    localStorage.clear();
                    // window.location.reload()
                    window.location.href = window.location.origin
                });
        } catch (err) {
            console.log(err)
        }

    }
}
export default MyWeb3;