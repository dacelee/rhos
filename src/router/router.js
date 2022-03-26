/*
 * @Author: your name
 * @Date: 2021-11-19 16:51:42
 * @LastEditTime: 2021-12-02 16:37:20
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /RHOS/rhos/src/routes/router.js
 */
import App from '@/App.jsx';
import Home from '@/pages/Home.jsx';
// import Myteam from "@/pages/Myteam.jsx"

export const routes = [
    {
        path: "/",
        component: App,
        routes: [
            {
                path: "/home",
                component: Home
            },
            // {
            //     path: "/myteam",
            //     component: Myteam
            // }
        ]
    }
];