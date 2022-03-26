import React, { Component } from "react";

import CoinList from "@/components/CoinList/new_index";
import { Toast } from "antd-mobile";
import MyWeb3 from "@/config/abi/MyWeb3";
import {
	xhBindInit,
	readStatic,
	getStatic,
	readStaticTop,
} from "@/components/XHpage/contract";
import http from "@/config/axios/index.js";
import { Link } from "react-router-dom";
import BandUp from "@/components/BandUp/index.jsx";

import asstesBg from "@/static/image/home/home-center-bg.png";

export default class Zhiya extends Component {
	constructor(props) {
		super(props);
		this.state = {
			userAddress: "",
			selectType: "XH",
			xhStatic: 0,
			ylqXHstatic: 0,
			ylqXHdynamic: 0,
			staticNum: 0,
			ylqStatic: 0,
			ylqDynamic: 0,
			timer: "",
			hosToHusd: 1, //1hos = n usdt
			bdBoxShow: false,
		};
	}
	componentDidMount() {
		this.connect();
		console.log(this.context);
	}

	componentWillUnmount() {
		clearInterval(this.state.timer);
	}
	// 连接钱包，并判断是否绑定上级
	connect = () => {
		if (window.web3.eth) {
			this.setState({ userAddress: window.defaultAccount }, () => {
				// 是否绑定上级
				MyWeb3.isActive(this.state.userAddress)
					.then((res) => {
						// 如果未绑定上级，去绑定上级
						if (!res) {
							this.setState({ bdBoxShow: true });
                            this.$Child.getXHList();
                            this.$Child.getLPlist();
						} else {
							// 实例化销毁合约
							xhBindInit(this.state.userAddress);
							// 如果绑定了上级，查询静态
							this.getStaticAndDynamic();
							this.getHosToUsdt();

							// 查询以获取的奖励
							this.getLingqu();
							// 查询是否授权LP合约
							// this.$Child.getAuthLP()
							this.$Child.getXHList();
							this.$Child.getLPlist();
						}
					})
					.catch((err) => {
						console.log(err);
					});
			});
		} else {
			MyWeb3.init()
				.then((res) => {
					this.setState({ userAddress: window.defaultAccount }, () => {
						// 连接成功，查询是否绑定上级
						MyWeb3.isActive(this.state.userAddress)
							.then((res) => {
								// 如果未绑定上级，去绑定上级
								if (!res) {
									this.setState({ bdBoxShow: true });
								} else {
									// 实例化销毁合约
									xhBindInit(this.state.userAddress);
									// 如果绑定了上级，查询静态
									this.getStaticAndDynamic();
									this.getHosToUsdt();

									// 查询以获取的奖励
									this.getLingqu();
									// 查询是否授权LP合约
									// this.$Child.getAuthLP()
									this.$Child.getXHList();
									this.$Child.getLPlist();
								}
							})
							.catch((err) => {
								console.log(err);
							});
					});
				})
				.catch((err) => {
					// ...
				});
		}
	};
	// 通知父组件领取静态奖励
	upComponentGetStatic = () => {
		if (this.state.staticNum > 0) {
			this.getStatic();
		}
	};

	// 通知父组件领取销毁合约静态奖励
	upComponentGetXHstatic = () => {
		if (this.state.xhStatic > 0) {
			this.getXHstatic();
		}
	};
	// 读取HOS=USDT
	getHosToUsdt() {
		MyWeb3.getHOStoUSDT().then((res) => {
			let num1 = window.web3.utils.fromWei(res[0]);
			let num2 = window.web3.utils.fromWei(res[1], "gwei");
			let num3 = (1 / num2) * num1;
			this.setState({
				hosToHusd: num3,
			});
		});
	}
	// 轮询  获取静态奖励
	getStaticAndDynamic = () => {
		this.setState({
			timer: setInterval(() => {
				// LP合约相关
				this.readStatic();
				this.getLingqu();
				// 销毁合约相关
				this.readXHstatic();
			}, 5000),
		});
	};
	// 读取已领取收益
	getLingqu = () => {
		http
			.post("/assets", {})
			.then((res) => {
				const data = JSON.parse(res);
				this.setState({
					ylqStatic: data.data.receive_static_price,
					ylqDynamic: data.data.receive_team_price,
					ylqXHstatic: data.data.del_receive_static_price,
					ylqXHdynamic: data.data.del_receive_team_price,
				});
			})
			.catch((err) => {
				Toast.show({
					icon: "fail",
					content: "读取收益失败",
				});
			});
	};
	// 读取LP合约静态奖励
	readStatic = () => {
		MyWeb3.readStatic(this.state.userAddress)
			.then((res) => {
				// const num = res / 1000000000;
				const num = window.web3.utils.fromWei(res, "gwei");
				this.setState({ staticNum: num });
				// 读取成功后，将静态奖励余额发送给PHP
				this.sendStatic(num);
			})
			.catch((err) => {
				console.log(err);
			});
	};
	// 发送LP静态奖励数量给PHP
	sendStatic = (staticNum) => {
		const params = {
			price: staticNum,
		};
		http
			.post("/static_update", params)
			.then((res) => {
				// console.log(res)
			})
			.catch((err) => {
				console.log(err);
			});
	};
	// 领取LP静态奖励
	getStatic = () => {
		this.readStatic();
		MyWeb3.getStatic(this.state.userAddress).then((res) => {
			console.log(res);
			const params = {};
			http
				.post("/static_receive", params)
				.then((res) => {
					console.log(res);
					// 查询以获取的奖励
					this.getLingqu();
				})
				.catch((err) => {
					console.log(err);
				});
			this.readStatic();
		});
	};

	// 读取销毁合约静态奖励
	readXHstatic = async () => {
		let num_1 = 0;
		let num_2 = 0;
		// 读取销毁合约静态奖励封顶数值
		await readStaticTop().then((res) => {
			num_1 = window.web3.utils.fromWei(res, "gwei");
		});
		// 读取销毁合约静态奖励
		await readStatic().then((res) => {
			num_2 = window.web3.utils.fromWei(res, "gwei");
		});
		if (num_2 > num_1) {
			this.setState({ xhStatic: num_1 }, () => {
				console.log("XH", num_1);
			});
			this.sendXHstatic(num_1);
		} else {
			this.setState({ xhStatic: num_2 }, () => {
				console.log("XH", num_2);
			});
			this.sendXHstatic(num_2);
		}
	};
	// 发送销毁静态奖励给PHP
	sendXHstatic = (xhStaticNum) => {
		const params = {
			price: xhStaticNum,
		};
		http
			.post("/del_static_update", params)
			.then((res) => {
				// console.log(res)
			})
			.catch((err) => {
				console.log(err);
			});
	};
	// 领取销毁合约静态奖励
	getXHstatic = () => {
		this.readXHstatic();
		getStatic().then((res) => {
			const params = {};
			http
				.post("/del_static_receive", params)
				.then((res) => {
					console.log(res);
					// 查询以获取的奖励
					this.getLingqu();
				})
				.catch((err) => {
					console.log(err);
				});
			this.readXHstatic();
		});
	};
	// 获取hos的usdt价格
	getUSDT = (num) => {
		if (Number(num) === 0) {
			return 0;
		}
		let num1 = window.web3.utils.toWei(num.toString(), "gwei");
		let usdt = (num1 * this.state.hosToHusd).toString().split(".")[0];
		return window.web3.utils.fromWei(usdt, "gwei");
	};
	changeType = (type) => {
		if (this.state.selectType === type) {
			return;
		}
		this.setState({ selectType: type });
	};
    // 关闭绑定上级弹窗
	hideUpBox = () => {
		this.setState({ bdBoxShow: false });
	};
	render() {
		return (
			<div className="home">
				<div style={{ backgroundImage: `url(${asstesBg})` }} className="assets">
					<div className="assets-top">
						<div className="top-text">资产</div>
						<Link to="/default/addetsdetail" className="top-text nav-link">
							明细 >
						</Link>
					</div>
					{this.selectType === "XH" ? (
						<>
							<div className="assets-top margin20">
								<div className="center-left">
									<div className="left-top">销毁质押待领取静态收益/HOS</div>
									<div className="left-bottom">
										{this.state.xhStatic}≈ {this.getUSDT(this.state.xhStatic)} U
									</div>
								</div>
								<div
									className="center-right"
									onClick={() => {
										this.upComponentGetXHstatic();
									}}
								>
									领取
								</div>
							</div>
							<div className="assets-top assets-top-bot margin20">
								<div className="center-left flex-p">
									<div className="left-top">已领取静态收益/HOS</div>
									<div className="left-bottom">
										{this.state.ylqXHstatic}≈{" "}
										{this.getUSDT(this.state.ylqXHstatic)} U
									</div>
								</div>
								<div className="center-left flex-p">
									<div className="left-top">已领取动态收益/HOS</div>
									<div className="left-bottom">
										{this.state.ylqXHdynamic}≈{" "}
										{this.getUSDT(this.state.ylqXHdynamic)} U
									</div>
								</div>
							</div>
						</>
					) : (
						<>
							<div className="assets-top margin20">
								<div className="center-left">
									<div className="left-top">LP质押待领取静态收益/HOS</div>
									<div className="left-bottom">
										{this.state.staticNum}≈ {this.getUSDT(this.state.staticNum)}{" "}
										U
									</div>
								</div>
								<div
									className="center-right"
									onClick={() => {
										this.upComponentGetStatic();
									}}
								>
									领取
								</div>
							</div>
							<div className="assets-top assets-top-bot margin20">
								<div className="center-left flex-p">
									<div className="left-top">已领取静态收益/HOS</div>
									<div className="left-bottom">
										{this.state.ylqStatic}≈ {this.getUSDT(this.state.ylqStatic)}{" "}
										U
									</div>
								</div>
								<div className="center-left flex-p">
									<div className="left-top">已领取动态收益/HOS</div>
									<div className="left-bottom">
										{this.state.ylqDynamic}≈{" "}
										{this.getUSDT(this.state.ylqDynamic)} U
									</div>
								</div>
							</div>
						</>
					)}
				</div>
				<CoinList
					onRef={(ref) => {
						this.$Child = ref;
					}}
					addr={this.state.userAddress}
					selectTabType={this.state.selectType}
					changeType={this.changeType}
				/>
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
