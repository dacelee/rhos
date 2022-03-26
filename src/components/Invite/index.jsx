import React, { Component } from "react";
import { Toast } from 'antd-mobile'
import QRCode from "qrcode.react";
import copy from 'copy-to-clipboard'; 
import pageBg from "@/static/image/invite/invite-bg.png";
import centerBg from "@/static/image/invite/invite-center.png";
import logo from "@/static/image/invite/invite-logo.png";
import "./index.scss";

export default class Invite extends Component {
    constructor(props) {
        super(props);
        this.state = {
            url: window.isActive?window.defaultAccount:'未绑定上级'
        }
    }
    copyInvite() {
        copy(this.state.url)
        Toast.show({
            icon: 'success',
            content: "复制成功",
        });
    }
	render() {
		return (
			<div
				className="invite-page"
				style={{ backgroundImage: `url(${pageBg})` }}
			>
				<div
					className="invite-center"
					style={{ backgroundImage: `url(${centerBg})` }}
				>
					<div className="center-box">
						<img className="invite-logo" src={logo} alt="" />
						<div className="invite-url">
							{this.state.url}
						</div>
						<div className="copy-btn" onClick={() => {this.copyInvite()}}>复制链接</div>
						<div className="qrcode">
							{/* <img className="qr" src="" alt="" /> */}
							<QRCode
								value={this.state.url} // value参数为生成二维码的链接
								size={105} // 二维码的宽高尺寸
								fgColor="#000000" // 二维码的颜色
							/>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
