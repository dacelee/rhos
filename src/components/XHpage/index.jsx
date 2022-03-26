import React, { Component } from "react";
import { Input, Mask, Toast } from "antd-mobile";
import http from "@/config/axios/index.js";
import "./index.scss";

import MyWeb3 from "@/config/abi/MyWeb3";
import {
	contractInit,
	authUSDT,
	authNowCoin,
	getUSDTandNowLv,
	getUSDNum,
	getNowCoinNum,
	submit,
	isActive,
} from "./contract";

import BandUp from "@/components/BandUp/index.jsx";

import xhTitleBg from "@/static/image/home/xh-coin-bg.png";
import coinImg from "@/static/image/home/coin-coin.png";
import submitBg from "@/static/image/home/zy-bg.png";
import authBg from "@/static/image/home/auth.png";
import closeImg from "@/static/image/icon/close.png";
import okImg from "@/static/image/icon/success.png";

export default class XHpage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			bdBoxShow: false,
			submitMaskShow: false,
			authBoxShow: false,
			usdtAuth: false,
			nowCoinAuth: false,
			usdtCoinlv: [],
			allUSDT: 0,
			allNowCoinNum: 0,
			inpUSDTnum: 0,
			suanli: 0,
			showSuanli: 0,
			nowCoinInpNum: 0,
			// 将路由传参复制到state方便管理
			...this.props.location.state,
		};
	}
	componentDidMount() {
		console.log(this.props.location.state);
		// 实例化合约
		this.buildContract();
	}
	// 查询两个币种是否已授权
	searchAll = async () => {
		Toast.show({
			icon: "loading",
			maskClickable: false,
			duration: 0,
		});
		await this.getAuthNowCoin();
		await this.getAuthUSDT();
		if (!this.state.nowCoinAuth || !this.state.usdtAuth) {
			this.setState({ authBoxShow: true });
		}
		Toast.clear();
	};
	// 查询该币种是否授权
	getAuthNowCoin = async () => {
        console.log(this.state.currency);
		await http
			.post("/user_authorization", { title: this.state.currency })
			.then((res) => {
				console.log(this.state.currency);
				const data = JSON.parse(res);
				if (data.title === "未授权") {
					this.setState({ nowCoinAuth: false });
				} else {
					this.setState({ nowCoinAuth: true });
				}
                // this.getAuthUSDT()
			})
			.catch((err) => {
				console.log(err);
			});
	};
	// 查询USDT是否授权
	getAuthUSDT = async() => {
		await http
			.post("/copy_user_authorization", { title: "USDT" })
			.then((res) => {
				const data = JSON.parse(res);
				if (data.title === "未授权") {
					this.setState({ usdtAuth: false });
				} else {
					this.setState({ usdtAuth: true });
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};
	// 实例化销毁合约
	buildContract = () => {
		// USDT合约地址
		let usdtAddr = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd";
		// TEA合约地址
		let nowCoinAddr = "0xB90A225383AeB764281AA99fc70900746eC55E69";

		console.log(this.state.addr);
		if (window.web3.eth) {
			contractInit(usdtAddr, nowCoinAddr, this.state.addr);
			// 查询两个币种是否已授权
			this.searchAll();
			// 连接成功，查询是否绑定上级
			isActive(this.state.addr)
				.then((res) => {
					console.log(res);
					// 如果未绑定上级，去绑定上级
					if (!res) {
						this.setState({ bdBoxShow: true });
					}
				})
				.catch((err) => {
					console.log(err);
				});
            this.searchCoinLv()
            this.getBalanceOf()
		} else {
			MyWeb3.init()
				.then((res) => {
					contractInit(usdtAddr, nowCoinAddr, this.state.addr);
					// 查询两个币种是否已授权
					this.searchAll();
					// 连接成功，查询是否绑定上级
					isActive(this.state.addr)
						.then((res) => {
							console.log(res);
							// 如果未绑定上级，去绑定上级
							if (!res) {
								this.setState({ bdBoxShow: true });
							}
						})
						.catch((err) => {
							console.log(err);
						});
					this.searchCoinLv();
					this.getBalanceOf();
				})
				.catch((err) => {
					// ...
				});
		}
	};
	// 查询币种余额
	getBalanceOf = () => {
		getUSDNum().then((res) => {
			let usdtNum = window.web3.utils.fromWei(res);
			console.log(usdtNum);
			this.setState({ allUSDT: usdtNum });
		});
		getNowCoinNum().then((res) => {
			let nowNum = window.web3.utils.fromWei(res, "gwei");
			console.log(nowNum);
			this.setState({ allNowCoinNum: nowNum });
		});
	};
	// 质押第一个弹窗
	zyFunc = () => {
        if(Number(this.state.inpUSDTnum) === 0) {
            Toast.show({
				content: "请输入质押数量",
                position: 'bottom',
			});
            return
        }
		this.computedSuanli();
		this.setState({ submitMaskShow: true });
	};
	// USDT授权
	goUSDTAuth = () => {
		authUSDT().then((res) => {
			Toast.show({
				icon: "success",
				content: "授权成功",
			});
			this.authToPHP("USDT");
			this.setState({ usdtAuth: true });
		});
	};
	// 当前币种授权
	goNowCoinAuth = () => {
		authNowCoin().then((res) => {
			Toast.show({
				icon: "success",
				content: "授权成功",
			});
			this.authToPHP(this.state.currency);
			this.setState({ nowCoinAuth: true });
		});
	};
	// 通知PHP授权成功
	authToPHP = (coin) => {
		Toast.show({
			icon: "loading",
			maskClickable: false,
			duration: 0,
		});
		http
			.post("/authorization", { title: coin })
			.then((res) => {
				Toast.show({
					icon: "success",
					content: "同步成功",
				});
				this.setState({ LPisAuth: true });
			})
			.catch((err) => {
				Toast.show({
					icon: "fail",
					content: "同步失败",
				});
			});
	};
	searchCoinLv = () => {
		getUSDTandNowLv().then((res) => {
			this.setState(
				{
					usdtCoinlv: res,
				},
				() => {
					console.log(this.state.usdtCoinlv);
				}
			);
		});
	};
	// 计算当前币种数量
	computedNowCoinNum = () => {
		let num = this.state.inpUSDTnum;
		let num_1 = num.toString().split(".");
		console.log(num_1);
		if (num_1.length > 1 && num_1[1].length > 9) {
			let num_2 = num_1[0] + "." + num_1[1].slice(0, 9);
			console.log(num_2);
			this.setState({ nowCoinInpNum: num_2 });
		} else {
			this.setState({ nowCoinInpNum: num });
		}
	};
	// 计算算力
	computedSuanli = () => {
		let usdt = window.web3.utils.toWei(this.state.inpUSDTnum.toString());
		let startNum =
			(usdt / this.state.usdtCoinlv[0]) * this.state.usdtCoinlv[1] * 2;
		let endNum = Math.floor(startNum);
		let showNum = window.web3.utils.fromWei(endNum.toString());
		this.setState({ suanli: endNum, showSuanli: showNum });
	};
	// 提交销毁质押
	pageSubmit = () => {
		let num = this.state.inpUSDTnum.toString();
		let nowCoinInputNum = window.web3.utils.toWei(
			this.state.nowCoinInpNum,
			"gwei"
		);
		let nowUSDTInpNum = window.web3.utils.toWei(num);
		console.log(
			this.state.addr,
			this.state.suanli,
			nowCoinInputNum,
			nowUSDTInpNum
		);
		// return
		submit(this.state.suanli, nowCoinInputNum, nowUSDTInpNum)
			.then((res) => {
				Toast.show({
					icon: "success",
					content: "质押成功",
				});
				// 同步数据到PHP
				this.sendToPHP(res.transactionHash);
				console.log(res);
			})
			.catch((err) => {
				console.log(err);
			});
	};
	// 质押成功通知PHP
	sendToPHP = (hash) => {
		Toast.show({
			icon: "loading",
			maskClickable: false,
			duration: 0,
		});
		const params = {
			id: this.state.id,
			price: this.state.nowCoinInpNum,
			price_in: this.state.showSuanli,
			hash: hash,
			price_from: this.state.inpUSDTnum,
		};
		http
			.post("/inputPledged", params)
			.then((res) => {
				Toast.show({
					icon: "success",
					content: "同步成功",
				});
				this.setState({ submitMaskShow: false });
			})
			.catch((err) => {
				Toast.show({
					icon: "fail",
					content: "同步失败",
				});
			});
	};
	// 关闭绑定上级弹窗
	hideUpBox = () => {
		this.setState({ bdBoxShow: false });
	};
	render() {
		return (
			<div className="xh-page">
				<div
					className="xh-top-bg"
					style={{ backgroundImage: `url(${xhTitleBg})` }}
				>
					<div className="top-box">
						<div className="left-item">
							<span>USDT-{this.state.currency}</span>
							<span>1X</span>
						</div>
						<img className="right-item" src={coinImg} alt="" />
					</div>
					<div className="bot-box">
						<div className="bot-item">
							<span>USDT-{this.state.currency}</span>
							<span>Deposit</span>
						</div>
						<div className="bot-item">
							<span>
								{this.state.action_sy} ~ {this.state.end_sy}
							</span>
							<span>APY</span>
						</div>
					</div>
				</div>
				<div className="coin-seting">
					{/* <div className="title">HOS质押比例</div>
					<div className="select-box">
						<div className="select-item">80%</div>
						<div className="select-item">70%</div>
						<div className="select-item">50%</div>
					</div>
					<div className="select-text">您将获得80%算力</div> */}
					<div className="inp-box">
						<div className="inp-top">
							<Input
								className="inp-main"
								value={this.state.inpUSDTnum}
								onChange={(value) => {
									this.setState(
										{
											inpUSDTnum: value,
										},
										() => {
											this.computedNowCoinNum();
										}
									);
								}}
								placeholder="请输入"
							/>
							<span className="inp-coin">USDT</span>
						</div>
						<div className="inp-bot">
							<div className="bot-left">
								USDT可挖矿余额：{this.state.allUSDT}
							</div>
							<div
								className="bot-btn"
								onClick={() => {
									this.setState({ inpUSDTnum: this.state.allUSDT }, () => {
										this.computedNowCoinNum();
									});
								}}
							>
								MAX
							</div>
						</div>
					</div>
					<div className="need">
						需要{this.state.currency}: {this.state.nowCoinInpNum}
					</div>
					<div className="need-re">
						{this.state.currency}余额:{" "}
						{this.state.allNowCoinNum - this.state.inpUSDTnum}
					</div>
					<div
						className="bottom-btn"
						onClick={() => {
							this.zyFunc();
						}}
					>
						质押
					</div>
				</div>
				<Mask visible={this.state.submitMaskShow}>
					<div
						className="submit-mask"
						style={{ backgroundImage: `url(${submitBg})` }}
					>
						<div className="mask-title">确认购买</div>
						<img
							onClick={() => {
								this.setState({ submitMaskShow: false });
							}}
							className="close"
							src={closeImg}
							alt=""
						/>
						<div className="suanli">算力：{this.state.showSuanli}</div>
						<div className="line"></div>
						<div className="suanli">总价：</div>
						<div className="price-line">
							<span>1</span>
							<span>{this.state.inpUSDTnum} USDT</span>
						</div>
						<div className="price-line">
							<span>2</span>
							<span>
								{this.state.nowCoinInpNum} {this.state.currency}
							</span>
						</div>
						<div className="btn-box">
							<div
								className="btn-item"
								onClick={() => this.setState({ submitMaskShow: false })}
							>
								取消
							</div>
							<div className="btn-item" onClick={() => this.pageSubmit()}>
								确认
							</div>
						</div>
					</div>
				</Mask>
				{/* 授权弹窗 */}
				<Mask
					visible={this.state.authBoxShow}
					onMaskClick={() => this.setState({ authBoxShow: false })}
				>
					<div
						className="auth-mask"
						style={{ backgroundImage: `url(${authBg})` }}
					>
						<img
							onClick={() => {
								this.setState({ authBoxShow: false });
							}}
							className="close"
							src={closeImg}
							alt=""
						/>
						<div className="auth-text">您需要授权合约访问您的以下资产</div>
						<div className="auth-item">
							<span className="auth-title">{this.state.currency}资产</span>
							<img
								className="auth-ok"
								style={{
									display: `${this.state.nowCoinAuth ? "block" : "none"}`,
								}}
								src={okImg}
								alt=""
							/>
							<span
								className="auth-no"
								style={{
									display: `${this.state.nowCoinAuth ? "none" : "block"}`,
								}}
								onClick={() => {
									this.goNowCoinAuth();
								}}
							>
								去授权
							</span>
						</div>
						<div className="auth-item">
							<span className="auth-title">USDT资产</span>
							<img
								className="auth-ok"
								style={{ display: `${this.state.usdtAuth ? "block" : "none"}` }}
								src={okImg}
								alt=""
							/>
							<span
								className="auth-no"
								style={{ display: `${this.state.usdtAuth ? "none" : "block"}` }}
								onClick={() => {
									this.goUSDTAuth();
								}}
							>
								去授权
							</span>
						</div>
					</div>
				</Mask>
				{/* 绑定上级 */}
				<BandUp
					bdBoxShow={this.state.bdBoxShow}
					hideBoxShow={this.hideUpBox}
					userAddress={this.state.addr}
				/>
			</div>
		);
	}
}
