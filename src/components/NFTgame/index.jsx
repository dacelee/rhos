import React, { Component } from "react";
import "./index.scss";
import BandUp from "@/components/BandUp/index.jsx";
import http from "@/config/axios/index.js";
import MyWeb3 from "@/config/abi/MyWeb3";
import { Mask, Toast, Popover, Dialog } from "antd-mobile";
import { InformationCircleFill } from 'antd-mobile-icons'
import authBg from "@/static/image/home/auth.png";
import okImg from "@/static/image/icon/success.png";
import closeImg from "@/static/image/icon/close.png";
import hosNav from "@/static/image/chouka/hos-nav.png";
import sjNav from "@/static/image/chouka/sj-nav.png";
import sjIcon from "@/static/image/chouka/sj-icon.png";

// 场景背景
import conglin from "@/static/image/chouka/scenes/conglin.png";
import shamo from "@/static/image/chouka/scenes/shamo.png";
import shanhe from "@/static/image/chouka/scenes/shanhe.png";
import shenyu from "@/static/image/chouka/scenes/shenyu.png";
import selectHeroBg from "@/static/image/chouka/select-hero-bg.png";
import selectIcon from "@/static/image/chouka/select-icon.png";

export default class NFTgame extends Component {
	constructor(props) {
		super(props);
		this.state = {
			userHos: 0, // HOS余额
			userCrystal: 0, // 水晶余额
			addr: "", // 用户地址
			authBoxShow: false, // 授权hosMask
			coinAuth: false, // hos是否授权
			bdBoxShow: false, // 绑定上级Mask
			scenes: [], //场景列表
			selectHeroMask: false, //选择英雄的Mask
			selectHero: {}, // 选择好的英雄
			selectScenes: {}, // 选择好的场景
            userSJinNet: 0, // 用户链上水晶数量
		};
	}
	componentDidMount() {
		this.initContract();
	}
	// 初始化质押合约
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
                            // 获取用户链上水晶数量
                            this.getuserSJinNet()
						}
					})
					.catch((err) => {
						console.log(err);
					});
				// 是否授权HOS给质押合约
				this.searchHOSAuth();
				// 获取场景
				this.getScenes();
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
                                    // 获取用户链上水晶数量
                                    this.getuserSJinNet()
								}
							})
							.catch((err) => {
								console.log(err);
							});
						// 是否授权HOS给质押合约
						this.searchHOSAuth();
						// 获取场景
						this.getScenes();
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
    // 获取用户链上水晶数量
    getuserSJinNet = async () => {
        await MyWeb3.getUserSJNum(this.state.addr).then(res => {
            console.log(res)
            this.setState({userSJinNet: res})
        })
    }
	// 获取用户HOS和水晶余额
	getUserMoney = async () => {
		await http
			.post("/user_hero_count", {})
			.then((res) => {
				const data = JSON.parse(res);
				this.setState({
					userHos: data.data.hos,
					userCrystal: data.data.crystal,
				});
			})
			.catch((err) => {
				console.log(err);
			});
	};
	// 获取场景
	getScenes = async () => {
		await http
			.post("/hero_scene", {})
			.then((res) => {
				const data = JSON.parse(res);
				// console.log(data);
				this.setState(
					{
						scenes: data.data,
					},
					() => {
						console.log(this.state.scenes);
					}
				);
			})
			.catch((err) => {
				console.log(err);
			});
	};
    // 判断选择的英雄在该场景是否可用
    searchHeroCanUse = () => {
        if(!this.state.selectHero.hasOwnProperty("id")) {
            Toast.show({
                content: "请选择英雄",
                position: 'top'
            });
            return
        }
        const params = {
            hero_id: this.state.selectHero.id,
            scene_id: this.state.selectScenes.id
        }
        Toast.show({
            icon: "loading",
			maskClickable: false,
			duration: 0,
        })
        http.post("pve_status", params).then(res => {
            const data = JSON.parse(res);
            if(data.code === 200) {
                // 可进入
                Toast.clear()
                const that = this;
                Dialog.confirm({
                    title: "提示",
                    content: "请选择战斗场景",
                    closeOnAction: false,
                    confirmText: '2D',
                    cancelText: "2.5D",
                    onConfirm() {
                        that.props.history.push({
                            pathname: '/default/nft/hero_pk',
                            state: {
                                hero: that.state.selectHero,
                                scenes: that.state.selectScenes
                            }
                        })
                    },
                    onCancel() {
                        that.props.history.push({
                            pathname: '/default/nft/hero_pk_new',
                            state: {
                                hero: that.state.selectHero,
                                scenes: that.state.selectScenes
                            }
                        })
                    }
                })
                
                
            } else {
                Toast.show({
                    icon: "fail",
                    content: data.title
                });
            }
            console.log(data)
        }).catch(err => {
            console.log(err)
            Toast.show({
                icon: "fail",
                content: "验证失败"
            });
        })
    }
	// 关闭绑定上级弹窗
	hideUpBox = () => {
		this.setState({ bdBoxShow: false });
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
	// 区分场景
	filterScenes = () => {
		return this.state.scenes.map((item, index) => {
			let bg;
			if (item.title === "丛林") {
				bg = conglin;
			}
			if (item.title === "沙漠") {
				bg = shamo;
			}
			if (item.title === "山河") {
				bg = shanhe;
			}
			if (item.title === "神域") {
				bg = shenyu;
			}
			return (
				<div
					className="game-scenes"
					style={{ backgroundImage: `url(${bg})` }}
					key={index}
					onClick={() => {
						this.setState({
							selectScenes: item,
							selectHeroMask: true,
						});
					}}
				>
					{/* <div className="scenes-name">{item.title}</div>
					<div className="scenes-btn">开始任务</div> */}
				</div>
			);
		});
	};
    // 截取字符串展示地址
	filterAddress = (token) => {
		let leng = token.length - 12;
		let addr = token.toString().split("");
		addr.splice(6, leng, "****");
		let endAddr = addr.join("");
		return endAddr;
	};
	// 筛选英雄
	filterHero = () => {
		if (
			this.state.selectScenes.hasOwnProperty("hero") &&
			this.state.selectScenes.hero.length > 0
		) {
			return this.state.selectScenes.hero.map((item, index) => {
				return (
					<div
						className="hero-select-item"
						key={index}
						onClick={() => {
							this.setState({
								selectHero: item,
							});
						}}
					>
						{this.state.selectHero.tokenid === item.tokenid ? (
							<div
								className="hero-no-select hero-is-select"
								style={{ backgroundImage: `url(${selectIcon})` }}
							></div>
						) : (
							<div className="hero-no-select"></div>
						)}
						<div className="hero-main-box">
							<span>{item.hero_title}</span>
							<span>{this.filterAddress(item.tokenid)}</span>
						</div>
					</div>
				);
			});
		} else {
			return <div className="no-hero">——没有可用的英雄——</div>;
		}
	};
	render() {
		return (
			<div className="game-page">
				<div className="game-nav">
					<div
						className="game-nav-item"
						onClick={() => {
							this.props.history.push("/default/nft/nftwallet");
						}}
					>
						<div
							className="game-nav-item-img"
							style={{ backgroundImage: `url(${hosNav})` }}
						></div>
						<div className="game-nav-item-num">
							HOS余额：{this.state.userHos}
						</div>
					</div>
					<div
						className="game-nav-item"
						onClick={() => {
							this.props.history.push("/default/nft/crystal");
						}}
					>
						<div
							className="game-nav-item-img"
							style={{ backgroundImage: `url(${sjNav})` }}
						></div>
						<div className="game-nav-item-num">
							水晶余额：{this.state.userCrystal}
						</div>
					</div>
                    <Popover content='链上的余额' mode="dark" placement={'bottomLeft'} trigger='click'>
                        <div className="sj-net">
                            <img className="sj-img" src={sjIcon} alt="" />
                            <span className="sj-num">{this.state.userSJinNet}</span>
                            <InformationCircleFill fontSize={14} color="#F5CE8C"/>
                        </div>
                    </Popover>
                    
				</div>
				{/* 场景列表 */}
				{this.filterScenes()}
				{/* 授权HOS */}
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
				{/* 绑定上级 */}
				<BandUp
					bdBoxShow={this.state.bdBoxShow}
					hideBoxShow={this.hideUpBox}
					userAddress={this.state.addr}
				/>
				{/* 选择英雄 */}
				<Mask
					visible={this.state.selectHeroMask}
					onMaskClick={() =>
						this.setState({ selectHeroMask: false, selectHero: {} })
					}
				>
					<div
						className="auth-mask hero-box"
						style={{ backgroundImage: `url(${selectHeroBg})` }}
					>
						<img
							onClick={() => {
								this.setState({ selectHeroMask: false, selectHero: {} });
							}}
							className="close"
							src={closeImg}
							alt=""
						/>
						<div className="hero-title">选择英雄</div>
						<div className="hero-select">{this.filterHero()}</div>
                        <div className="hero-num">
                            剩余次数：{this.state.selectHero.count ? this.state.selectHero.count : '---'}
                        </div>
						<div className="hero-btn" onClick={() => {
                            this.searchHeroCanUse()
                        }}>
							确定
						</div>
						<div className="hero-tips">需扣除{Number(this.state.selectScenes.price)}HOS</div>
					</div>
				</Mask>
			</div>
		);
	}
}
