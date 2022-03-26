import React, { Component } from "react";
import PropTypes from "prop-types";
import { withRouter, Link } from "react-router-dom";
import { Search, Mask, Input, ActionSheet, Slider, Toast } from "antd-mobile";
import MyWeb3 from "@/config/abi/MyWeb3";
import "./index.scss";

import coinImg from "@/static/image/home/coin-coin.png";
import coinItemBg from "@/static/image/home/coin-list-bg.png";
import xhItemBg from "@/static/image/home/xh-bg.png";
import zyBg from "@/static/image/home/zy-bg.png";
import closeImg from "@/static/image/icon/close.png";
import BigNumber from "bignumber.js";
import authBg from "@/static/image/home/auth.png";
import okImg from "@/static/image/icon/success.png";
import http from "@/config/axios/index.js";
import { toolNumber } from "./number";

class TabBox extends Component {
	constructor(props) {
		super(props);
		this.state = {
			// selectTabType: "ZY", //  ZY  LP
			zyMaskShow: false,
			zyfaShow: false,
			zyfa: [
				{ text: "扣除0%，1HOS=1算力", key: "1", kc: "0" },
				{ text: "扣除20%，1HOS=2算力", key: "2", kc: "2" },
			],
			selectZyfa: { text: "扣除0%，1HOS=1算力", key: "1", kc: "0" },
			jyMaskShow: false,
			jieyaLv: 10,
			inputLPnum: 0,
			suanli: 0,
			authBoxShow: false,
			usdtAuth: false,
			hosAuth: true,
			XHList: [], // 销毁合约列表
			user: "00000000000000000000000000",
			LPisAuth: false,
			jiazhi: 0,
			xhHos: 0,
			myLPinNet: {
				lp: 0,
				power: 0,
			},
			jieyaLP: 0, // 解压的LP数量
			jieyaFei: 0, // 解压手续费
			endSuanli: 0, // 解压后算力
			jieyaSuanli: 0, // 解压的算力
			// lpToPower: 0, // 1LP等于多少算力
			userAllLpNum: 0, // 用户共有多少LP
			userAllHOSnum: 0, // 用户共有多少HOS
			lpList: [
				// {
				// 	sname: "USDT",
				//     ename: 'HOS',
				// 	contractAddress: "0x53C9dAB10dc2E88a740df94e79b1Ad85CA0AF779",
				// 	apy: 5000,
				// 	apy_lv: "100%~200%",
				// 	yzy: "0.000000123",
				// 	zysl: "0.00000010888",
				// },
				// {
				//     sname: "BNB",
				//     ename: 'HOS',
				// 	contractAddress: "0x7Ce97F7a792e300DA00a19486536dDAD02449A5d",
				// 	apy: 5000,
				// 	apy_lv: "100%~200%",
				// 	yzy: "0.000000123",
				// 	zysl: "0.00000010888",
				// },
			],
			selectLPitem: {}, // lpList中，选中的lp
			HOSisAuth: true, // LP质押中，HOS是否授权
		};
	}

	// 对传入的参数进行格式验证

	static propTypes = {
		addr: PropTypes.string.isRequired,
	};


	componentDidMount() {
		// this.getXHList();
		// this.getLPlist()
		this.props.onRef(this);
	}
	changeTab = (type) => {
		if (this.props.selectTabType === type) {
			return;
		} else {
			// this.setState({ selectTabType: type });
			this.props.changeType(type);
		}
		// console.log(this.props.selectTabType);
	};
	// 获取当前用户可用LP数量
	getUserAllLpNum = () => {
		MyWeb3.getUserLp(
			this.props.addr,
			this.state.selectLPitem.contractAddress
		).then((res) => {
			console.log(res);
			const num = window.web3.utils.fromWei(res.toString());
			this.setState({ userAllLpNum: num });
		});
	};
	// 获取当前用户可用hos数量
	getUserAllHOS = () => {
		MyWeb3.getUserHOSNum(this.props.addr).then((res) => {
			console.log(res);
			const num = window.web3.utils.fromWei(res.toString(), "gwei");
			this.setState({ userAllHOSnum: num });
		});
	};
	// 解压滑块计算手续费、解压后算力
	computedNum(value = 10) {
		let oldLp = new BigNumber(this.state.myLPinNet.lp);
		// 手续费
		let startFei = oldLp.times(value / 10000).toNumber();
		let fei = toolNumber(startFei, 18);
		// 解压后算力
		let num_1 = new BigNumber(this.state.myLPinNet.power);
		let num_2 = num_1.times(value / 100);
		let num = num_1.minus(num_2).toString();
		let endNum = num;
		// 解压算力
		let jieya = num_1.times(value / 100);
		let endJieya = jieya;
		// 解压多少LP
		let startJieYaLP = oldLp.times(value / 100);
		let jieyaLP = startJieYaLP;

		// console.log(num)
		this.setState({
			jieyaLv: value,
			jieyaFei: fei,
			endSuanli: endNum,
			jieyaSuanli: endJieya,
			jieyaLP: jieyaLP,
		});
	}

	// 解压方法
	jieyaFunc = () => {
		if (this.state.jieyaLv <= 0) {
			return;
		}
		MyWeb3.jieya(
			this.props.addr,
			this.state.jieyaLv,
			this.state.selectLPitem.contractAddress
		)
			.then((res) => {
				console.log(res);
				this.sendJieyaToPHP(res.transactionHash);
			})
			.catch((err) => {
				console.log(err);
			});
	};
	// 解压成功通知PHP
	sendJieyaToPHP = (hash) => {
		Toast.show({
			icon: "loading",
			maskClickable: false,
			duration: 0,
		});
		const params = {
			title: this.state.selectLPitem.sname + this.state.selectLPitem.ename,
			price: this.state.jieyaSuanli,
			lp: this.state.jieyaLP,
			hash: hash,
			fee: this.state.jieyaFei,
		};
		http
			.post("/outLP", params)
			.then((res) => {
				console.log(res);
				Toast.show({
					icon: "success",
					content: "同步成功",
				});
				this.setState({
					myLPinNet: {
						lp: 0,
						power: 0,
					},
					jieyaFei: 0,
					endSuanli: 0,
					jyMaskShow: false,
				});
			})
			.catch((err) => {
				Toast.show({
					icon: "fail",
					content: "同步失败",
				});
				console.log(err);
			});
	};
	// 查询LP和HOS是否授权
	searchAll = async () => {
		Toast.show({
			icon: "loading",
			maskClickable: false,
			duration: 0,
		});
		await this.getAuthLP();
		await this.getAuthLpCoin();
		if (!this.state.HOSisAuth || !this.state.LPisAuth) {
			this.setState({ authBoxShow: true });
		}
		Toast.clear();
	};

	// 查询LP是否授权
	getAuthLP = async () => {
		const titleName =
			this.state.selectLPitem.sname + this.state.selectLPitem.ename;
		await http
			.post("/user_authorization", { title: titleName })
			.then((res) => {
				console.log(res);
				const data = JSON.parse(res);
				if (data.title === "未授权") {
					this.setState({ LPisAuth: false });
				} else {
					this.setState({ LPisAuth: true });
				}
				// this.setState({ LPisAuth: false });
			})
			.catch((err) => {
				console.log(err);
				this.setState({ LPisAuth: false });
			});
	};
	// 查询HOS币种是否授权
	getAuthLpCoin = async () => {
		const titleName = "LPHOS";
		await http
			.post("/user_authorization", {
				title: titleName,
			})
			.then((res) => {
				const data = JSON.parse(res);
				if (data.title === "未授权") {
					this.setState({ HOSisAuth: false });
				} else {
					this.setState({ HOSisAuth: true });
				}
			})
			.catch((err) => {
				console.log(err);
				this.setState({ HOSisAuth: false });
			});
	};
	// HOS授权
	authHOS = () => {
		MyWeb3.authZYuseHOS(this.props.addr)
			.then((res) => {
				console.log(res);
				this.authHOStoPHP();
			})
			.catch((err) => {
				console.log(err);
			});
	};

	// HOS授权通知PHP
	authHOStoPHP = () => {
		Toast.show({
			icon: "loading",
			maskClickable: false,
			duration: 0,
		});
		const titleName = "LPHOS";
		http
			.post("/authorization", { title: titleName })
			.then((res) => {
				Toast.show({
					icon: "success",
					content: "同步成功",
				});
				this.setState({ HOSisAuth: true });
			})
			.catch((err) => {
				Toast.show({
					icon: "fail",
					content: "同步失败",
				});
			});
	};

	// 查询已质押LP数量
	searchLP = () => {
		const params = {
			title: this.state.selectLPitem.sname + this.state.selectLPitem.ename,
		};
		http
			.post("/lp_details", params)
			.then((res) => {
				const data = JSON.parse(res);
				console.log(data.data);
				this.setState(
					{
						myLPinNet: {
							lp: data.data.lp,
							power: data.data.power,
						},
					},
					() => {
						this.computedNum();
					}
				);
			})
			.catch((err) => {
				console.log(err);
			});
	};

	// 授权LP
	authLPcontract = () => {
		MyWeb3.bindLpContract(
			this.props.addr,
			this.state.selectLPitem.contractAddress
		)
			.then((res) => {
				console.log(res);
				this.authLPtoPHP();
			})
			.catch((err) => {
				console.log(err);
			});
	};

	// 授权LP通知PHP
	authLPtoPHP = () => {
		Toast.show({
			icon: "loading",
			maskClickable: false,
			duration: 0,
		});
		const title = this.state.selectLPitem.sname + this.state.selectLPitem.ename;
		http
			.post("/authorization", { title: title })
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

	// 质押LP
	zhiyaPay = () => {
		if (this.state.inputLPnum <= 0) {
			return;
		}
		// let oldNum = new BigNumber(this.state.inputLPnum);
		// let num = oldNum.multipliedBy(1000000000000000000).toNumber();
		let num = window.web3.utils.toWei(this.state.inputLPnum.toString());
		console.log(num);
		MyWeb3.zhiyaLP(
			this.props.addr,
			num,
			this.state.selectZyfa.key,
			this.state.selectLPitem.contractAddress
		).then((res) => {
			console.log(res);
			// 通知PHP
			this.zhiyaToPHP(res.transactionHash);
		});
	};
	// 通知PHP质押数量
	zhiyaToPHP = (hash) => {
		Toast.show({
			icon: "loading",
			maskClickable: false,
			duration: 0,
		});
		const params = {
			title: this.state.selectLPitem.sname + this.state.selectLPitem.ename,
			price: this.state.inputLPnum,
			price_in: this.state.suanli,
			hash: hash,
			type: this.state.selectZyfa.key,
		};
		http
			.post("/inputLp", params)
			.then((res) => {
				Toast.show({
					icon: "success",
					content: "同步成功",
				});
				this.setState({
					zyMaskShow: false,
					userAllLpNum: 0,
					userAllHOSnum: 0,
					inputLPnum: 0,
					jiazhi: 0,
					xhHos: 0,
					suanli: 0,
				});
			})
			.catch((err) => {
				Toast.show({
					icon: "fail",
					content: "通知失败",
				});
			});
	};
	// 获取销毁列表
	getXHList = () => {
		const params = {};
		http
			.post("/destroy_list", params)
			.then((res) => {
				const data = JSON.parse(res);
				console.log(data);
				this.setState({ XHList: data.data });
			})
			.catch((err) => {
				console.log(err);
				Toast.show({
					icon: "fail",
					content: "获取失败",
				});
			});
	};
	// 获取LP列表
	getLPlist = () => {
		const params = {};
		http
			.post("/lp_list", params)
			.then((res) => {
				const data = JSON.parse(res);
				console.log(data);
				this.setState({ lpList: data.data });
			})
			.catch((err) => {
				console.log(err);
				Toast.show({
					icon: "fail",
					content: "获取失败",
				});
			});
	};
	// 去销毁页面
	goXH = (item) => {
		let data = {
			addr: this.props.addr,
			...item,
		};
		this.props.history.push({ pathname: "/default", query: data });
	};
	// 获取质押算力  备注改为获取质押LP价值
	zhiyaSuanli = () => {
		if (this.state.inputLPnum <= 0) {
			this.setState({ suanli: 0 });
			return;
		}

		let num = window.web3.utils.toWei(this.state.inputLPnum.toString());
		MyWeb3.getLpsuanli(
			this.props.addr,
			num,
			this.state.selectLPitem.contractAddress
		)
			.then((res) => {
				// 改备注后版本
				let suanli = window.web3.utils.fromWei(
					(res * this.state.selectZyfa.key).toString().split(".")[0],
					"gwei"
				);
				let xhHos = window.web3.utils.fromWei(
					((res * this.state.selectZyfa.kc) / 10).toString().split(".")[0],
					"gwei"
				);
				let jiazhi = window.web3.utils.fromWei(res, "gwei");

				this.setState({ suanli: suanli, jiazhi: jiazhi, xhHos: xhHos });
			})
			.catch((err) => {
				console.log(err);
			});
	};

	// 质押方案
	zyfaBox = () => {
		return (
			<>
				<ActionSheet
					extra="请选择质押方案"
					visible={this.state.zyfaShow}
					actions={this.state.zyfa}
					onAction={(action, index) => {
						this.setState(
							{
								selectZyfa: action,
								zyfaShow: false,
							},
							() => {
								this.zhiyaSuanli();
							}
						);
					}}
					onClose={() => {
						this.setState({ zyfaShow: false });
					}}
				/>
			</>
		);
	};

	// 授权弹窗
	anthBox = () => {
		return (
			<>
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
							<span className="auth-title">{`${this.state.selectLPitem.sname}-${this.state.selectLPitem.ename}合约`}</span>
							<img
								className="auth-ok"
								style={{ display: `${this.state.LPisAuth ? "block" : "none"}` }}
								src={okImg}
								alt=""
							/>
							<span
								className="auth-no"
								style={{ display: `${this.state.LPisAuth ? "none" : "block"}` }}
								onClick={() => {
									this.authLPcontract();
								}}
							>
								去授权
							</span>
						</div>
						<div className="auth-item">
							<span className="auth-title">HOS资产</span>
							<img
								className="auth-ok"
								style={{
									display: `${this.state.HOSisAuth ? "block" : "none"}`,
								}}
								src={okImg}
								alt=""
							/>
							<span
								className="auth-no"
								style={{
									display: `${this.state.HOSisAuth ? "none" : "block"}`,
								}}
								onClick={() => {
									this.authHOS();
								}}
							>
								去授权
							</span>
						</div>
					</div>
				</Mask>
			</>
		);
	};
	// 解押 DOM
	jyBox = () => {
		return (
			<Mask
				visible={this.state.jyMaskShow}
				onMaskClick={() =>
					this.setState({
						myLPinNet: {
							lp: 0,
							power: 0,
						},
						jieyaFei: 0,
						endSuanli: 0,
						jyMaskShow: false,
					})
				}
			>
				<div className="zy-mask" style={{ backgroundImage: `url(${zyBg})` }}>
					<div className="mask-title mask-title-jy">解押</div>
					<img
						onClick={() => {
							this.setState({
								myLPinNet: {
									lp: 0,
									power: 0,
								},
								jieyaFei: 0,
								endSuanli: 0,
								jyMaskShow: false,
							});
						}}
						className="close"
						src={closeImg}
						alt=""
					/>
					<div className="mask-item">
						<span className="item-title">质押LP</span>
						<span className="item-num coin-num">{this.state.myLPinNet.lp}</span>
						<span className="item-coin">LP</span>
					</div>
					<div className="mask-item">
						<span className="item-title">质押算力</span>
						<span className="item-num">{this.state.myLPinNet.power}</span>
					</div>
					<div className="mask-item noborder">
						<span className="item-title">解押</span>
						<span className="item-num">{this.state.jieyaLv}%</span>
					</div>
					<div className="setup">
						<Slider
							value={this.state.jieyaLv}
							onChange={(value) => {
								this.computedNum(value);
							}}
							min={1}
							max={100}
							className="slider"
							step={1}
						/>
					</div>
					<div className="mask-item">
						<span className="item-title">解押手续费</span>
						<span className="item-num coin-num">{this.state.jieyaFei}</span>
						<span className="item-coin">LP</span>
					</div>
					<div className="mask-item">
						<span className="item-title">解押后算力</span>
						<span className="item-num">{this.state.endSuanli}</span>
					</div>
					<div className="beizhu">解押扣1%手续费</div>
					<div
						className="mask-btn jieya"
						onClick={() => {
							if (this.state.myLPinNet.lp <= 0) {
								return;
							}
							this.jieyaFunc();
						}}
					>
						确认
					</div>
				</div>
			</Mask>
		);
	};
	// 质押弹窗
	zyBox = () => {
		return (
			<Mask
				visible={this.state.zyMaskShow}
				onMaskClick={() =>
					this.setState({
						zyMaskShow: false,
						userAllLpNum: 0,
						userAllHOSnum: 0,
						inputLPnum: 0,
						jiazhi: 0,
						xhHos: 0,
						suanli: 0,
					})
				}
			>
				<div className="zy-mask" style={{ backgroundImage: `url(${zyBg})` }}>
					<div className="mask-title">质押</div>
					<img
						onClick={() => {
							this.setState({
								zyMaskShow: false,
								userAllLpNum: 0,
								userAllHOSnum: 0,
								inputLPnum: 0,
								jiazhi: 0,
								xhHos: 0,
								suanli: 0,
							});
						}}
						className="close"
						src={closeImg}
						alt=""
					/>
					<div className="mask-item">
						<span className="item-title">质押LP数量</span>
						{/* onChange={val => this.setState({inputLPnum: val})} */}
						<Input
							className="item-input"
							onChange={(val) => {
								this.setState({ inputLPnum: val }, () => {
									this.zhiyaSuanli();
								});
							}}
							value={this.state.inputLPnum}
							placeholder="请输入"
						/>
						{/*  onClick={() => {this.setState({inputLPnum: this.state.userAllLpNum})}} */}
						<span
							className="item-max"
							onClick={() => {
								this.setState({ inputLPnum: this.state.userAllLpNum }, () => {
									this.zhiyaSuanli();
								});
							}}
						>
							最大
						</span>
					</div>
					<div className="can-use">可用：{this.state.userAllLpNum} LP</div>
					<div className="mask-item">
						<span className="item-title">质押LP价值</span>
						<span className="item-num">{this.state.jiazhi} HOS</span>
					</div>
					<div
						className="mask-item"
						onClick={(e) => {
							this.setState({ zyfaShow: !this.state.zyfaShow });
						}}
					>
						<span className="item-title">质押方案</span>
						<span className="item-num">{this.state.selectZyfa.text}</span>
						<div className="item-more">
							<span className="more-icon">></span>
							{this.state.zyfaShow ? (
								<div className="select-box">
									{this.state.zyfa.map((item, index) => {
										return (
											<div
												onClick={(e) => {
													e.stopPropagation();
													this.setState(
														{ selectZyfa: item, zyfaShow: false },
														() => {
															this.zhiyaSuanli();
														}
													);
												}}
												key={index}
												className="select-item"
											>
												{item.text}
											</div>
										);
									})}
								</div>
							) : (
								<></>
							)}
						</div>
					</div>

					<div className="mask-item">
						<span className="item-title">销毁HOS</span>
						<span className="item-num">{this.state.xhHos}</span>
					</div>
					<div className="can-use">可用：{this.state.userAllHOSnum} HOS</div>
					<div className="mask-item">
						<span className="item-title">质押算力</span>
						<span className="item-num">{this.state.suanli}</span>
					</div>
					<div
						className="mask-btn"
						onClick={() => {
							this.zhiyaPay();
						}}
					>
						确认
					</div>
				</div>
			</Mask>
		);
	};

	coinItem = () => {
		// LP质押
		const lpList = this.state.lpList.map((item, index) => {
			return (
				<div
					className="coin-item"
					style={{ backgroundImage: `url(${coinItemBg})` }}
					key={index}
				>
					<div className="item-top">
						<img className="top-icon" src={coinImg} alt="" />
						<span className="top-center">
							{`${item.sname}-${item.ename}`} LP
						</span>
						<span className="top-right">APY:{item.apy}</span>
					</div>
					<div className="item-center">
						<div className="center-list">
							<span>APY</span>
							<span>{item.apy_lv}</span>
						</div>
						<div className="center-list">
							<span>已质押</span>
							<span>{item.yzy} LP</span>
						</div>
						<div className="center-list">
							<span>质押算力</span>
							<span>{item.zysl}</span>
						</div>
					</div>
					<div className="item-bottom">
						<div
							className="btn-item"
							onClick={() => {
								this.setState(
									{
										selectLPitem: item,
										zyMaskShow: true,
									},
									() => {
										this.getUserAllLpNum();
										this.getUserAllHOS();
										this.searchAll();
									}
								);
							}}
						>
							质押
						</div>
						<div
							className="btn-item"
							onClick={() => {
								this.setState(
									{
										selectLPitem: item,
										jyMaskShow: true,
									},
									() => {
										this.searchLP();
										// this.getNetSuanli();
										// this.computedNum();
									}
								);
							}}
						>
							解押
						</div>
					</div>
				</div>
			);
		});

		// 销毁质押
		const xhList = (
			<>
				{this.state.XHList.map((item, index) => {
					return (
						<div
							className="coin-item"
							style={{ backgroundImage: `url(${xhItemBg})` }}
							key={index}
						>
							<div className="item-top">
								<span className="top-center">
									{item.from_currency}/{item.currency}社区
								</span>
								<span className="top-right">
									APY:{item.action_sy} ~ {item.end_sy}
								</span>
							</div>
							<div className="item-center-xh">
								<div className="xh-ite">
									<img className="ite-icon" src={coinImg} alt="" />
									<span className="ite-bot">
										{item.from_currency}/{item.currency}
									</span>
								</div>
								<div className="xh-ite">
									<span className="ite-top">销毁</span>
									<span className="ite-bot">1000USDT</span>
								</div>
								<div className="xh-ite">
									<span className="ite-top">比例值</span>
									<span className="ite-bot">1:{item.proportion}</span>
								</div>
								<div className="xh-ite">
									<span className="ite-top">算力</span>
									<span className="ite-bot">1000</span>
								</div>
							</div>
							<div className="item-bottom item-bottom-xh">
								<div className="btn-item-left">已销毁：100</div>
								<Link
									className="nav-link"
									to={{
										pathname: "/default/xhpage",
										state: { addr: this.props.addr, ...item },
									}}
								>
									<div className="btn-item">销毁</div>
								</Link>
							</div>
						</div>
					);
				})}
			</>
		);
		if (this.props.selectTabType === "XH") {
			return xhList;
		} else {
			return lpList;
		}
	};

	render() {
		return (
			<>
				<div className="tab-box">
					<div
						className={`tab-item ${
							this.props.selectTabType === "XH" ? "tab-active" : ""
						}`}
						onClick={() => {
							this.changeTab("XH");
						}}
					>
						销毁质押
					</div>
					<div
						className={`tab-item ${
							this.props.selectTabType === "LP" ? "tab-active" : ""
						}`}
						onClick={() => {
							this.changeTab("LP");
						}}
					>
						LP质押
					</div>
				</div>
				<Search className="search-box" placeholder="搜索" />
				{this.coinItem()}
				{/* 解押弹窗 */}
				{this.jyBox()}
				{/* 质押弹窗 */}
				{this.zyBox()}
				{/* 质押方案 */}
				{/* {this.zyfaBox()} */}
				{/* 授权弹窗 */}
				{this.anthBox()}
			</>
		);
	}
}

export default withRouter(TabBox);
