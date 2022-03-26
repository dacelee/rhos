import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import copy from 'copy-to-clipboard'; 
import { Toast } from "antd-mobile";
import "./index.scss"

import userCenterCard from "@/static/image/home/user-center-card.png";
import copyIcon from "@/static/image/icon/copy.png"
import grsl from "@/static/image/home/grsl.png"
import tdsl from "@/static/image/home/tdsl.png";
import wdsq from "@/static/image/home/wdsq.png";
import hyky from "@/static/image/home/hyky.png";
import ntfjy from "@/static/image/home/ntfjy.png";
import sjbg from "@/static/image/home/sjbg.png";
import yysz from "@/static/image/home/yysz.png";
import yqhy from "@/static/image/home/yqhy.png";
import right from "@/static/image/icon/right.png";




class UserCenter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            navList: [
                {
                    icon: grsl,
                    name: "个人算力",
                    rightNum: this.props.mySuanli,
                    rightIsNum: true,
                    link: "",
                },
                {
                    icon: tdsl,
                    name: "团队算力",
                    rightNum: this.props.teamSuanli,
                    rightIsNum: true,
                    link: "",
                },
                {
                    icon: grsl,
                    name: "质押算力",
                    rightNum: 0,
                    rightIsNum: false,
                    link: "/default/me-lp",
                },
                {
                    icon: tdsl,
                    name: "销毁算力",
                    rightNum: 0,
                    rightIsNum: false,
                    link: "/default/me-xh",
                },
                {
                    icon: grsl,
                    name: "质押",
                    rightNum: 0,
                    rightIsNum: false,
                    link: "/default/zhiya",
                },
                {
                    icon: wdsq,
                    name: "我的社区",
                    rightNum: 8989.0,
                    rightIsNum: false,
                    link: "/default/team",
                },
                {
                    icon: hyky,
                    name: "合约开源",
                    rightNum: 8989.0,
                    rightIsNum: false,
                    link: "",
                },
                {
                    icon: ntfjy,
                    name: "NTF交易",
                    rightNum: 8989.0,
                    rightIsNum: false,
                    link: "/default/nft",
                },
                {
                    icon: sjbg,
                    name: "审计报告",
                    rightNum: 8989.0,
                    rightIsNum: false,
                    link: "",
                },
                {
                    icon: yysz,
                    name: "语言设置",
                    rightNum: 8989.0,
                    rightIsNum: false,
                    link: "",
                },
                {
                    icon: yqhy,
                    name: "邀请好友",
                    rightNum: 8989.0,
                    rightIsNum: false,
                    link: "/default/invite",
                },
		    ]
        }
    }

    // 对传入的参数进行格式验证

	static propTypes = {
		mySuanli: PropTypes.number.isRequired,
		teamSuanli: PropTypes.number.isRequired,
		hasUpUser: PropTypes.bool.isRequired,
        addr: PropTypes.string.isRequired,
	};

    copyAddr() {
        copy(this.props.addr)
        Toast.show({
            icon: 'success',
            content: "复制成功",
        });
    }
    render() {
        return (
            <div className="center-box">
				<div
					className="center-top"
					style={{ backgroundImage: `url(${userCenterCard})` }}
				>
                    { 
                        this.props.addr ? (
                            <>
                                <div className="user-name">{this.props.jiedianLevel || ''}</div>
                                <div className="address-box">
                                    <span>
                                        {this.props.addr}
                                    </span>
                                    <img src={copyIcon} onClick={() => {this.copyAddr()}} alt="" />
                                </div>
                            </>
                        ) : (
                            <div className="address-box">
                                <span>
                                    未连接钱包
                                </span>
                            </div>
                        )
                    }
					<div className="user-status-box">
                    {
                        this.props.hasUpUser ? (
                            <div className="user-status">已激活</div>
                        ) : (
                            <div className="user-status">未激活</div>
                        )
                    }
						
					</div>
				</div>
                <div className="center-nav-box">
                    <>
                        {
                            this.state.navList.map((item, index) => {
                                let template = ''
                                if (item.rightIsNum) {
                                    template = <div className="center-nav" key={index}>
                                        <img className="nav-icon" src={item.icon} alt="" />
                                        <div className="nav-name">{item.name}</div>
                                        <span className="nav-num">{item.rightNum}</span>
                                    </div>
                                } else {
                                    template = <Link className="center-link" to={item.link} key={index}>
                                        <div className="center-nav">
                                            <img className="nav-icon" src={item.icon} alt="" />
                                            <div className="nav-name">{item.name}</div>
                                            <img className="right-icon" src={right} alt="" />
                                        </div>
                                    </Link>
                                }
                                return template;
                            })
                        }
                    </>
                </div>
			</div>
        )
    }
}


export default UserCenter;