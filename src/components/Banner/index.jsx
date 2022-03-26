import React, { Component } from "react";
// import { Link } from "react-router-dom";
// import PropTypes from "prop-types";
import { Swiper, Toast, NoticeBar } from "antd-mobile";
import http from "@/config/axios/index.js";
import "./index.scss";

import noticImg from "@/static/image/home/notic.png";
import moreImg from "@/static/image/icon/right.png";
// import asstesBg from "@/static/image/home/home-center-bg.png";

class Banner extends Component {
	constructor(props) {
		super(props);
		this.state = {
			colors: ["#ace0ff", "#bcffbd", "#e4fabd", "#ffcfac"],
		};
	}
	// 对传入的参数进行格式验证

	// static propTypes = {
	// 	getStaticNum: PropTypes.func.isRequired,
	// 	staticNum: PropTypes.any.isRequired,
	// 	ylqStatic: PropTypes.any.isRequired,
	// 	ylqDynamic: PropTypes.any.isRequired,
	// };

	componentDidMount() {
		this.getBanner();
	}

	// 获取轮播图
	getBanner() {
		http
			.post("/banner", {})
			.then((res) => {
				// console.log(JSON.parse(res))
				const data = JSON.parse(res);
				this.setState({ colors: data.data });
			})
			.catch((err) => {
				console.log(err);
			});
	}

	// 通知父组件领取静态奖励
	// upComponentGetStatic = () => {
	// 	if (this.props.staticNum > 0) {
	// 		this.props.getStaticNum();
	// 	}
	// };

    // 通知父组件领取销毁合约静态奖励
    // upComponentGetXHstatic = () => {
    //     if (this.props.xhStatic > 0) {
	// 		this.props.getXHstaticNum();
	// 	}
    // }

	// 获取hos的usdt价格
	// getUSDT = (num) => {
	// 	if (Number(num) === 0) {
	// 		return 0;
	// 	}
	// 	let num1 = window.web3.utils.toWei(num.toString(), "gwei");
	// 	let usdt = (num1 * this.props.hosToHusd).toString().split(".")[0];
	// 	return window.web3.utils.fromWei(usdt, "gwei");
	// };
	render() {
		return (
			<>
				<Swiper autoplay>
					{this.state.colors.map((img, index) => (
						<Swiper.Item key={index}>
							<div
								className="banner"
								style={{ backgroundImage: `url(${img})` }}
								onClick={() => {
									Toast.show(`你点击了卡片 ${index + 1}`);
								}}
							>
								{/* {index + 1} */}
							</div>
						</Swiper.Item>
					))}
				</Swiper>
				<div className="notic-box">
					<div className="notic-img">
						<img src={noticImg} alt="" />
					</div>
					<NoticeBar
						className="notic-ui"
						icon={""}
						content="默认"
						color="default"
					/>
					<div className="notic-more">
						<span>更多</span>
						<img src={moreImg} alt="" />
					</div>
				</div>
				{/* <div style={{ backgroundImage: `url(${asstesBg})` }} className="assets">
					<div className="assets-top">
						<div className="top-text">资产</div>
						<Link to="/default/addetsdetail" className="top-text nav-link">
							明细 >
						</Link>
					</div>
					{this.props.selectTabType === "XH" ? (
						<>
							<div className="assets-top margin20">
								<div className="center-left">
									<div className="left-top">销毁质押待领取静态收益/HOS</div>
									<div className="left-bottom">
										{this.props.xhStatic}≈ {this.getUSDT(this.props.xhStatic)}{" "}
										U
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
										{this.props.ylqXHstatic}≈ {this.getUSDT(this.props.ylqXHstatic)}{" "}
										U
									</div>
								</div>
								<div className="center-left flex-p">
									<div className="left-top">已领取动态收益/HOS</div>
									<div className="left-bottom">
										{this.props.ylqXHdynamic}≈{" "}
										{this.getUSDT(this.props.ylqXHdynamic)} U
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
										{this.props.staticNum}≈ {this.getUSDT(this.props.staticNum)}{" "}
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
										{this.props.ylqStatic}≈ {this.getUSDT(this.props.ylqStatic)}{" "}
										U
									</div>
								</div>
								<div className="center-left flex-p">
									<div className="left-top">已领取动态收益/HOS</div>
									<div className="left-bottom">
										{this.props.ylqDynamic}≈{" "}
										{this.getUSDT(this.props.ylqDynamic)} U
									</div>
								</div>
							</div>
						</>
					)}
				</div> */}
			</>
		);
	}
}

export default Banner;
