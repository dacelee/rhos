import React, { Component } from "react";
import "./index.scss";
import { ProgressBar, Toast, Mask } from "antd-mobile";
import { withRouter } from "react-router-dom";
import http from "@/config/axios/index.js";
import { LeftOutline } from "antd-mobile-icons";

import pageBg from "@/static/image/new_pk/1.jpg";
import monsterGif from "@/static/image/new_pk/22.gif";
import monsterPKGif from "@/static/image/new_pk/11.gif";
import hero_1_attack from "@/static/image/new_pk/hero_1_attack.gif";
import hero_2_attack from "@/static/image/new_pk/hero_2_attack.gif";
import hero_1 from "@/static/image/new_pk/hero_1.gif";
import hero_2 from "@/static/image/new_pk/hero_2.gif";
import attack from "@/static/image/new_pk/attack_1.gif";

import fire from "@/static/image/new_pk/1.gif";
import bottomBoxBg from "@/static/image/new_pk/game-info-bg.png";
import bloodBox from "@/static/image/new_pk/blood-strip-bg.png";
import heroBg from "@/static/image/new_pk/hero.jpg";
import successImg from "@/static/image/chouka/success.png";
import failImg from "@/static/image/chouka/fail.png";
import authBg from "@/static/image/home/auth.png";
import btnBg from "@/static/image/chouka/btn-bg.png";
import closeImg from "@/static/image/icon/close.png";

class HeroPKNew extends Component {
	constructor(props) {
		super(props);
		this.state = {
			hero: {},
			isRotate: false,
			pageShow: false,
			pkAllMessage: [], // 全部战斗结果
			pkAllDetail: [], // 全部战斗详细信息
			monster: {}, // 怪物属性]
			PKstart: 2000, // 战斗开始的延时
			heroAllBlood: 0,
			monsterAllBlood: 0,
			monsterBloodPercent: 0, // 怪物血量百分比
			heroBloodPercent: 0, // 英雄血量百分比
			pkStatusType: "wating", // 战斗状态
			PKround: 1500, // 每回合时间
			everyPKmsg: "", // 战斗快报
			reward: 0, // 获得的水晶数量
			success: false,
			failed: false,
			direction: "", // 屏幕方向
			heroRandom: Math.random(),
			...this.props.location.state,
		};
	}
	componentDidMount() {
		this.windowRotate();
		// 监听屏幕旋转
		window.addEventListener("orientationchange", this.windowRotate);

		this.getMsg();
	}
	componentWillUnmount() {
		window.removeEventListener("scorientationchangeroll", this.windowRotate);
	}
	windowRotate = () => {
		let vw = window.orientation;
		// const dom = document.getElementsByTagName("body");
		console.log(vw);
		if (vw === 0) {
			// 竖屏
			this.setState({
				isRotate: true,
				direction: "colum",
			});
			var container = document.getElementsByClassName("container")[0];
			var html = document.getElementsByTagName("html")[0];
			var width = html.clientWidth;
			var height = html.clientHeight;
			var max = width > height ? width : height;
			var min = width > height ? height : width;
			container.style.width = max + "px";
			container.style.height = min + "px";
		} else {
			// 横屏
			this.setState({
				isRotate: false,
				direction: "row",
			});
			// dom[0].style.transform = "rotate(0deg)";
		}
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
							pkAllDetail: data.data.details,
							heroAllBlood: data.data.hero_blood,
							monsterAllBlood: data.data.monster_blood,
							monster: data.data.monster,
							hero: data.data.hero,
							reward: data.data.reward,
							heroBloodPercent: 0,
							monsterBloodPercent: 0,
						},
						() => {
							// 延迟N秒 开始战斗
							// setTimeout(() => {
							this.setPKmsg();
							// }, this.state.PKstart);
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
		let nowLength = 0;
		let goTime = 2000; // 进场延时
		let pkTime = 1000; // PK延时
		let endTime = 4000; // 结束延时

		let timer = setInterval(() => {
			Toast.clear();
			this.setState({
				pkStatusType: "wating",
			});
			setTimeout(() => {
				this.setState({
					everyPKmsg: `第${nowLength + 1}回合`,
				});
				this.setState(
					{
						// 进场
						pkStatusType: "going",
					},
					() => {
						setTimeout(() => {
							this.setState(
								{
									// 开始打架
									pkStatusType: "pking",
								},
								() => {
									// 判断英雄动还是怪物动
									if (this.state.pkAllMessage[nowLength].from === "hero") {
										// 怪物掉血
										let allBlood = this.state.monsterAllBlood;
										let item = this.state.pkAllMessage[nowLength];
										let persent = (item.value / allBlood).toFixed(2) * 100;
										let nowMsg = `${this.state.pkAllMessage[nowLength].from}进攻了${this.state.pkAllMessage[nowLength].to}造成了${this.state.pkAllMessage[nowLength].value}点伤害`;
										setTimeout(() => {
											this.setState({
												pkStatusType: "end",
												monsterBloodPercent:
													this.state.monsterBloodPercent - persent,
												everyPKmsg: nowMsg,
											});
										}, endTime);
									} else {
										// 英雄掉血
										let allBlood = this.state.heroAllBlood;
										let item = this.state.pkAllMessage[nowLength];
										let persent = (item.value / allBlood).toFixed(2) * 100;
										let nowMsg = `${this.state.pkAllMessage[nowLength].from}进攻了${this.state.pkAllMessage[nowLength].to}造成了${this.state.pkAllMessage[nowLength].value}点伤害`;
										setTimeout(() => {
											this.setState({
												pkStatusType: "end",
												heroBloodPercent: this.state.heroBloodPercent - persent,
												everyPKmsg: nowMsg,
											});
										}, endTime);
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
														success: true,
													},
													() => {}
												);
											} else {
												// 失败
												console.log("失败");
												// 手动清空英雄血条
												this.setState(
													{
														heroBloodPercent: 0,
														failed: true,
													},
													() => {}
												);
											}
										}, 4000);
									}
								}
							);
						}, pkTime);
					}
				);
			}, goTime);
		}, goTime + pkTime + endTime);
	};
	filterPKstatus = () => {
		let heroGifStatic = "";
		let heroGifAttack = "";
		let attackGif = "";
		if (this.state.heroRandom >= 0.5) {
			heroGifStatic = hero_1;
			heroGifAttack = hero_1_attack;
			attackGif = fire;
		} else {
			heroGifStatic = hero_2;
			heroGifAttack = hero_2_attack;
			attackGif = attack;
		}
		heroGifStatic = monsterGif;
		heroGifAttack = monsterPKGif;
        attackGif = fire;
		// {/* 站立图片 */}
		if (this.state.pkStatusType === "wating") {
			return (
				<>
					<img src={heroGifStatic} className="people" alt="" />
					<img src={monsterGif} className="people2" alt="" />
				</>
			);
		}
		// 进攻图片
		if (this.state.pkStatusType === "going") {
			return (
				<>
					<img
						src={heroGifStatic}
						className={`people ${
							this.state.direction === "row" ? "hero-go-h" : "hero-go-s"
						}`}
						alt=""
					/>
					<img
						src={monsterGif}
						className={`people2 ${
							this.state.direction === "row" ? "monster-go-h" : "monster-go-s"
						}`}
						alt=""
					/>
				</>
			);
		}
		// {/* 战斗图片 */}
		if (this.state.pkStatusType === "pking") {
			return (
				<>
					<img
						src={heroGifAttack}
						className={`people ${
							this.state.direction === "row" ? "hero-pk-h" : "hero-pk-s"
						}`}
						alt=""
					/>
					<img
						src={monsterPKGif}
						className={`people2 ${
							this.state.direction === "row" ? "monster-pk-h" : "monster-pk-s"
						}`}
						alt=""
					/>
					<img src={attackGif} className="special" alt="" />
				</>
			);
		}
		// {/* 退出战斗 */}
		if (this.state.pkStatusType === "end") {
			return (
				<>
					<img
						src={heroGifStatic}
						className={`people ${
							this.state.direction === "row" ? "hero-back-h" : "hero-back-s"
						}`}
						alt=""
					/>
					<img
						src={monsterGif}
						className={`people2 ${
							this.state.direction === "row"
								? "monster-back-h"
								: "monster-back-s"
						}`}
						alt=""
					/>
				</>
			);
		}
	};
	render() {
		return (
			<div
				style={{
					backgroundImage: `url(${pageBg})`,
					display: `${this.state.pageShow ? "block" : "none"}`,
				}}
				className={`container ${this.state.isRotate ? "container-rotate" : ""}`}
			>
				<div className="goback">
					<LeftOutline
						fontSize={20}
						color="#F5CE8C"
						onClick={() => {
							this.props.history.goBack();
						}}
					/>
				</div>
				{this.filterPKstatus()}
				{/* <div className="play-game-btn">开始战斗</div> */}
				<div
					className="game-info-panel"
					style={{ backgroundImage: `url(${bottomBoxBg})` }}
				>
					<div className="game-info">
						<div className="game-blood">
							<div
								className="game-blood-strip strip-left"
								style={{ backgroundImage: `url(${bloodBox})` }}
							>
								<div className="blood-volume">
									<ProgressBar
										percent={this.state.heroBloodPercent}
										style={{
											"--track-width": "8px",
											"--track-color": "#171717",
											"--fill-color": "#DA0000",
										}}
									/>
								</div>
							</div>
							<div
								className="game-blood-strip strip-right"
								style={{ backgroundImage: `url(${bloodBox})` }}
							>
								<div className="blood-volume">
									<ProgressBar
										percent={this.state.monsterBloodPercent}
										style={{
											"--track-width": "8px",
											"--track-color": "#171717",
											"--fill-color": "#3693D3",
										}}
									/>
								</div>
							</div>
						</div>
						<div className="hero-info">
							<div className="hero-info-item">
								<div className="attribute">
									<div className="attribute-item">
										<div className="attribute-msg">
											<div className="attribute-desc">体力</div>
											<div className="attribute-number color-red">
												{this.state.hero.physique}
											</div>
										</div>
										<div className="attribute-msg">
											<div className="attribute-desc">敏捷</div>
											<div className="attribute-number color-green">
												{this.state.hero.agility}
											</div>
										</div>
									</div>
									<div className="attribute-item">
										<div className="attribute-msg">
											<div className="attribute-desc">力量</div>
											<div className="attribute-number color-blue">
												{this.state.hero.strength}
											</div>
										</div>
										<div className="attribute-msg">
											<div className="attribute-desc">意志</div>
											<div className="attribute-number color-brown">
												{this.state.hero.volition}
											</div>
										</div>
									</div>
									<div className="attribute-item">
										<div className="attribute-msg">
											<div className="attribute-desc">智力</div>
											<div className="attribute-number color-yellow">
												{this.state.hero.brains}
											</div>
										</div>
										<div className="attribute-msg">
											<div className="attribute-desc">精神</div>
											<div className="attribute-number color-purple">
												{this.state.hero.charm}
											</div>
										</div>
									</div>
								</div>
								<div
									className="heroImage"
									style={{ backgroundImage: `url(${heroBg})` }}
								></div>
							</div>
							<div className="Broadcast">{this.state.everyPKmsg}</div>
							<div className="hero-info-item">
								<div
									className="heroImage"
									style={{ backgroundImage: `url(${heroBg})` }}
								></div>
								<div className="attribute">
									<div className="attribute-item">
										<div className="attribute-msg">
											<div className="attribute-desc">体力</div>
											<div className="attribute-number color-red">
												{this.state.monster.physique}
											</div>
										</div>
										<div className="attribute-msg">
											<div className="attribute-desc">敏捷</div>
											<div className="attribute-number color-green">
												{this.state.monster.agility}
											</div>
										</div>
									</div>
									<div className="attribute-item">
										<div className="attribute-msg">
											<div className="attribute-desc">力量</div>
											<div className="attribute-number color-blue">
												{this.state.monster.strength}
											</div>
										</div>
										<div className="attribute-msg">
											<div className="attribute-desc">意志</div>
											<div className="attribute-number color-brown">
												{this.state.monster.volition}
											</div>
										</div>
									</div>
									<div className="attribute-item">
										<div className="attribute-msg">
											<div className="attribute-desc">智力</div>
											<div className="attribute-number color-yellow">
												{this.state.monster.brains}
											</div>
										</div>
										<div className="attribute-msg">
											<div className="attribute-desc">精神</div>
											<div className="attribute-number color-purple">
												{this.state.monster.charm}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				{/* 胜利 */}
				<Mask
					visible={this.state.success}
					// onMaskClick={() => this.setState({ success: false })}
				>
					<div
						className={`auth-mask success-mask ${
							this.state.direction === "row" ? "" : "mask-dir-s"
						}`}
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
							style={{ backgroundImage: `url(${btnBg})` }}
							onClick={() => {
								this.setState({ success: false }, () => {
									// window.location.reload()
									this.getMsg();
								});
							}}
						>
							继续
						</div>
					</div>
				</Mask>
				{/* 失败 */}
				<Mask visible={this.state.failed}>
					<div
						className={`auth-mask success-mask ${
							this.state.direction === "row" ? "" : "mask-dir-s"
						}`}
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
							style={{ backgroundImage: `url(${btnBg})` }}
							onClick={() => {
								this.setState(
									{
										failed: false,
									},
									() => {
										// window.location.reload()
										this.getMsg();
									}
								);
							}}
						>
							再来一次
						</div>
					</div>
				</Mask>
			</div>
		);
	}
}
export default withRouter(HeroPKNew);
