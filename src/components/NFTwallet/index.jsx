import React, { Component } from "react";
import { CapsuleTabs, Empty, Mask, Input, Loading, Toast, Dialog } from "antd-mobile";
import { FileWrongOutline } from "antd-mobile-icons";
import "./index.scss";
import copyIcon from "@/static/image/icon/copy.png";
import authBg from "@/static/image/home/auth.png";
import okImg from "@/static/image/icon/success.png";
import closeImg from "@/static/image/icon/close.png";
import BandUp from "@/components/BandUp/index.jsx";
import http from "@/config/axios/index.js";
import copy from "copy-to-clipboard";
import MyWeb3 from "@/config/abi/MyWeb3";
import contractAddress from "@/config/abi/contractAddress.js"
import {transStatic} from "@/config/abi/transStatic.js"
// import btn_bg from "@/static/image/chouka/btn-bg.png"

export default class NFTwallet extends Component {
	constructor(props) {
		super(props);
		this.myRef = React.createRef();
		this.state = {
			bdBoxShow: false, // 绑定上级Mask
			activeKey: "充值",
			dataList: [],
			authBoxShow: false, // 授权Mask
			coinAuth: false,
			rechargeNum: null, //充值数量
			rechargeMask: false, // 充值Mask
			addr: "", // 用户地址
			page: 1,
			isLoading: false,
            noMore: false,
            userHos: 0, // 用户hos余额
		};
	}
	componentDidMount() {
		this.initContract()

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
							// this.getUserMoney();
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
									// this.getUserMoney();
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
    // 充值
    rechargeHOS = () => {
        if( isNaN(this.state.rechargeNum) || this.state.rechargeNum <= 0) {
            return
        } 
        // console.log(this.state.addr, contractAddress.nftRechargeAddress, this.state.rechargeNum)
        // return
        MyWeb3.transfer(this.state.addr, contractAddress.nftRechargeAddress, this.state.rechargeNum).then(res => {
            console.log(res)
            this.rechargeHOStoPHP(res.transactionHash)
        }).catch(err => {
            console.log(err)
        })
    };
    // 充值成功，提交到PHP
    rechargeHOStoPHP = (hash) => {
        const params = {
            count: this.state.rechargeNum,
            hash: hash
        }
        http.post('/hero_recharge', params).then(res => {
            const data = JSON.parse(res)
            console.log(data)
            Toast.show({
                icon: "success",
                content: "充值成功",
            });
            this.setState({rechargeNum: null, rechargeMask: false})
        }).catch(err => {
            Toast.show({
                icon: "fail",
                content: "充值失败",
            });
            console.log(err)
        })
    }
    // 获取用户HOS和水晶余额
	getUserMoney = async () => {
        Toast.show({
            icon: 'loading',
            maskClickable: false,
            duration: 0
        })
		await http
			.post("/user_hero_count", {})
			.then((res) => {
				const data = JSON.parse(res);
				this.setState({
					userHos: data.data.hos,
					// userCrystal: data.data.crystal,
				},() => {Toast.clear()});
			})
			.catch((err) => {
				console.log(err);
                Toast.show({
                    icon: "fail",
                    content: "查询失败",
                });
			});
	};
    //  点击提取
    tiquHOS = async() => {
        await this.getUserMoney()
        const that = this
        Dialog.confirm({
            title: "提取数量",
            content: `${this.state.userHos}`,
            closeOnAction: true,
            confirmText: '提取',
            onConfirm() {
                if(that.state.userHos <= 0) {
                    Toast.show({
                        icon: "fail",
                        content: "可提取数量不足",
                    });
                } else {
                    that.sendGas()
                }
            }
        })
    }

    // 发送gas
    sendGas = () => {
        MyWeb3.sendGas(this.state.addr).then(res => {
            // 发HOS
            this.sendHOS()
        }).catch(err => {

        })
    }
    // 发送HOS
    sendHOS = () => {
        const HOStoWei = window.web3.utils.toWei(this.state.userHos.toString(), "gwei");
        transStatic(this.state.addr, HOStoWei).then(res => {
            console.log(res)
            this.sendHOStoPHP(res.transactionHash)
        }).catch(err => {
            console.log(err)
        })
    }
    // 同步到PHP
    sendHOStoPHP = (hash) => {
        Toast.show({
            icon: 'loading',
            maskClickable: false,
            duration: 0
        })
        const params = {
            count: this.state.userHos,
            hash: hash
        }
        http.post('hero_withdrawal', params).then(res => {
            const data = JSON.parse(res)
            if(data.code === 200) {
                Toast.show({
                    icon: 'success',
                    content: '同步成功'
                })
            } else {
                Toast.show({
                    icon: 'fail',
                    content: '同步失败'
                })
            }
            this.getUserMoney()
        }).catch(err => {
            Toast.show({
                icon: 'fail',
                content: '发送失败'
            })
        })
    }
	_onScroll = () => {
		// 未滚动到底部
		if (
			this.myRef.current.scrollHeight - this.myRef.current.clientHeight >
			this.myRef.current.scrollTop
		) {
			//未到底
		} else {
			//已到底部
            this.getData()
		}
	};
	getData = async () => {
        if(this.state.isLoading) {
            return
        }
        if(this.state.noMore) {
            return
        }
		const params = {
			p: this.state.page,
			type: this.state.activeKey,
		};
		this.setState({ isLoading: true });
		await http
			.post("money_list_hos", params)
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
                    if(data.data.length < 10) {
                        this.setState({noMore: true})
                    }
				} else {
                    this.setState({
                        noMore: true
                    })
                }
				this.setState({
					isLoading: false,
				});
			})
			.catch((err) => {
				console.log(err);
			});
	};
	// 关闭绑定上级弹窗
	hideUpBox = () => {
		this.setState({ bdBoxShow: false });
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
						<div className="wallet-item-line">
							<span>数量</span>
							<span>{item.price}</span>
						</div>
						<div className="wallet-item-line">
							<span>时间</span>
							<span>{item.real_time}</span>
						</div>
						{item.hash ? (
							<div className="wallet-item-line-copy">
								<span>哈希</span>
								<span>
									{this.filterAddress(
										item.hash
									)}
								</span>
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
	render() {
		return (
			<div className="wallet-page">
				<div className="wallet-address">
					<div className="wallet-address-text">地址</div>
					<div className="wallet-address-num">
						<span>{ contractAddress.nftRechargeAddress }</span>
						<img onClick={() => {
                            this.copyAddr(contractAddress.nftRechargeAddress)
                        }} src={copyIcon} alt="" />
					</div>
					<div className="wallet-btn-box">
						<div className="wallet-btn" onClick={() => {
                            this.setState({
                                rechargeMask: true
                            })
                        }}>充值</div>
						<div className="wallet-btn" onClick={() => {
                            this.tiquHOS()
                        }}>提取</div>
					</div>
				</div>
				<CapsuleTabs
					defaultActiveKey={this.state.activeKey}
					onChange={(e) => {
						console.log(e);
                        if(this.state.activeKey === e) {
                            return
                        }
						this.setState(
                            { 
                                activeKey: e, 
                                page: 1, 
                                dataList: [],
                                noMore: false
                            }, () => {
							this.getData();
						});
					}}
				>
					<CapsuleTabs.Tab title="充值" key="充值" />
					<CapsuleTabs.Tab title="提取" key="提取" />
					<CapsuleTabs.Tab title="收入" key="收入" />
                    <CapsuleTabs.Tab title="支出" key="支出" />
				</CapsuleTabs>
				<div
					className="wallet-list-box wallet-scroll"
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
                    {(this.state.noMore && this.state.dataList.length > 0) ? (
						<div className="load">
							~到底了~
						</div>
					) : (
						""
					)}
				</div>
				{/* HOS授权弹窗 */}
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
							<span className="auth-title">HOS资产</span>
							<img
								className="auth-ok"
								style={{ display: `${this.state.coinAuth ? "block" : "none"}` }}
								src={okImg}
								alt=""
							/>
							<span
								className="auth-no"
								style={{ display: `${this.state.coinAuth ? "none" : "block"}` }}
								onClick={() => {
									// this.authHOS();
								}}
							>
								去授权
							</span>
						</div>
					</div>
				</Mask>
				{/* 充值数量 */}
				<Mask visible={this.state.rechargeMask} opacity={0.8}>
					<div
						className="up-mask"
						style={{ backgroundImage: `url(${authBg})` }}
					>
						<div className="mask-title">提示</div>
						<img
							onClick={() => {
								this.setState({ rechargeMask: false });
							}}
							className="close"
							src={closeImg}
							alt=""
						/>
						<div className="up-input-box">
							<Input
								clearable
								className="up-input"
                                type="number"
								onChange={(val) => this.setState({ rechargeNum: val })}
								placeholder="请输入充值数量"
							/>
						</div>
						<div className="up-waring">充值操作需链上确认，请勿重复提交</div>
						<div
							className="up-btn"
							onClick={() => {
								this.rechargeHOS();
							}}
						>
							充值
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
