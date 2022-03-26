import React, { Component } from "react";
import { CapsuleTabs, Empty, Loading, Toast } from "antd-mobile";
import { FileWrongOutline } from "antd-mobile-icons";
import copyIcon from "@/static/image/icon/copy.png";
import http from "@/config/axios/index.js";
import copy from "copy-to-clipboard";
import { transShuijing } from "@/config/abi/transStatic.js";
import MyWeb3 from "@/config/abi/MyWeb3";
import BandUp from "@/components/BandUp/index.jsx";

export default class Crystal extends Component {
	constructor(props) {
		super(props);
		this.myRef = React.createRef();
		this.state = {
			activeKey: "全部记录",
			dataList: [],
			page: 1,
			isLoading: false,
			noMore: false,
			dlqNum: 0, // 待领取数量
			addr: "", // 用户地址
			bdBoxShow: false,
		};
	}
	componentDidMount() {
		this.initContract();
	}
	// 初始化合约
	initContract = () => {
		if (window.web3.eth) {
			this.setState({ addr: window.defaultAccount }, () => {
				// 是否绑定上级
				MyWeb3.isActive(this.state.addr)
					.then((res) => {
						console.log(res);
						// 如果未绑定上级，去绑定上级
						if (!res) {
							this.setState({ bdBoxShow: true });
						} else {
							// 获取用户余额
							this.getUserMoney();
							this.getData();
						}
					})
					.catch((err) => {
						console.log(err);
					});
				// 是否授权HOS给质押合约
				// this.searchHOSAuth();
			});
		} else {
			MyWeb3.init()
				.then((res) => {
					this.setState({ addr: window.defaultAccount }, () => {
						// 连接成功，查询是否绑定上级
						MyWeb3.isActive(this.state.addr)
							.then((res) => {
								console.log(res);
								// 如果未绑定上级，去绑定上级
								if (!res) {
									this.setState({ bdBoxShow: true });
								} else {
									// 获取用户余额
									this.getUserMoney();
									this.getData();
								}
							})
							.catch((err) => {
								console.log(err);
							});
						// 是否授权HOS给质押合约
						// this.searchHOSAuth();
					});
				})
				.catch((err) => {
					// ...
				});
		}
	};
	// 获取用户HOS和水晶余额
	getUserMoney = async () => {
		await http
			.post("/user_hero_count", {})
			.then((res) => {
				const data = JSON.parse(res);
				if (data.code === 200) {
					this.setState({
						dlqNum: data.data.crystal,
					});
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};
	// 领取按钮
	sendSJ = () => {
		if (this.state.dlqNum <= 0) {
			Toast.show({
				icon: "fail",
				content: "可领取数量不足",
			});
		} else {
			this.sendGas();
		}
	};
	// 发送gas
	sendGas = () => {
		MyWeb3.sendGas(this.state.addr)
			.then((res) => {
				// 发HOS
				this.sendShuijing();
			})
			.catch((err) => {});
	};
	// 领取水晶
	sendShuijing = () => {
		transShuijing(this.state.addr, this.state.dlqNum)
			.then((res) => {
				console.log(res);
				this.sendHOStoPHP(res.transactionHash);
			})
			.catch((err) => {
				console.log(err);
			});
	};
	// 同步到PHP
	sendHOStoPHP = (hash) => {
		Toast.show({
			icon: "loading",
			maskClickable: false,
			duration: 0,
		});
		const params = {
			count: this.state.dlqNum,
			hash: hash,
		};
		http
			.post("crystal_withdrawal", params)
			.then((res) => {
				const data = JSON.parse(res);
				if (data.code === 200) {
					Toast.show({
						icon: "success",
						content: "领取成功",
					});
				} else {
					Toast.show({
						icon: "fail",
						content: "领取失败",
					});
				}
				this.getUserMoney();
			})
			.catch((err) => {
				Toast.show({
					icon: "fail",
					content: "发送失败",
				});
			});
	};
	_onScroll = () => {
		// 未滚动到底部
		if (
			this.myRef.current.scrollHeight - this.myRef.current.clientHeight >
			this.myRef.current.scrollTop
		) {
			//未到底
		} else {
			//已到底部
			this.getData();
		}
	};
	getData = async () => {
		if (this.state.isLoading) {
			return;
		}
		if (this.state.noMore) {
			return;
		}
		const params = {
			p: this.state.page,
			type: this.state.activeKey,
		};
		this.setState({ isLoading: true });
		await http
			.post("money_list_crystal ", params)
			.then((res) => {
				const data = JSON.parse(res);
				console.log(data);
				if (data.data.length > 0) {
					let newData = this.state.dataList.concat(data.data);
					let newPage = this.state.page + 1;
					this.setState({
						dataList: newData,
						page: newPage,
					});
					if (data.data.length < 10) {
						this.setState({ noMore: true });
					}
				} else {
					this.setState({
						noMore: true,
					});
				}
				this.setState({
					isLoading: false,
				});
			})
			.catch((err) => {
				console.log(err);
			});
	};
	// 复制token
	copyAddr(addr) {
		copy(addr);
		Toast.show({
			icon: "success",
			content: "复制成功",
		});
	}
	// 截取字符串展示地址
	filterAddress = (token) => {
		let leng = token.length - 12;
		let addr = token.toString().split("");
		addr.splice(6, leng, "****");
		let endAddr = addr.join("");
		return endAddr;
	};
	filterData = () => {
		let returnDom;
		if (this.state.dataList.length > 0) {
			returnDom = this.state.dataList.map((item, index) => {
				return (
					<div className="wallet-item" key={index}>
						<div className="wallet-item-title">{item.type}</div>
						{item.price ? (
							<div className="wallet-item-line">
								<span>数量</span>
								<span>{item.price}</span>
							</div>
						) : (
							""
						)}
						{item.real_time ? (
							<div className="wallet-item-line">
								<span>时间</span>
								<span>{item.real_time}</span>
							</div>
						) : (
							""
						)}
                        {item.reward ? (
							<div className="wallet-item-line">
								<span>奖励</span>
								<span>{item.reward}</span>
							</div>
						) : (
							""
						)}
                        {item.scene ? (
							<div className="wallet-item-line">
								<span>场景</span>
								<span>{item.scene}</span>
							</div>
						) : (
							""
						)}
                        {item.status ? (
							<div className="wallet-item-line">
								<span>领取状态</span>
								<span>{item.status}</span>
							</div>
						) : (
							""
						)}
                        {item.time ? (
							<div className="wallet-item-line">
								<span>战斗时间</span>
								<span>{item.time}</span>
							</div>
						) : (
							""
						)}
                        {item.tokenid ? (
							<div className="wallet-item-line">
								<span>Token ID</span>
								<span>{this.filterAddress(item.tokenid)}</span>
							</div>
						) : (
							""
						)}
						{item.hash ? (
							<div className="wallet-item-line-copy">
								<span>哈希</span>
								<span>{this.filterAddress(item.hash)}</span>
								<img
									src={copyIcon}
									alt=""
									onClick={() => {
										this.copyAddr(item.hash);
									}}
								/>
							</div>
						) : (
							<></>
						)}
                        {item.from_uid && item.from_uid !== '无' ? (
							<div className="wallet-item-line">
                                <span>来源</span>
                                <span>{item.from_uid}</span>
                            </div>
						) : (
							<></>
						)}
					</div>
				);
			});
		}
		if (this.state.dataList.length <= 0 && !this.state.isLoading) {
			returnDom = (
				<Empty
					style={{ padding: "20vh 0" }}
					image={
						<FileWrongOutline
							style={{
								color: "#ffffff",
								fontSize: 60,
							}}
						/>
					}
					description="暂无记录"
				/>
			);
		}
		return returnDom;
	};
	// 关闭绑定上级弹窗
	hideUpBox = () => {
		this.setState({ bdBoxShow: false });
	};
	render() {
		return (
			<div className="wallet-page">
				<CapsuleTabs
					defaultActiveKey={this.state.activeKey}
					onChange={(e) => {
						if (this.state.activeKey === e) {
							return;
						}
						this.setState(
							{
								activeKey: e,
								page: 1,
								dataList: [],
								noMore: false,
							},
							() => {
								this.getData();
							}
						);
					}}
				>
					<CapsuleTabs.Tab title="全部记录" key="全部记录" />
					<CapsuleTabs.Tab title="任务奖励" key="任务奖励" />
					<CapsuleTabs.Tab title="推荐奖励" key="推荐奖励" />
				</CapsuleTabs>
				<div className="dailingqu-box">
					<div className="dai-left">
						<span>待领取</span>
						<span>{this.state.dlqNum}</span>
					</div>
					<div
						className="dai-right"
						onClick={() => {
							this.sendSJ();
						}}
					>
						领取
					</div>
				</div>
				<div
					className="wallet-list-box crystal-scroll"
					ref={this.myRef}
					onScroll={() => {
						this._onScroll();
					}}
				>
					{this.filterData()}
					{this.state.isLoading ? (
						<div className="load">
							<Loading color="#ffffff" />
						</div>
					) : (
						""
					)}
					{this.state.noMore && this.state.dataList.length > 0 ? (
						<div className="load">~到底了~</div>
					) : (
						""
					)}
				</div>
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
