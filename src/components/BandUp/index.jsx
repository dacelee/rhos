/*
 * @Author: your name
 * @Date: 2021-11-30 09:46:34
 * @LastEditTime: 2021-12-13 09:35:13
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /rhos/src/components/BandUp/index.js
 */
import React, { Component } from 'react'
import { Mask, Input, Toast } from "antd-mobile";
import MyWeb3 from "@/config/abi/MyWeb3";
import { xhBindInit, bindup } from "@/components/XHpage/contract"

import "./index.scss"
import bdBoxBg from "@/static/image/home/bangding-bg.png";
import closeImg from "@/static/image/icon/close.png";
import http from "@/config/axios/index.js"

export default class BandUp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            upAddress: "",
        }
    }

    // 绑定上级地址
    bindUpAddress = () => {
        if (this.state.upAddress.length !== 42) {
            Toast.show({
                icon: "fail",
                content: "地址格式不正确",
            });
            return;
        }
        if (this.state.upAddress === this.props.userAddress) {
            Toast.show({
                icon: "fail",
                content: "不能绑定自己的地址",
            });
            return;
        }
        console.log(this.props.userAddress, this.state.upAddress)
        MyWeb3.bindIntro(this.props.userAddress, this.state.upAddress)
            .then((res) => {
                console.log(res);
                // 实例化销毁合约
                xhBindInit(this.props.userAddress)
                bindup(this.state.upAddress).then(res => {
                    this.bindUpAddressToPHP()
                }).catch(err => {
                    console.log(err)
                })
            })
            .catch((err) => {
                console.log(err);
            });
    }

    // 绑定上级地址到PHP后台
    bindUpAddressToPHP = () => {
        Toast.show({
            icon: 'loading',
            maskClickable: false,
            duration: 0
        })
        const params = {
            mb_address: this.state.upAddress,
            address: this.props.userAddress
        }
        http.post('/bind_parent', params).then(res => {
            const data = JSON.parse(res)
            Toast.show({
                icon: "success",
                content: data.title
            })
            this.props.hideBoxShow()
        }).catch(err => {
            console.log(err)
            Toast.show({
                icon: "fail",
                content: "请求失败"
            })
        })
    }

    render() {
        return (
            <>
                {/* onMaskClick={this.props.hideBoxShow } */}
                <Mask
                    visible={this.props.bdBoxShow}
                    // opacity='thick'
                    opacity={0.8}
                >
                    <div
                        className="up-mask"
                        style={{ backgroundImage: `url(${bdBoxBg})` }}
                    >
                        <div className="mask-title">提示</div>
                        <img
                            onClick={this.props.hideBoxShow}
                            className="close"
                            src={closeImg}
                            alt=""
                        />
                        <div className="up-input-box">
                            <Input
                                clearable
                                className="up-input"
                                onChange={(val) => this.setState({ upAddress: val })}
                                placeholder="请输入邀请地址"
                            />
                        </div>
                        <div className="up-waring">激活操作需链上确认，请勿重复提交</div>
                        <div
                            className="up-btn"
                            onClick={() => {
                                this.bindUpAddress();
                            }}
                        >
                            确定绑定推荐人地址
                        </div>
                    </div>
                </Mask>
            </>
        )
    }
}
