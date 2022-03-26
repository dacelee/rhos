import React, { Component } from "react";
import { ProgressBar, Toast, Image, Mask } from "antd-mobile";
import "./index.scss";
import http from "@/config/axios/index.js";
import contractAddress from "@/config/abi/contractAddress";

import pkbg from "@/static/image/PK/pk-bg.png";
import blood from "@/static/image/PK/blood.png";
import heroNameBg from "@/static/image/PK/hero-name-box.png";
import vs from "@/static/image/PK/vs.png";

import zhizhuxia from "@/static/image/chouka/zzx.jpg";
import heiguafu from "@/static/image/chouka/hgf.jpg";
import gangtiexia from "@/static/image/chouka/gtx.jpg";
import qiyiboshi from "@/static/image/chouka/qybs.jpg";
import suoer from "@/static/image/chouka/ls.jpg";
import xina from "@/static/image/chouka/xn.jpg";

import wumuhou from "@/static/image/PK/wmh.png";
import anyebilinxing from "@/static/image/PK/ayblx.png";
import chaojuxing from "@/static/image/PK/cjx.png";
import wangrenjiangjun from "@/static/image/PK/wrjj.png";
import successImg from "@/static/image/chouka/success.png"
import failImg from "@/static/image/chouka/fail.png"
import authBg from "@/static/image/home/auth.png";
import btnBg from "@/static/image/chouka/btn-bg.png"
import closeImg from "@/static/image/icon/close.png";

export default class HeroPk extends Component {
	constructor(props) {
		super(props);
		this.state = {
            hero: {},
			heroAttack: false,
			monsterAttack: false,
			pageShow: false,
			heroBloodPercent: 0,
			monsterBloodPercent: 0,
			heroAllBlood: 0,
			monsterAllBlood: 0,
			pkAllMessage: [], // 全部战斗结果
			pkMessage: [], // 逐步添加的战斗结果
			// heroName: "", // 英雄名称
            monsterName: "", // 怪物名称
            monster: {}, // 怪物属性
            PKround: 1500, // 每回合时间
            PKstart: 2000, // 战斗开始的延时
            heroLossBlood: 0, // 英雄掉血
            monsterLossBlood: 0, // 怪物掉血
            randomNum: Math.random(), // 随机怪物
            success: false, // 胜利弹窗
            failed: false, // 失败弹窗
            reward: 0, // 胜利得到的水晶数量
			...this.props.location.state,
		};
	}
	componentDidMount() {
		this.getMsg();
		this.filterName();
		console.log(this.state);
		// setTimeout(() => {
		//     this.setState({
		//         monsterAttack: true
		//     })
		// }, 3000)
	}
    // 保持战斗快报滚动到最下方
    componentDidUpdate(prevProps, prevState, snapshot) {
        this.scrollToBottom();
    }
    // 保持战斗快报滚动到最下方
    scrollToBottom = () => {
        const messagesEndRef = document.getElementById("bottom-div");
        messagesEndRef.scrollIntoView({ behavior: "smooth" });
    };
	getMsg = () => {
		Toast.show({
			icon: "loading",
			maskClickable: false,
			duration: 0,
		});
		const params = {
			hero_id: this.state.hero.id,
			scene_id: this.state.scenes.id,
		};
		http
			.post("/pve", params)
			.then((res) => {
				const data = JSON.parse(res);
				console.log(data.data);
				if (data.code === 200) {
					this.setState(
						{
							pkStatus: data.data.status,
							pageShow: true,
							pkAllMessage: data.data.list,
							heroAllBlood: data.data.hero_blood,
							monsterAllBlood: data.data.monster_blood,
                            monster: data.data.monster,
                            hero: data.data.hero,
                            reward: data.data.reward
						},
						() => {
							Toast.clear();
                            // 延迟N秒 开始战斗
                            setTimeout(() => {
                                this.setPKmsg();
                            }, this.state.PKstart)
							
						}
					);
                    // 延时N秒，将两方的血条加满
					setTimeout(() => {
						this.setState({
							heroBloodPercent: this.state.heroBloodPercent + 100,
							monsterBloodPercent: this.state.monsterBloodPercent + 100,
						});
					}, this.state.PKround);
				} else {
					Toast.show({
						icon: "fail",
						content: "战斗异常",
						maskClickable: false,
					});
				}
			})
			.catch((err) => {
				Toast.show({
					icon: "fail",
					content: "战斗异常",
					maskClickable: false,
				});
			});
	};
	// 逐步添加战斗结果
	setPKmsg = () => {
		let allPKlength = this.state.pkAllMessage.length;
		let nowMsg = [];
		let nowLength = 0;
		let timer = setInterval(() => {
			nowMsg.push(this.state.pkAllMessage[nowLength]);

			// 判断英雄动还是怪物动
			if (this.state.pkAllMessage[nowLength].from === "hero") {
				// 怪物掉血
				let allBlood = this.state.monsterAllBlood;
				let item = this.state.pkAllMessage[nowLength];
				let persent = (item.value / allBlood).toFixed(2) * 100;
                if(item.value === 0) {
                    this.setState({
                        monsterLossBlood: 'Miss~'
                    })
                } else {
                    this.setState({
                        monsterLossBlood: `-${item.value}`
                    })
                }
				this.setState({
					heroAttack: true,
					monsterAttack: false,
					pkMessage: nowMsg,
					monsterBloodPercent: this.state.monsterBloodPercent - persent,
				});
			} else {
				// 英雄掉血
				let allBlood = this.state.heroAllBlood;
				let item = this.state.pkAllMessage[nowLength];
				let persent = (item.value / allBlood).toFixed(2) * 100;
                if(item.value === 0) {
                    this.setState({
                        heroLossBlood: 'Miss~'
                    })
                } else {
                    this.setState({
                        heroLossBlood: `-${item.value}`
                    })
                }
				this.setState({
					heroAttack: false,
					monsterAttack: true,
					pkMessage: nowMsg,
					heroBloodPercent: this.state.heroBloodPercent - persent,
				});
			}
			nowLength++;
			if (nowLength === allPKlength) {
				clearInterval(timer);
				setTimeout(() => {
					if (this.state.pkStatus === 1) {
						// 胜利
						console.log("胜利");
						// 手动清空怪物血条
						this.setState(
							{
								monsterBloodPercent: 0,
                                success: true
							},
							() => {
								// Dialog.alert({
								// 	content: "战斗胜利",
								// 	onConfirm: () => {},
								// });
							}
						);
					} else {
						// 失败
						console.log("失败");
						// 手动清空英雄血条
						this.setState(
							{
								heroBloodPercent: 0,
                                failed: true
							},
							() => {
								// Dialog.alert({
								// 	content: "战斗失败",
								// 	onConfirm: () => {},
								// });
							}
						);
					}
				}, this.state.PKround);
			}
		}, this.state.PKround);
	};
	// 筛选图片和名称DOM
	filterImg = (type) => {
		let img = "";
		let name = "";
		switch (this.state.hero.address) {
			case contractAddress.zhizhuxia:
				img = (
					<div className="hero-box left-hero">
						<Image
							className={`hero-box-other left-hero-other ${
								this.state.heroAttack ? "hero-attack" : ""
							}`}
							src={zhizhuxia}
							fit="contain"
						></Image>
					</div>
				);
				name = <div>蜘蛛侠</div>;
				break;
			case contractAddress.heiguafu:
				img = (
					<div className="hero-box left-hero">
						<Image
							className={`hero-box-other left-hero-other ${
								this.state.heroAttack ? "hero-attack" : ""
							}`}
							src={heiguafu}
							fit="cover"
						></Image>
					</div>
				);
				name = <div>黑寡妇</div>;
				break;
			case contractAddress.gangtiexia:
				img = (
					<div className="hero-box left-hero">
						<Image
							className={`hero-box-other left-hero-other ${
								this.state.heroAttack ? "hero-attack" : ""
							}`}
							src={gangtiexia}
							fit="contain"
						></Image>
					</div>
				);
				name = <div>钢铁侠</div>;
				break;
			case contractAddress.qiyiboshi:
				img = (
					<div className="hero-box left-hero">
						<Image
							className={`hero-box-other left-hero-other ${
								this.state.heroAttack ? "hero-attack" : ""
							}`}
							src={qiyiboshi}
							fit="cover"
						></Image>
					</div>
				);
				name = <div>奇异博士</div>;
				break;
			case contractAddress.suoer:
				img = (
					<div className="hero-box left-hero">
						<Image
							className={`hero-box-other left-hero-other ${
								this.state.heroAttack ? "hero-attack" : ""
							}`}
							src={suoer}
							fit="cover"
						></Image>
					</div>
				);
				name = <div>索尔</div>;
				break;
			case contractAddress.xina:
				img = (
					<div className="hero-box left-hero">
						<Image
							className={`hero-box-other left-hero-other ${
								this.state.heroAttack ? "hero-attack" : ""
							}`}
							src={xina}
							fit="cover"
						></Image>
					</div>
				);
				name = <div>希娜</div>;
				break;
			default:
				img = (
					<div className="hero-box left-hero">
						<Image
							className={`hero-box-other left-hero-other ${
								this.state.heroAttack ? "hero-attack" : ""
							}`}
							src={zhizhuxia}
							fit="contain"
						></Image>
					</div>
				);
				name = <div>蜘蛛侠</div>;
		}
		if (type === "image") {
			return img;
		}
		if (type === "name") {
			return name;
		}
	};
    // 筛选怪物图片和名称
    filterMonsterImg = (type) => {
        let img = "";
		let name = "";
        let monster = "";
        if(this.state.randomNum <= 0.25) {
            monster = "亡刃将军"
        } else if(this.state.randomNum > 0.25 && this.state.randomNum <= 0.5) {
            monster = "暗夜比邻星"
        } else if(this.state.randomNum > 0.5 && this.state.randomNum <= 0.75) {
            monster = "乌木喉"
        } else {
            monster = "超巨星"
        }
		switch (monster) {
			case "亡刃将军":
				img = (
                    <div className="hero-box right-hero ">
						<Image
							className={`
                                hero-box-other
                                right-hero-other
                                ${
                                    this.state.monsterAttack
                                        ? "monster-attack"
                                        : ""
                                }`}
							src={wangrenjiangjun}
							fit="cover"
						></Image>
					</div>
				);
				name = <div>亡刃将军</div>;
				break;
			case "暗夜比邻星":
				img = (
					<div className="hero-box right-hero ">
						<Image
							className={`
                                hero-box-other
                                right-hero-other
                                ${
                                    this.state.monsterAttack
                                        ? "monster-attack"
                                        : ""
                                }`}
							src={anyebilinxing}
							fit="cover"
						></Image>
					</div>
				);
				name = <div>暗夜比邻星</div>;
				break;
			case "乌木喉":
				img = (
					<div className="hero-box right-hero ">
						<Image
							className={`
                                hero-box-other
                                right-hero-other
                                ${
                                    this.state.monsterAttack
                                        ? "monster-attack"
                                        : ""
                                }`}
							src={wumuhou}
							fit="cover"
						></Image>
					</div>
				);
				name = <div>乌木喉</div>;
				break;
			case "超巨星":
				img = (
					<div className="hero-box right-hero ">
						<Image
							className={`
                                hero-box-other
                                right-hero-other
                                ${
                                    this.state.monsterAttack
                                        ? "monster-attack"
                                        : ""
                                }`}
							src={chaojuxing}
							fit="cover"
						></Image>
					</div>
				);
				name = <div>超巨星</div>;
				break;
			default:
				img = (
					<div className="hero-box right-hero ">
						<Image
							className={`
                                hero-box-other
                                right-hero-other
                                ${
                                    this.state.monsterAttack
                                        ? "monster-attack"
                                        : ""
                                }`}
							src={wangrenjiangjun}
							fit="cover"
						></Image>
					</div>
				);
				name = <div>亡刃将军</div>;
		}
		if (type === "image") {
			return img;
		}
		if (type === "name") {
            // this.setState({
            //     monsterName: name
            // })
			return name;
		}
    }
	// 筛选名称
	filterName = () => {
		// let nameText = "";
        let monster = "";
		// switch (this.state.hero.address) {
		// 	case contractAddress.zhizhuxia:
		// 		nameText = "蜘蛛侠";
		// 		break;
		// 	case contractAddress.heiguafu:
        //         console.log(')_)_)_)_)')
		// 		nameText = "黑寡妇";
		// 		break;
		// 	case contractAddress.gangtiexia:
		// 		nameText = "钢铁侠";
		// 		break;
		// 	case contractAddress.qiyiboshi:
		// 		nameText = "奇异博士";
		// 		break;
		// 	case contractAddress.suoer:
		// 		nameText = "索尔";
		// 		break;
		// 	case contractAddress.xina:
		// 		nameText = "希娜";
		// 		break;
		// 	default:
		// 		nameText = "蜘蛛侠";
		// }
        if(this.state.randomNum <= 0.25) {
            monster = "亡刃将军"
        } else if(this.state.randomNum > 0.25 && this.state.randomNum <= 0.5) {
            monster = "暗夜比邻星"
        } else if(this.state.randomNum > 0.5 && this.state.randomNum <= 0.75) {
            monster = "乌木喉"
        } else {
            monster = "超巨星"
        }
		this.setState({ monsterName: monster });
	};
	render() {
		return (
			<div
				className="pk-page"
				style={{ display: `${this.state.pageShow ? "block" : "none"}` }}
			>
				<div className="pk-warp" style={{ backgroundImage: `url(${pkbg})` }}>
					{/* <div className=""> */}
					{this.filterImg("image")}
					{/* </div> */}
					{this.filterMonsterImg("image")}
                    {/* 英雄，怪物掉血提示 */}
                    <div className={`hero-loss ${this.state.monsterAttack?'loss-blood':''}`}>
                        {this.state.heroLossBlood}
                    </div>
                    <div className={`monster-loss ${this.state.heroAttack?'loss-blood':''}`}>
                        {this.state.monsterLossBlood}
                    </div>
                    {/* 英雄怪物血条 */}
					<div className="blood-out-box">
						<div
							className="blood-box"
							style={{ backgroundImage: `url(${blood})` }}
						>
							<ProgressBar
								percent={this.state.heroBloodPercent}
								style={{
									"--track-width": "4px",
									"--track-color": "#171717",
									"--fill-color": "#DA0000",
								}}
							/>
						</div>
						<div
							className="blood-box"
							style={{ backgroundImage: `url(${blood})` }}
						>
							<ProgressBar
								percent={this.state.monsterBloodPercent}
								style={{
									"--track-width": "4px",
									"--track-color": "#171717",
									"--fill-color": "#3693D3",
								}}
							/>
						</div>
					</div>
					<div
						className="hero-name"
						style={{ backgroundImage: `url(${heroNameBg})` }}
					>
						{this.filterImg("name")}
						{this.filterMonsterImg("name")}
					</div>
					<div className="vs" style={{ backgroundImage: `url(${vs})` }}></div>
				</div>
				<div className="pk-shuxing-box">
					<div className="shuxing-item">
						<div className="shuxing-item-line">
							<div className="shuxing-name">体力</div>
							<div className="shuxing-num">{this.state.hero.physique}</div>
						</div>
						<div className="shuxing-item-line">
							<div className="shuxing-name">敏捷</div>
							<div className="shuxing-num ll">{this.state.hero.agility}</div>
						</div>
						<div className="shuxing-item-line">
							<div className="shuxing-name">力量</div>
							<div className="shuxing-num zl">{this.state.hero.strength}</div>
						</div>
						<div className="shuxing-item-line">
							<div className="shuxing-name">意志</div>
							<div className="shuxing-num mj">{this.state.hero.volition}</div>
						</div>
						<div className="shuxing-item-line">
							<div className="shuxing-name">智力</div>
							<div className="shuxing-num yz">{this.state.hero.brains}</div>
						</div>
						<div className="shuxing-item-line">
							<div className="shuxing-name">精神</div>
							<div className="shuxing-num js">{this.state.hero.charm}</div>
						</div>
					</div>
					<div className="shuxing-item">
						<div className="shuxing-item-line">
							<div className="shuxing-name">体力</div>
							<div className="shuxing-num">{this.state.monster.physique}</div>
						</div>
						<div className="shuxing-item-line">
							<div className="shuxing-name">敏捷</div>
							<div className="shuxing-num ll">{this.state.monster.agility}</div>
						</div>
						<div className="shuxing-item-line">
							<div className="shuxing-name">力量</div>
							<div className="shuxing-num zl">{this.state.monster.strength}</div>
						</div>
						<div className="shuxing-item-line">
							<div className="shuxing-name">意志</div>
							<div className="shuxing-num mj">{this.state.monster.volition}</div>
						</div>
						<div className="shuxing-item-line">
							<div className="shuxing-name">智力</div>
							<div className="shuxing-num yz">{this.state.monster.brains}</div>
						</div>
						<div className="shuxing-item-line">
							<div className="shuxing-name">精神</div>
							<div className="shuxing-num js">{this.state.monster.charm}</div>
						</div>
					</div>
				</div>
				<div className="pk-message-box">
					<div className="pk-message">
						<div className="pk-title">战况快报</div>
						{this.state.pkMessage.map((item, index) => {
							if (item.from && item.to) {
								return (
									<div className="pk-msg" key={index}>
                                        <span className="pk-text">第{index + 1}回合:</span>
										<span className="pk-hero">
											{item.from === "hero" ? this.state.hero.hero_title : this.state.monsterName}
										</span>
										<span className="pk-text">进攻了</span>
										<span className="pk-hero">
											{item.to === "hero" ? this.state.hero.hero_title : this.state.monsterName}
										</span>
										<span className="pk-text">造成了</span>
										<span className="pk-number">{item.value}</span>
										<span className="pk-text">点伤害</span>
									</div>
								);
							} else {
								return (
									<div className="pk-msg" key={index}>
										<span className="pk-text">进攻了</span>
									</div>
								);
							}
						})}
                        <div id="bottom-div"></div>
					</div>
				</div>
                {/* 胜利 */}
                <Mask
					visible={this.state.success}
					// onMaskClick={() => this.setState({ success: false })}
				>
                    <div 
                        className="auth-mask success-mask"
						style={{ backgroundImage: `url(${authBg})` }}
                    >
                        <img
							onClick={() => {
								this.setState({ success: false });
							}}
							className="close"
							src={closeImg}
							alt=""
						/>
                        <img className="mask-img" src={successImg} alt="" />
                        <div className="success-num">{Number(this.state.reward)}</div>
                        <div className="success-text">获得水晶</div>
                        <div 
                            className="success-btn" 
                            style={{backgroundImage: `url(${btnBg})`}}
                            onClick={() => {this.setState({success: false},() => {
                                window.location.reload()
                            })}}
                        >
                            继续
                        </div>
                    </div>
                </Mask>
                {/* 失败 */}
                <Mask
					visible={this.state.failed}
					// onMaskClick={() => this.setState({ failed: false })}
				>
                    <div 
                        className="auth-mask success-mask"
						style={{ backgroundImage: `url(${authBg})` }}
                    >
                        <img
							onClick={() => {
								this.setState({ failed: false });
							}}
							className="close"
							src={closeImg}
							alt=""
						/>
                        <img className="mask-img" src={failImg} alt="" />
                        <div className="fail-text">很遗憾，您没能获得最后的胜利！</div>
                        <div 
                            className="success-btn" 
                            style={{backgroundImage: `url(${btnBg})`}}
                            onClick={
                                () => {
                                    this.setState({
                                        failed: false, 
                                    }, () => {
                                        window.location.reload()
                                    })
                                }
                            }
                        >
                            再来一次
                        </div>
                    </div>
                </Mask>
			</div>
		);
	}
}
