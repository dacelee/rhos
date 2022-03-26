import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import "./index.scss"

import NFTbg from "@/static/image/home/market-bg.png";
import leftImg from "@/static/image/home/market-title.png";
import rightImg from "@/static/image/home/market-title-right.png";
import marketBtn from "@/static/image/home/market-btn.png";
import nav_1 from "@/static/image/home/nft-nav_1.png";
import nav_2 from "@/static/image/home/nft-nav_2.png"
import nav_3 from "@/static/image/home/nft-nav_3.png"
import nav_4 from "@/static/image/home/nft-nav_4.png"
import nft_bg from "@/static/image/chouka/nft-bg.png"

class NFTbox extends Component {
    constructor(props) {
        super(props);
        this.data = {

        }
    }
    render() {
        return (
            <div className="nft-out-box">
                <div className="nft-box" style={{backgroundImage: `url(${NFTbg})`}}>
                    <div className="nft-title">
                        <img src={leftImg} alt="" />
                        <span>交易市场</span>
                        <img src={rightImg} alt="" />
                    </div>
                    <div className="nft-center">
                        <div className="center-box">
                            <span>累计交易额(HOS)</span>
                            <span>3232394.3452</span>
                        </div>
                        <div className="center-box">
                            <span>24h交易额(HOS)</span>
                            <span>3232394.3452</span>
                        </div>
                    </div>
                    <div className="nft-bot">
                        <div className="nft-btn" style={{backgroundImage: `url(${marketBtn})`}}>
                            进入市场
                        </div>
                    </div>
                </div>
                <div className="nft-nav">
					<div
						className="nft-nav-item"
						onClick={() => {
							this.props.history.push("/default/nft/chouka");
						}}
					>
						<div
							className="nft-nav-item-img nav"
							style={{ backgroundImage: `url(${nav_1})` }}
						></div>
						<div className="nft-nav-item-name">NFT抽卡</div>
					</div>
					<div
						className="nft-nav-item"
						onClick={() => {
							this.props.history.push("/default/zhiya");
						}}
					>
						<div
							className="nft-nav-item-img nav"
							style={{ backgroundImage: `url(${nav_2})` }}
						></div>
						<div className="nft-nav-item-name">质押挖矿</div>
					</div>
                    <div
						className="nft-nav-item"
						onClick={() => {
							this.props.history.push("/default/zhiya");
						}}
					>
						<div
							className="nft-nav-item-img nav"
							style={{ backgroundImage: `url(${nav_3})` }}
						></div>
						<div className="nft-nav-item-name">销毁挖矿</div>
					</div>
                    <div
						className="nft-nav-item"
						onClick={() => {
							this.props.history.push("/default/nft/cardlist");
						}}
					>
						<div
							className="nft-nav-item-img nav"
							style={{ backgroundImage: `url(${nav_4})` }}
						></div>
						<div className="nft-nav-item-name">我的卡包</div>
					</div>
				</div>
                <div
					className="nft-game"
					style={{ backgroundImage: `url(${nft_bg})` }}
					onClick={() => {
						this.props.history.push("/default/nft/game");
					}}
				></div>
            </div>
        )
    }
}
export default withRouter(NFTbox)