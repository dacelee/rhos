import React, { Component } from "react";
import { Empty, Toast, Loading, Image } from "antd-mobile";
import http from "@/config/axios/index.js";
import "./index.scss";
import copyIcon from "@/static/image/icon/copy.png";
import { StarFill } from "antd-mobile-icons";
import copy from "copy-to-clipboard";

import contractAddress from "@/config/abi/contractAddress";
import zhizhuxia from "@/static/image/chouka/zzx.jpg";
import heiguafu from "@/static/image/chouka/hgf.jpg";
import gangtiexia from "@/static/image/chouka/gtx.jpg";
import qiyiboshi from "@/static/image/chouka/qybs.jpg";
import suoer from "@/static/image/chouka/ls.jpg";
import xina from "@/static/image/chouka/xn.jpg";
import card_bg from "@/static/image/chouka/card-bg.png";

export default class index extends Component {
	constructor(props) {
		super(props);
		this.myRef = React.createRef();
		this.state = {
			selectNav: "all",
			isLoading: false,
			details: [],
			noMore: false,
		};
	}

	componentDidMount() {
		this.getData();
	}
	// 获取数据
	getData() {
		if (this.state.noMore) {
			return;
		}
		Toast.show({
			icon: "loading",
			maskClickable: false,
			duration: 0,
		});
		const params = {};
		http
			.post("/hero_list", params)
			.then((res) => {
				const data = JSON.parse(res);
				Toast.clear();
				if (data.data.length > 0) {
					let newData = data.data;
					this.setState({ details: newData });
				} else {
					this.setState({ noMore: true });
				}
			})
			.catch((err) => {
				Toast.show({
					icon: "fail",
					content: "请求失败",
				});
			});
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
			console.log(123123);
		}
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
	// 筛选 R SR SST
	filterSSR = (level) => {
		let str = "";
		switch (level) {
			case 1:
				str = "R";
				break;
			case 2:
				str = "SR";
				break;
			case 3:
				str = "SSR";
				break;
			default:
				str = "";
		}
		return str;
	};
	// 筛选几颗星
	filterStart = (level) => {
		if (level === 1) {
			return (
				<>
					<StarFill fontSize={12} color="#fffb00" />
				</>
			);
		}
		if (level === 2) {
			return (
				<>
					<StarFill fontSize={12} color="#fffb00" />
					<StarFill fontSize={12} color="#fffb00" />
				</>
			);
		}
		if (level === 3) {
			return (
				<>
					<StarFill fontSize={12} color="#fffb00" />
					<StarFill fontSize={12} color="#fffb00" />
					<StarFill fontSize={12} color="#fffb00" />
				</>
			);
		}
	};
	// 筛选图片
	filterImg = (address) => {
		let img = "";
		switch (address) {
			case contractAddress.zhizhuxia:
				img = (
					<>
						<Image className="card-img" src={zhizhuxia} fit="cover" />
						<div className="card-img-name">蜘蛛侠</div>
					</>
				);

				break;
			case contractAddress.heiguafu:
				img = (
					<>
						<Image className="card-img" src={heiguafu} fit="cover" />
						<div className="card-img-name">黑寡妇</div>
					</>
				);
				break;
			case contractAddress.gangtiexia:
				img = (
					<>
						<Image className="card-img" src={gangtiexia} fit="scale-down" />
						<div className="card-img-name">钢铁侠</div>
					</>
				);
				break;
			case contractAddress.qiyiboshi:
				img = (
					<>
						<Image className="card-img" src={qiyiboshi} fit="cover" />
						<div className="card-img-name">奇异博士</div>
					</>
				);
				break;
			case contractAddress.suoer:
				img = (
					<>
						<Image className="card-img" src={suoer} fit="cover" />
						<div className="card-img-name">索尔</div>
					</>
				);
				break;
			case contractAddress.xina:
				img = (
					<>
						<Image className="card-img" src={xina} fit="cover" />
						<div className="card-img-name">希娜</div>
					</>
				);
				break;
			default:
				img = (
					<>
						<Image className="card-img" src={zhizhuxia} fit="cover" />
						<div className="card-img-name">蜘蛛侠</div>
					</>
				);
		}
		return img;
	};
	render() {
		return (
			<>
				<div
					className="assets-page scroll scroll-nobottom"
					ref={this.myRef}
					onScroll={() => {
						this._onScroll();
					}}
				>
					<div className="assets-list">
						{this.state.details.length > 0 ? (
							this.state.details.map((item, index) => {
								return (
									<div
										className="card-box-page"
										key={index}
										onClick={() => {
											this.props.history.push({
                                                pathname: '/default/nft/carddetail',
                                                state: item
                                            })
										}}
									>
										<div 
                                            className="card-img-box"
                                            style={{ backgroundImage: `url(${card_bg})` }}
                                        >
											<div className="card-main-img-box">
                                                {this.filterImg(item.address)}
                                            </div>
										</div>

										<div className="card-detail-box">
											<div className="token-box">
												<span>token</span>
												<span>{this.filterAddress(item.tokenid)}</span>
												<img
													src={copyIcon}
													onClick={() => {
														this.copyAddr(item.tokenid);
													}}
													alt=""
												/>
											</div>
											<div className="pinjie-box">
												<span>品阶</span>
												<span>{this.filterSSR(item.level)}</span>
												{this.filterStart(item.level)}
											</div>
											<div className="detail-box">
												<div className="detail">
													<div className="title">体力</div>
													<div className="num-box tili">{item.physique}</div>
												</div>
												<div className="detail">
													<div className="title">敏捷</div>
													<div className="num-box minjie">{item.agility}</div>
												</div>
												<div className="detail">
													<div className="title">力量</div>
													<div className="num-box liliang">{item.strength}</div>
												</div>
												<div className="detail">
													<div className="title">意志</div>
													<div className="num-box yizhi">{item.volition}</div>
												</div>
												<div className="detail">
													<div className="title">智力</div>
													<div className="num-box zhili">{item.brains}</div>
												</div>
												<div className="detail">
													<div className="title">精神</div>
													<div className="num-box jingshen">{item.charm}</div>
												</div>
											</div>
											<div className="detail-all">
												<div className="all-left">
													{item.type === 1 ? "物理" : "魔法"}
												</div>
												<div className="all-right">
													<span>总属性</span>
													<span>{item.all_attribute}</span>
												</div>
											</div>
										</div>
									</div>
								);
							})
						) : (
							<Empty
								style={{ padding: "20vh 0" }}
								imageStyle={{ width: 118 }}
								description="暂无数据"
							/>
						)}
					</div>
					{this.state.isLoading ? (
						<div className="load">
							<Loading color="#ffffff" />
						</div>
					) : (
						""
					)}
				</div>
			</>
		);
	}
}
