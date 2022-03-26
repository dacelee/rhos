import React, { Component } from "react";
import { Empty, Toast } from "antd-mobile";
import http from "@/config/axios/index.js";
import BigNumber from "bignumber.js";
import { transStatic } from "@/config/abi/transStatic.js"
import MyWeb3 from "@/config/abi/MyWeb3";
import "./index.scss";

export default class index extends Component {
	constructor(props) {
		super(props);
		this.state = {
			teamList: [],
            mySuanli: 0, // 我的推广算力
            dlyDynamic: 0, // 待领取动态收益 
            userAddress: window.defaultAccount
		};
        
	}

    componentDidMount() {
        this.search()
    }
    componentWillUnmount() {
        clearInterval(this.state.timer)
    }
    // 轮询
    search = () => {
        this.getLingqu()
        this.getTeamList()
        this.setState({timer: setInterval(() => {
            this.getLingqu()
            this.getTeamList()
        }, 5000)})
    }
    //发送GAS费
    sendGas = () => {
        if(Number(this.state.dlyDynamic) <= 0) {
            return
        }
        MyWeb3.sendGas(this.state.userAddress).then(res => {
            this.getDynamic()
        })
    }

    // 领取动态奖励
    getDynamic() {
        let oldNum = new BigNumber(this.state.dlyDynamic);
        let num = oldNum.multipliedBy(1000000000).toNumber();
        transStatic(this.state.userAddress, num).then(res => {
            console.log(res)
            this.sendGettedDymicToPHP()
        }).catch(err => {
            console.log(err)
        })
    }

    // 领取完动态奖励，同步到PHP
    sendGettedDymicToPHP() {
        Toast.show({
            icon: 'loading',
            maskClickable: false,
            duration: 0
        })
        http.post('/dynamic_receive', {}).then(res => {
            Toast.show({
                icon: "success",
                content: "同步成功",
            });
            this.getLingqu()
        }).catch(err => {
            Toast.show({
                icon: "fail",
                content: "同步失败",
            });
        })
    }

    // 读取已领取收益
	getLingqu = () => {
		http
			.post("/assets", {})
			.then((res) => {
				const data = JSON.parse(res);
				this.setState({
                    mySuanli: Number(data.data.me_personal),
                    dlyDynamic: Number(data.data.team_price)
				});
			})
			.catch((err) => {
				Toast.show({
					icon: "fail",
					content: "读取收益失败",
				});
			});
	};
    getTeamList = () => {
        http
			.post("/team_list", {})
			.then((res) => {
				const data = JSON.parse(res);
				this.setState({teamList: data.data})
			})
			.catch((err) => {
				Toast.show({
					icon: "fail",
					content: "读取收益失败",
				});
			});
    }
	render() {
		return (
			<div className="my-team">
				<div className="suanli">
					<span>我的推广算力</span>
					<span>{ this.state.mySuanli }</span>
				</div>
				<div className="dailingqu">
					<div className="dailingqu-left">
						<span>待领取动态收益</span>
						<span>{ this.state.dlyDynamic }</span>
					</div>
					<div className="dailingqu-btn" onClick={() => {
                        this.sendGas()
                    }}>领取</div>
				</div>
				<div className="team-list">
					<div className="list-title">
						<span>直推用户</span>
						<span>团队质押本金算力</span>
					</div>
					{this.state.teamList.length > 0 ? (
						this.state.teamList.map((item, index) => {
							return (
								<div className="list-line" key={index}>
									<span>{item.address}</span>
									<span>{item.team_personal}</span>
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
