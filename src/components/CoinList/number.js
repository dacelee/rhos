/*
 * @Author: your name
 * @Date: 2021-12-15 14:10:02
 * @LastEditTime: 2021-12-15 14:57:15
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /Dapp/RHOS/rhos/src/components/CoinList/number.js
 */
export function toolNumber(num,digits) {
    // 正则匹配小数科学记数法
    if (/^(\d+(?:.\d+)?)(e)([-]?\d+)$/.test(num)) {
        // 正则匹配小数点最末尾的0
        var temp = /^(\d{1,}(?:,\d{3})*\.(?:0*[1-9]+)?)(0*)?$/.exec(num.toFixed(digits));
        if (temp) {
            return temp[1];
        } else {
            return num.toFixed(digits)
        }
    } else {
        return "" + num
    }
}