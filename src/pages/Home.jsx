import React, { Component } from "react";
import "@/css/Home.scss";
import homeMenu from "@/static/image/home/home_menu.png";
import homeLogo from "@/static/image/home/home_logo.png";
import userCenterBg from "@/static/image/home/user_center_bg.png";

import { Popup, Toast } from "antd-mobile";
import UserCenter from "@/components/UserCenter/UserCenter.jsx";

import Banner from "@/components/Banner/index";
// import CoinList from "@/components/CoinList/new_index";
import NFTbox from "@/components/NFTbox";

import MyWeb3 from "@/config/abi/MyWeb3";
// import { xhBindInit, readStatic, getStatic, readStaticTop } from "@/components/XHpage/contract"

import BandUp from "@/components/BandUp/index.jsx";

import http from "@/config/axios/index.js";

import ctx from "@/config/context.js";

class Home extends Component {
	constructor(props) {
		super(props);
		this.state = {
			visible: false,
			bdBoxShow: false,
			authBoxShow: false,
			userAddress: "",
			upAddress: "",
			staticNum: 0, // 静态奖励数值
			hasUpUser: false, // 是否绑定上级
			userToken: "",
			ylqStatic: 0, // 已领取静态收益
			ylqDynamic: 0, // 已领取动态收益
            ylqXHstatic: 0, // 已领取销毁静态收益
            ylqXHdynamic: 0, // 已领取销毁动态收益
			mySuanli: "0.00", // 个人算力
			teamSuanli: "0.00", // 团队算力
            hosToHusd: 1,//1hos = n usdt
            xhStatic: 0, // 销毁合约静态奖励
            selectType: 'XH'
		};
	}
    // 上下文
    static contextType = ctx
	componentDidMount() {
        this.connect();
        console.log(this.context)
	}

    componentWillUnmount () {
        // clearInterval(this.state.timer)
    }
	// 连接钱包，并判断是否绑定上级
	connect = () => {
		// let ethereum = window.ethereum;
		// if (typeof ethereum !== "undefined" || typeof window.web3 !== "undefined") {
			MyWeb3.init()
				.then((res) => {
					Toast.show({
						content: "连接成功",
					});
					this.setState({ userAddress: window.defaultAccount });
					// 登录PHP后台
					this.login();
					// 连接成功，查询是否绑定上级
					MyWeb3.isActive(this.state.userAddress)
						.then((res) => {
							// 如果未绑定上级，去绑定上级
							if (!res) {
								this.setState({ bdBoxShow: true });
								this.setState({ hasUpUser: false });
							} else {
                                // 实例化销毁合约
                                // xhBindInit(this.state.userAddress)
								// 如果绑定了上级，查询静态
								// this.getStaticAndDynamic();
                                // this.getHosToUsdt()
								this.setState({ hasUpUser: true });
							}
						})
						.catch((err) => {
							console.log(err);
						});
				})
				.catch((err) => {
					Toast.show({
						content: "连接失败",
					});
					this.setState({ userAddress: "" });
					// 清理所有缓存
					localStorage.clear();
				});
		// } else {
		// 	alert("You have to install MetaMask !");
		// }
	};
	// 登录PHP后台
	login = () => {
		Toast.show({
			icon: "loading",
			maskClickable: false,
			duration: 0,
		});
		const params = {
			address: this.state.userAddress,
		};
		http
			.post("/userLogin", params)
			.then((res) => {
				const data = JSON.parse(res);
				Toast.show({
					icon: "success",
					content: data.title,
				});
				this.setState({ userToken: data.data.token });
				localStorage.setItem("token", data.data.token);
				// 查询以获取的奖励
				// this.getLingqu();
                // this.$Child.getXHList();
                // this.$Child.getLPlist();
			})
			.catch((err) => {
				console.log(err);
				Toast.show({
					icon: "fail",
					content: "请求失败",
				});
			});
	};

	// 轮询  获取静态奖励
	// getStaticAndDynamic = () => {
    //     this.setState({timer: setInterval(() => {
    //         // LP合约相关
	// 		this.readStatic();
    //         this.getLingqu();
    //         // 销毁合约相关
    //         this.readXHstatic();
	// 	}, 5000)})
	// };
	// 读取已领取收益
	// getLingqu = () => {
	// 	http
	// 		.post("/assets", {})
	// 		.then((res) => {
	// 			const data = JSON.parse(res);
	// 			this.setState({
	// 				ylqStatic: data.data.receive_static_price,
	// 				ylqDynamic: data.data.receive_team_price,
    //                 mySuanli: data.data.me_personal.toString(),
    //                 teamSuanli: data.data.team_personal.toString(),

    //                 ylqXHstatic: data.data.del_receive_static_price,
    //                 ylqXHdynamic: data.data.del_receive_team_price,
    //                 jiedianLevel: data.data.level_name
	// 			});
	// 		})
	// 		.catch((err) => {
	// 			Toast.show({
	// 				icon: "fail",
	// 				content: "读取收益失败",
	// 			});
	// 		});
	// };
	// // 读取LP合约静态奖励
	// readStatic = () => {
	// 	MyWeb3.readStatic(this.state.userAddress)
	// 		.then((res) => {
	// 			// const num = res / 1000000000;
    //             const num = window.web3.utils.fromWei(res, "gwei")
	// 			this.setState({ staticNum: num });
	// 			// 读取成功后，将静态奖励余额发送给PHP
	// 			this.sendStatic(num);
	// 		})
	// 		.catch((err) => {
	// 			console.log(err);
	// 		});
	// };
	// // 发送LP静态奖励数量给PHP
	// sendStatic = (staticNum) => {
	// 	const params = {
	// 		price: staticNum,
	// 	};
	// 	http
	// 		.post("/static_update", params)
	// 		.then((res) => {
	// 			// console.log(res)
	// 		})
	// 		.catch((err) => {
	// 			console.log(err);
	// 		});
	// };
	// // 领取LP静态奖励
	// getStatic = () => {
	// 	this.readStatic();
	// 	MyWeb3.getStatic(this.state.userAddress).then((res) => {
	// 		console.log(res);
	// 		const params = {};
	// 		http
	// 			.post("/static_receive", params)
	// 			.then((res) => {
	// 				console.log(res);
	// 				// 查询以获取的奖励
	// 				this.getLingqu();
	// 			})
	// 			.catch((err) => {
	// 				console.log(err);
	// 			});
	// 		this.readStatic();
	// 	});
	// };

    // // 读取销毁合约静态奖励
    // readXHstatic = async () => {
    //     let num_1 = 0
    //     let num_2 = 0
    //     // 读取销毁合约静态奖励封顶数值
    //     await readStaticTop().then(res => {
    //         num_1 = window.web3.utils.fromWei(res, "gwei")
    //     })
    //     // 读取销毁合约静态奖励
    //     await readStatic().then(res => {
    //         num_2 = window.web3.utils.fromWei(res, "gwei")
    //     })
    //     if(num_2 > num_1) {
    //         this.setState({xhStatic: num_1}, () => {console.log("XH", num_1)})
    //         this.sendXHstatic(num_1)
    //     } else {
    //         this.setState({xhStatic: num_2}, () => {console.log("XH", num_2)})
    //         this.sendXHstatic(num_2)
    //     }
    // }
    // // 发送销毁静态奖励给PHP
    // sendXHstatic = (xhStaticNum) => {
    //     const params = {
	// 		price: xhStaticNum,
	// 	};
	// 	http
	// 		.post("/del_static_update", params)
	// 		.then((res) => {
	// 			// console.log(res)
	// 		})
	// 		.catch((err) => {
	// 			console.log(err);
	// 		});
    // }
    // // 领取销毁合约静态奖励
    // getXHstatic = () => {
    //     this.readXHstatic()
    //     getStatic().then(res => {
    //         const params = {};
	// 		http
	// 			.post("/del_static_receive", params)
	// 			.then((res) => {
	// 				console.log(res);
	// 				// 查询以获取的奖励
	// 				this.getLingqu();
	// 			})
	// 			.catch((err) => {
	// 				console.log(err);
	// 			});
    //         this.readXHstatic()
    //     })
    // }

    // 截取字符串展示地址
    filterAddress = () => {
        let addr = this.state.userAddress.toString().split("")
        addr.splice(4, 34, '...')
        let endAddr = addr.join("")
        return endAddr
    }
    // 读取HOS=USDT
    // getHosToUsdt() {
    //     MyWeb3.getHOStoUSDT().then(res => {
    //         let num1 = window.web3.utils.fromWei(res[0])
    //         let num2 = window.web3.utils.fromWei(res[1], 'gwei')
    //         let num3 = 1 / num2 * num1
    //         this.setState({
    //             hosToHusd: num3
    //         })
    //     })
    // }
    // changeType = (type) => {
    //     if(this.state.selectType === type) {
    //         return
    //     }
    //     this.setState({selectType: type})
    // }
	// 关闭绑定上级弹窗
	hideUpBox = () => {
		this.setState({ bdBoxShow: false });
	};
	render() {
		return (
			<div className="home">
				<div className="top_nav">
					<div>
						<img
							src={homeMenu}
							onClick={() => {
								this.setState({ visible: true });
							}}
							alt=""
						/>
					</div>
					<div>
						<img src={homeLogo} alt="" />
					</div>
					{this.state.userAddress ? (
						<div className="link_market">{this.filterAddress()}</div>
					) : (
						<div
							className="link_market"
							onClick={() => {
								this.connect();
							}}
						>
							连接钱包
						</div>
					)}
				</div>
				<Banner
					getStaticNum={this.getStatic}
                    getXHstaticNum={this.getXHstatic}
					staticNum={this.state.staticNum}
					ylqStatic={this.state.ylqStatic}
					ylqDynamic={this.state.ylqDynamic}
                    hosToHusd={this.state.hosToHusd}
                    selectTabType={this.state.selectType}
                    ylqXHstatic={this.state.ylqXHstatic}
                    ylqXHdynamic={this.state.ylqXHdynamic}
                    xhStatic={this.state.xhStatic}
				/>
				{/* <CoinList
                    onRef={(ref)=> {this.$Child=ref}}
					addr={this.state.userAddress}
                    selectTabType={this.state.selectType}
                    changeType={this.changeType}
				/> */}
				{/* 个人中心 */}
                <NFTbox />
				<Popup
					visible={this.state.visible}
					onMaskClick={() => {
						this.setState({ visible: false });
					}}
					position="left"
					bodyStyle={{
						width: "75vw",
						backgroundImage: `url(${userCenterBg})`,
					}}
					bodyClassName="user_center_box"
				>
					<UserCenter
						mySuanli={Number(this.state.mySuanli)}
						teamSuanli={Number(this.state.teamSuanli)}
						hasUpUser={this.state.hasUpUser}
						addr={this.state.userAddress}
                        jiedianLevel={this.state.jiedianLevel}
					/>
				</Popup>
				{/* 绑定上级弹窗 */}
				<BandUp
					bdBoxShow={this.state.bdBoxShow}
					hideBoxShow={this.hideUpBox}
					userAddress={this.state.userAddress}
				/>
			</div>
		);
	}
}

export default Home;
