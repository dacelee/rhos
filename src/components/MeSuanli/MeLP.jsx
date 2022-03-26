import React, { Component } from "react";
import "./index.scss";
import { Empty, Toast } from "antd-mobile";
import http from "@/config/axios/index.js";

import coinImg from "@/static/image/home/coin-coin.png";

export default class MeLP extends Component {
	constructor(props) {
		super(props);
		this.myRef = React.createRef();
		this.state = {
			dataList: [],
            del_pledge: 0,
            pledge: 0,
		};
	}

	componentDidMount() {
		this.getList();
	}

	_onScroll = () => {
		// 未滚动到底部
		if (
			this.myRef.current.scrollHeight - this.myRef.current.clientHeight >
			this.myRef.current.scrollTop
		) {
			//未到底
			console.log("wwwwwwwww");
		} else {
			//已到底部
			console.log(123123);
		}
	};

	// 获取列表
	getList = () => {
		const params = {};
		http
			.post("/me_pledge_list", params)
			.then((res) => {
				const data = JSON.parse(res);
				console.log(data);
				this.setState({ 
                    dataList: data.data.list,
                    del_pledge: Number(data.data.del_pledge),
                    pledge: Number(data.data.pledge)
                });
			})
			.catch((err) => {
				console.log(err);
				Toast.show({
					icon: "fail",
					content: "获取失败",
				});
			});
	};

	render() {
		return (
			<div className="page-box">
				<div className="page-top">
					<div className="top-item">
						<div className="item-top">
							<span>个人总算力</span>
						</div>
						<div className="item-bot">{ this.state.pledge }</div>
					</div>
					<div className="topline"></div>
					<div className="top-item">
						<div className="item-top">
							<span>个人销毁</span>
							<span>(HOS)</span>
						</div>
						<div className="item-bot">{ this.state.del_pledge }</div>
					</div>
				</div>
				<div className="page-title">LP质押</div>
				<div
					className="scroll-box"
					ref={this.myRef}
					onScroll={() => {
						this._onScroll();
					}}
				>
					{this.state.dataList.length > 0 ? (
						this.state.dataList.map((item, index) => {
							return (
								<div className="page-item" key={index}>
									<div className="item-title">
										<img src={coinImg} alt="" />
										<span>{ item.title }</span>
									</div>
									<div className="item-line">
										<span>已质押算力</span>
										<span>{ Number(item.pledge) }</span>
									</div>
									<div className="item-line">
										<span>已解押算力</span>
										<span>{ Number(item.out_pledge) }</span>
									</div>
									<div className="item-line">
										<span>质押中算力</span>
										<span>{ Number(item.pledge_now) }</span>
									</div>
									<div className="item-line">
										<span>时间</span>
										<span>{ item.time }</span>
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
			</div>
		);
	}
}
