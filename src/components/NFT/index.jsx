/*
 * @Author: your name
 * @Date: 2021-12-29 10:54:56
 * @LastEditTime: 2022-01-19 11:09:40
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /rhos/src/components/NFT/index.js
 */
import React, { Component } from "react";
import "./index.scss";
import { Toast } from "antd-mobile";
// import ctx from "@/config/context.js"

import nft_bg from "@/static/image/chouka/nft-bg.png";
import nft_bg_2 from "@/static/image/chouka/nft-bg-2.png";
import nav_1 from "@/static/image/chouka/nav_1.png";
import nav_2 from "@/static/image/chouka/nav_2.png";

export default class NFTpage extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}
	// 上下文
	// static contextType = ctx
	componentDidMount() {
		// console.log(this.context)
		// console.log(this.props.location.state);
	}
	render() {
		return (
			<div className="nft-page">
				<div
					className="nft-game"
					style={{ backgroundImage: `url(${nft_bg})` }}
					onClick={() => {
						this.props.history.push("/default/nft/game");
					}}
				></div>
				<div className="nft-nav">
					<div
						className="nft-nav-item"
						onClick={() => {
							this.props.history.push("/default/nft/chouka");
						}}
					>
						<div
							className="nft-nav-item-img nav-1"
							style={{ backgroundImage: `url(${nav_1})` }}
						></div>
						<div className="nft-nav-item-name">NFT抽卡</div>
					</div>
					<div
						className="nft-nav-item"
						onClick={() => {
							this.props.history.push("/default/nft/cardlist");
						}}
					>
						<div
							className="nft-nav-item-img nav-2"
							style={{ backgroundImage: `url(${nav_2})` }}
						></div>
						<div className="nft-nav-item-name">我的卡包</div>
					</div>
				</div>
				<div
					className="nft-game"
					style={{ backgroundImage: `url(${nft_bg_2})` }}
                    onClick={() => {
                        Toast.show({
                            content: '敬请期待',
                        });
                    }}
				></div>
			</div>
		);
	}
}
