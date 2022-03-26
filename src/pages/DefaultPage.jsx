import React, { Component } from "react";
import { Router, Route, Switch, withRouter } from "react-router-dom";
import { NavBar, Toast } from 'antd-mobile'
import "@/css/DefaultPage.scss"

import MyWeb3 from "@/config/abi/MyWeb3";
import BandUp from "@/components/BandUp/index.jsx";

import MyTeam from "@/components/MyTeam/index.jsx";
import AssetsDetail from "@/components/AssetsDetail/index.jsx"
import Invite from "@/components/Invite/index.jsx";
import XHpage from "@/components/XHpage/index.jsx";
import MeLP from "@/components/MeSuanli/MeLP.jsx";
import MeXH from "@/components/MeSuanli/MeXH.jsx";
import NFTpage from "@/components/NFT/index.jsx";
import NFTchouka from "@/components/NFTchouka/index.jsx"
import CardList from "@/components/CardList";
import CardDetail from "@/components/CardDetail";
import NFTgame from "@/components/NFTgame"
import NFTwallet from "@/components/NFTwallet"
import Crystal from "@/components/NFTwallet/crystal"
import HeroPK from "@/components/HeroPK";
import HeroPKNew from "@/components/HeroPKnew";
import Zhiya from "@/components/Zhiya"

import http from "@/config/axios/index.js"





class Myteam extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: "Myteam",
            bdBoxShow: false,
            userAddress:'',
            topName: '',
		};
        // this.history = creatHistory();
	}
    // componentDidMount(){
        
        // this.props.history.listen(route => {
        //     console.log(route)
        // })
        // this.connect();
        // console.log('end')
    // }
    // 连接钱包，并判断是否绑定上级
	connect() {
		let ethereum = window.ethereum;
		if (typeof ethereum !== "undefined" || typeof window.web3 !== "undefined") {
			MyWeb3.init()
				.then((res) => {
					Toast.show({
						content: "连接成功",
					});
					this.setState({ userAddress: window.defaultAccount });
                    // 登录PHP后台
                    this.login()
					// 连接成功，查询是否绑定上级
					MyWeb3.isActive(this.state.userAddress)
						.then((res) => {
							console.log(res);
							// 如果未绑定上级，去绑定上级
							if (!res) {
								this.setState({ bdBoxShow: true });
								window.isActive = false;
							} else {
                                // 如果绑定了上级，去查询动态奖励
                                // this.readStatic()
                                window.isActive = true
                            }
						})
						.catch((err) => {
							console.log(err);
						});
				})
				.catch((err) => {
					Toast.show({
						content: "连接失败",
					});
					this.setState({ userAddress: "" });
				});
		} else {
			alert("You have to install MetaMask !");
		}
	}
     // 登录PHP后台
     login = () => {
        Toast.show({
            icon: 'loading',
            maskClickable: false,
            duration: 0
        })
        const params = {
            address: this.state.userAddress
        }
        http.post('/userLogin', params).then(res => {
            const data = JSON.parse(res)
            // Toast.show({
            //     icon: "success",
            //     content: data.title
            // })
            Toast.clear()
            this.setState({userToken: data.data.token})
            localStorage.setItem('token', data.data.token)
        }).catch(err => {
            console.log(err)
            Toast.show({
                icon: "fail",
                content: "请求失败"
            })
        })
    }
	setTitleText() {
        const type = this.props.location.pathname.replace('/', '') || 'top'
        console.log(type)
        if(type === 'default/addetsdetail') {
            return '资产明细'
        }
        if(type === 'default/team') {
            return '我的社区'
        }
        if(type === 'default/invite') {
            return '邀请好友'
        }
        if(type === 'default/xhpage') {
            return '质押'
        }
        if(type === 'default/me-lp') {
            return '个人质押算力'
        }
        if(type === 'default/me-xh') {
            return '个人销毁算力'
        }
        if(type === 'default/nft') {
            return 'NFT交易'
        }
        if(type === 'default/nft/chouka') {
            return 'NFT人物抽卡'
        }
        if(type === 'default/nft/cardlist') {
            return '我的卡包'
        }
        if(type === 'default/nft/carddetail') {
            return '人物详情'
        }
        if(type === 'default/nft/game') {
            return 'PVE'
        }
        if(type === 'default/nft/nftwallet') {
            return 'HOS'
        }
        if(type === 'default/nft/crystal') {
            return '水晶'
        }
        if(type === 'default/nft/hero_pk') {
            return '战斗'
        }
        
        if(type === 'default/zhiya') {
            return '质押'
        }
    }
    back() {
        console.log("点击了返回按钮")
        // this.history.goBack();
        this.props.history.goBack()
    }
     // 关闭绑定上级弹窗
    hideUpBox = () => {
        this.setState({bdBoxShow: false})
    }
    noneOrFlex = () => {
        const type = this.props.location.pathname.replace('/', '') || 'top'
        if(type === 'default/nft/hero_pk_new') {
            return 'none'
        } else {
            return 'flex'
        }
    }
	render() {
        
		return (
            <>  
                <NavBar onBack={() => {this.back()}} style={{display: `${this.noneOrFlex()}`}}>{this.setTitleText()}</NavBar>
                <Router history={this.props.history}>
                    <Switch>
                        <Route path="/default/team" exact component={MyTeam}></Route>
                        <Route path="/default/addetsdetail" exact component={AssetsDetail}></Route>
                        <Route path="/default/invite" exact component={Invite}></Route>
                        <Route path="/default/xhpage" exact component={XHpage}></Route>
                        <Route path="/default/me-lp" exact component={MeLP}></Route>
                        <Route path="/default/me-xh" exact component={MeXH}></Route>
                        <Route path="/default/nft" exact component={NFTpage}></Route>
                        <Route path="/default/nft/chouka" exact component={NFTchouka}></Route>
                        <Route path="/default/nft/cardlist" exact component={CardList}></Route>
                        <Route path="/default/nft/carddetail" exact component={CardDetail}></Route>
                        <Route path="/default/nft/game" exact component={NFTgame}></Route>
                        <Route path="/default/nft/nftwallet" exact component={NFTwallet}></Route>
                        <Route path="/default/nft/crystal" exact component={Crystal}></Route>
                        <Route path="/default/nft/hero_pk" exact component={HeroPK}></Route>
                        <Route path="/default/nft/hero_pk_new" exact component={HeroPKNew}></Route>
                        <Route path="/default/zhiya" exact component={Zhiya}></Route>
                    </Switch>
                </Router>
                
                {/* <button onClick={() => {this.test()}}>测试发送</button> */}
                {/* 绑定上级弹窗 */}
                <BandUp bdBoxShow={this.state.bdBoxShow} hideBoxShow={ this.hideUpBox } userAddress={ this.state.userAddress } />
            </>
        )
	}
}
export default withRouter(Myteam);