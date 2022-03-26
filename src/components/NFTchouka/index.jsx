import React, { Component } from "react";
import "./index.scss";
import BandUp from "@/components/BandUp/index.jsx";
import http from "@/config/axios/index.js";
import MyWeb3 from "@/config/abi/MyWeb3";
import { createHairpin } from "@/config/abi/transStatic.js";
import contractAddress from "@/config/abi/contractAddress";

import authBg from "@/static/image/home/auth.png";
import okImg from "@/static/image/icon/success.png";

import { Mask, Toast, Image } from "antd-mobile";
import bdBoxBg from "@/static/image/home/bangding-bg.png";
import closeImg from "@/static/image/icon/close.png";
// import frontImg from "@/static/image/chouka/front.png";

import zhizhuxia from "@/static/image/chouka/zzx.jpg"
import heiguafu from "@/static/image/chouka/hgf.jpg"
import gangtiexia from "@/static/image/chouka/gtx.jpg"
import qiyiboshi from "@/static/image/chouka/qybs.jpg"
import suoer from "@/static/image/chouka/ls.jpg"
import xina from "@/static/image/chouka/xn.jpg"
import bg from "@/static/image/chouka/ck-bg.png"
import sbg from "@/static/image/chouka/box-bg.png"
import btn_bg from "@/static/image/chouka/btn-bg.png"

import ck_xina from "@/static/image/chouka/ck-xina.jpg"
import ck_suoer from "@/static/image/chouka/ck-suoer.jpg"

export default class NFTchouka extends Component {
	constructor(props) {
		super(props);
		this.state = {
			bdBoxShow: false,
			selectNav: "HOS",
			maskShow: false,
			choukaLoading: false, // 抽卡过程中的Mask
			coinAuth: false, // HOS是否授权
			authBoxShow: false, // 授权HOS是否显示
			// 将路由传参复制到state方便管理
			// ...this.props.location.state,
			addr: "",
			orderId: "",
			nftName: "", // nft卡片名称
			nftSSR: "", // NFT卡片品质
			orderHash: "", // 发送0.005那笔交易的hash
			choukaSuccess: false, // 抽卡成功，弹出卡片
            nftAddress: '', // nft卡片地址
		};
	}
	componentDidMount() {
		// this.searchHOSAuth()
		this.initZYcontract();
	}
	// 初始化质押合约
	initZYcontract = () => {
		if (window.web3.eth) {
			this.setState({ addr: window.defaultAccount }, () => {
				// 是否绑定上级
				MyWeb3.isActive(this.state.addr)
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
				// 是否授权HOS给质押合约
				this.searchHOSAuth();
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
								}
							})
							.catch((err) => {
								console.log(err);
							});
						// 是否授权HOS给质押合约
						this.searchHOSAuth();
					});
				})
				.catch((err) => {
					// ...
				});
		}
	};
	// 查询HOS币种是否已授权
	searchHOSAuth = async () => {
		Toast.show({
			icon: "loading",
			maskClickable: false,
			duration: 0,
		});
		await http
			.post("/user_authorization", { title: "NFTHOS" })
			.then((res) => {
				console.log(this.state.currency);
				const data = JSON.parse(res);
				if (data.title === "未授权") {
					this.setState({ coinAuth: false });
				} else {
					this.setState({ coinAuth: true });
				}
				// this.getAuthUSDT()
			})
			.catch((err) => {
				console.log(err);
			});
		if (!this.state.coinAuth) {
			this.setState({ authBoxShow: true });
		}
		Toast.clear();
	};
	// HOS授权
	authHOS = () => {
		MyWeb3.authZYuseHOS(this.state.addr, 2)
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
		const titleName = "NFTHOS";
		http
			.post("/authorization", { title: titleName })
			.then((res) => {
				Toast.show({
					icon: "success",
					content: "同步成功",
				});
				this.setState({ coinAuth: true });
			})
			.catch((err) => {
				Toast.show({
					icon: "fail",
					content: "同步失败",
				});
			});
	};
	// 是否能抽卡
	isCanChouKa = () => {
		Toast.show({
			icon: "loading",
			maskClickable: false,
			duration: 0,
		});
		http
			.post("/hero_status", {})
			.then((res) => {
				console.log(res);
				const data = JSON.parse(res);
				if (data.code === 200) {
					this.setState(
						{
							orderId: data.title,
						},
						() => {
							Toast.clear();
							this.sendFei();
						}
					);
				} else {
					Toast.show({
						icon: "fail",
						content: data.title,
					});
				}
			})
			.catch((err) => {
				Toast.show({
					icon: "fail",
					content: "查询失败",
				});
			});
	};
	// 发送0.005BNB和100HOS
	sendFei = () => {
		// 开启监听事件
		this.listenCreate();
		MyWeb3.sendFeiForNFT(this.state.addr, this.state.orderId)
			.then((res) => {
				console.log(res);
				this.setState(
					{
						maskShow: false,
						choukaLoading: true,
						orderHash: res.transactionHash,
					},
					() => {
						Toast.clear();
						this.chouka();
					}
				);
			})
			.catch((err) => {
				console.log(err);
			});
	};
	// 开始使用私钥抽卡
	chouka = () => {
		createHairpin(this.state.addr, this.state.orderId)
			.then((res) => {
				console.log(res);
			})
			.catch((err) => {
				console.log(err);
				this.setState({ choukaLoading: false });
			});
	};
	// 监听事件
	listenCreate = () => {
		MyWeb3.listenerNewPlayer().then((res) => {
			console.log(res);
			this.filterNftName(res.returnValues.nft);
			const params = {
				order_sn: this.state.orderId,
				address: res.returnValues.nft,
				hero_title: this.state.nftName,
				tokenid: res.returnValues.tokenId,
				strength: res.returnValues.nftdata[0],
				agility: res.returnValues.nftdata[1],
				physique: res.returnValues.nftdata[2],
				volition: res.returnValues.nftdata[3],
				brains: res.returnValues.nftdata[4],
				charm: res.returnValues.nftdata[5],
				level: res.returnValues.nftdata[6] + this.state.nftSSR,
				hero_value: 100,
				hash: res.transactionHash,
				bnb: 0.005,
				order_hash: this.state.orderHash,
			};
            this.setState({nftAddress: res.returnValues.nft})
			this.sendFeiSuccessToPHP(params);
		});
	};
	// 抽卡成功后通知PHP
	sendFeiSuccessToPHP = (params) => {
		http
			.post("/hero_draw_card", params)
			.then((res) => {
				const data = JSON.parse(res);
				console.log(data);
				this.setState({ choukaLoading: false, choukaSuccess: true });
			})
			.catch((err) => {
				console.log(err);
			});
	};
	// 筛选抽的是哪张卡片
	filterNftName = (nftAddr) => {
		switch (nftAddr) {
			case contractAddress.zhizhuxia:
				this.setState({ nftName: "zhizhuxia", nftSSR: "R" });
				break;
			case contractAddress.heiguafu:
				this.setState({ nftName: "heiguafu", nftSSR: "R" });
				break;
			case contractAddress.gangtiexia:
				this.setState({ nftName: "gangtiexia", nftSSR: "SR" });
				break;
			case contractAddress.qiyiboshi:
				this.setState({ nftName: "qiyiboshi", nftSSR: "SR" });
				break;
			case contractAddress.suoer:
				this.setState({ nftName: "suoer", nftSSR: "SSR" });
				break;
			case contractAddress.xina:
				this.setState({ nftName: "xina", nftSSR: "SSR" });
				break;
			default:
				this.setState({ nftName: "", nftSSR: "" });
		}
	};
    // 筛选抽取成功的对应图片
    filterImg = () => {
        let img = ''
        switch (this.state.nftAddress) {
			case contractAddress.zhizhuxia:
				img = <Image className="front" src={zhizhuxia} fit="cover" />
				break;
			case contractAddress.heiguafu:
				img = <Image className="front" src={heiguafu} fit="cover" />
				break;
			case contractAddress.gangtiexia:
				img = <Image className="front" src={gangtiexia} fit="scale-down" />
				break;
			case contractAddress.qiyiboshi:
				img = <Image className="front" src={qiyiboshi} fit="cover" />
				break;
			case contractAddress.suoer:
				img = <Image className="front" src={suoer} fit="cover" />
				break;
			case contractAddress.xina:
				img = <Image className="front" src={xina} fit="cover" />
				break;
			default:
				img = <Image className="front" src={zhizhuxia} fit="cover" />
        }
        return img;
    }
	// 关闭绑定上级弹窗
	hideUpBox = () => {
		this.setState({ bdBoxShow: false });
	};
	render() {
		return (
			<div className="chouka-page">
				<div className="chouka-nav-box" style={{display: 'none'}}>
					<div
						className={`chouka-nav ${
							this.state.selectNav === "HOS" ? "chouka-nav-select" : ""
						}`}
						onClick={() => {
							this.setState({ selectNav: "HOS" });
						}}
					>
						HOS抽卡
					</div>
					<div
						className={`chouka-nav ${
							this.state.selectNav === "nengliang" ? "chouka-nav-select" : ""
						}`}
						onClick={() => {
                            Toast.show({
                                content: '敬请期待',
                            });
							// this.setState({ selectNav: "nengliang" });
						}}
					>
						能量石抽卡
					</div>
				</div>
				<div className="chouka-main">
					<div className="chouka-bg" style={{ backgroundImage: `url(${bg})` }}>
						<div className="main-img" style={{ backgroundImage: `url(${sbg})` }}></div>
						<div
							className="main-btn"
                            style={{ backgroundImage: `url(${btn_bg})` }}
							onClick={() => {
								this.setState({ maskShow: true });
							}}
						>
							HOS抽卡
						</div>
					</div>
				</div>
				<Mask visible={this.state.maskShow} opacity={0.8}>
					<div
						className="up-mask chouka-mask"
						style={{ backgroundImage: `url(${bdBoxBg})` }}
					>
						<div className="mask-title">提示</div>
						<img
							onClick={() => {
								this.setState({ maskShow: false });
							}}
							className="close"
							src={closeImg}
							alt=""
						/>

						<div className="up-waring">需要消耗100HOS</div>
						<div
							className="up-btn"
							onClick={() => {
								// this.sendCharge();
								this.isCanChouKa();
							}}
						>
							确定
						</div>
					</div>
				</Mask>
				<Mask visible={this.state.choukaLoading} opacity={0.8}>
					<div className="card-box">
						<div className="container">
							<div className="flip">
								<img className="front" src={ck_xina} alt="" />
								<img className="back" src={ck_suoer} alt="" />
							</div>
						</div>
					</div>
				</Mask>
				{/* 抽卡成功后的卡片 */}
				<Mask
					visible={this.state.choukaSuccess}
					opacity={0.8}
					onMaskClick={() => {
						this.setState({ choukaSuccess: false });
					}}
				>
					<div className="card-box">
						<div className="container_su">
							<div className="flip_su">
                                {
                                    this.filterImg()
                                }
								{/* <img className="front" src={gangtiexia} alt="" /> */}
								{/* <img className="back" src={frontImg} alt="" /> */}
							</div>
						</div>
					</div>
				</Mask>
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
									this.authHOS();
								}}
							>
								去授权
							</span>
						</div>
					</div>
				</Mask>
				<BandUp
					bdBoxShow={this.state.bdBoxShow}
					hideBoxShow={this.hideUpBox}
					userAddress={this.state.addr}
				/>
			</div>
		);
	}
}
