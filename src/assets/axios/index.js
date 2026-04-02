import axios from '../js/base_axios'
// let taskUserId = window.top._P?.data?.navbean?.user?.userid || 1000
// let jsonAxios = baseAxios.jsonAxios
const Qs = require('qs');

export default {
    // 字典列表
    getDictList() {
        return axios.get(`projectbatch/dataDictionary`)
        // return axios.get(`projectbatch/dataDictionary?ztPrjNumber=${projectId}`)
    },
    // 所有项目列表
    getAllProjectList(val) {
        const params = Qs.stringify(val)
        return axios.get(`projectbatch/projectquery?${params}`)
    },
    // 发货批次列表
    getLeftList(val) {
        const params = Qs.stringify(val)
        return axios.get(`projectbatch/deliveryBatchList?${params}`)
    },
    // 新增/编辑发货批次
    updateLeftItem(query) {
        return axios.post(`projectbatch/shippingBatchStorage`, query)
    },
    // 删除发货批次
    deleteLeftItem(query) {
        return axios.post(`projectbatch/deleteBatchByPcid`, query)
    },
    // 所有物料列表
    getAllProjectBatchList(val) {
        // return axios.get(`projectbatch/popUpQueryTableList?proNumber=${proNumber}&ztSbXmfhpch=${ztSbXmfhpch}&pageNum=${page}&pageSize=${size}`)
        const params = Qs.stringify(val)
        return axios.get(`projectbatch/batchMaterialsQuery?${params}`)
    },
    // 批次物料列表
    getProjectList(val) {
        const params = Qs.stringify(val)
        return axios.get(`projectbatch/batchProductListQuery?${params}`)
        // return axios.get(`projectbatch/batchProductsTableList?ztSbXmfhpch=${projectNumber}`)
    },
    // 更新工厂
    updateTheFactory(query) {
        return axios.post(`projectbatch/updateTheFactory`, query)
    },
    // 新增产品
    updatePopUp(query) {
        return axios.post(`projectbatch/updatePopUp`, query)
    },
    // 更新批次物料
    updateProject(query) {
        return axios.post(`projectbatch/updataBatchProduct`, query)
    },
    // 删除批次物料
    deleteProject(query) {
        return axios.post(`projectbatch/delBatchProduct`, query)
    },
    // 获取产品计划列表
    getPlanningList(id) {
        return axios.get(`projectbatch/productPlanningTableList?batchId=${id}`)
    },
    // 获取产品计划gantt数据
    getGanttData1(id) {
        return axios.get(`projectbatch/selectGanttByProj?projId=${id}`)
    },
    getGanttData2(id) {
        return axios.get(`projectbatch/selectGanttBybatchId?batchId=${id}`)
    },
    getGanttData3(id) {
        return axios.get(`projectbatch/selectGanttBybatchMatId?batchMatId=${id}`)
    },
    // 更新产品计划
    updatePlanningList(query) {
        return axios.post(`projectbatch/updataWorkByid`, query)
    },
}