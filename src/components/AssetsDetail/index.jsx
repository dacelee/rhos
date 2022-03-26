import React, { Component } from "react";
import { Empty, Toast } from "antd-mobile";
import http from "@/config/axios/index.js"
import "./index.scss";

export default class index extends Component {
	constructor(props) {
		super(props);
        this.myRef = React.createRef();
		this.state = {
			selectNav: "all",
			details: [],
            page: 1,
            noMore: false
		};
	}
	
	componentDidMount() {
		this.getData()
	}

	changeNav(type) {
		if (this.state.selectNav === type) {
			return;
		}
		this.setState({ selectNav: type, page: 1, noMore: false, details: [] });
        this.getData()

	}
    getData() {
        if(this.state.noMore) {
            return
        }
        let type = null
        // 全部
        if(this.state.selectNav === 'all') {
            type = 0
        }
        // 动态
        if(this.state.selectNav === 'static') {
            type = 2
        }
        // 静态
        if(this.state.selectNav === 'dynamic') {
            type = 1
        }
        Toast.show({
            icon: 'loading',
            maskClickable: false,
            duration: 0
        })
        const params = {
            type,
            p: this.state.page
        }
        http.post('/asset_details', params).then(res => {
            const data = JSON.parse(res)
            Toast.show({
                icon: "success",
                content: data.title
            })
            if(data.data.length > 0) {
                let newData = this.state.details.concat(data.data)
                let newPage = this.state.page + 1
                this.setState({details: newData, page: newPage})
            } else {
                this.setState({noMore: true})
            }
        }).catch(err => {
            console.log(err)
            Toast.show({
                icon: "fail",
                content: "请求失败"
            })
        })
    }
    _onScroll = () => {
		// 未滚动到底部
		if (( this.myRef.current.scrollHeight - this.myRef.current.clientHeight ) > this.myRef.current.scrollTop) {
				//未到底
		} else {
			//已到底部
			console.log(123123)
            this.getData()
		}
	};
	render() {
		return (
			<>
				<div className="assets-page">
					<div className="assets-top">
						<div
							onClick={() => {
								this.changeNav("all");
							}}
							className={`nav-default ${
								this.state.selectNav === "all" ? "nav-select" : ""
							}`}
						>
							全部
						</div>
						<div
							onClick={() => {
								this.changeNav("static");
							}}
							className={`nav-default ${
								this.state.selectNav === "static" ? "nav-select" : ""
							}`}
						>
							静态分红
						</div>
						<div
							onClick={() => {
								this.changeNav("dynamic");
							}}
							className={`nav-default ${
								this.state.selectNav === "dynamic" ? "nav-select" : ""
							}`}
						>
							动态分红
						</div>
					</div>
				</div>
				<div className="assets-page scroll" ref={this.myRef} onScroll={() => {this._onScroll()}}>
					<div className="assets-list">
						{this.state.details.length > 0 ? (
							this.state.details.map((item, index) => {
								return (
									<div className="list-item" key={index}>
										<div className="item-line">
											<span className="title">{item.type}</span>
											<span className="num">+{item.price}</span>
										</div>
										<div className="item-line">
											<span className="time">时间</span>
											<span className="time-detail">{item.add_time}</span>
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
						}
					</div>
				</div>
			</>
		);
	}
}
