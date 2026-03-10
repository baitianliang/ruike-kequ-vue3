import axios from '../js/base_axios'
let taskUserId = window.top._P?.data?.navbean?.user?.userid || 1000
// let jsonAxios = baseAxios.jsonAxios
// const Qs = require('qs');

export default {
    getTableData(query) {
        return axios.post(`yb/page` , {...query, taskUserId})
    }
}