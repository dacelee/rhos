<!--
 * @Author: your name
 * @Date: 2021-11-19 14:25:51
 * @LastEditTime: 2021-12-17 09:33:16
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /RHOS/rhos/README.md
-->
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

### axios配置：https://blog.csdn.net/weixin_43609391/article/details/114941651




## 跨域插件
# yarn add http-proxy-middleware --save
# 教程：
    https://blog.csdn.net/jason_renyu/article/details/104640965?spm=1001.2101.3001.6650.1&utm_medium=distribute.pc_relevant.none-task-blog-2%7Edefault%7ECTRLIST%7Edefault-1.no_search_link&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7ECTRLIST%7Edefault-1.no_search_link
# axios设置：
    let url;
    url= "http://hos.pulianhong.com/api";
    // 开发环境
    if (process.env.NODE_ENV === 'development') {
        url = 'http://localhost:3000/api';
    }
    axios.defaults.baseURL = url