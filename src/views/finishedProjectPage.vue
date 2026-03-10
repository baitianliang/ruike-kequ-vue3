<template>
    <div id="finishedProject">
        <el-card class="searchForm" body-style="height: calc(100% - 40px)">
            <el-form :inline="true" :model="searchForm" class="demo-form-inline">
                <el-form-item label="任务名称:">
                    <el-input v-model="searchForm.title" placeholder="请输入任务名称" clearable />
                </el-form-item>
                <el-form-item label="项目名称:">
                    <el-input v-model="searchForm.shellname" placeholder="请输入项目名称" clearable />
                </el-form-item>
                <el-form-item label="创建人:">
                    <el-input v-model="searchForm.username" placeholder="请输入创建人" clearable />
                </el-form-item>
                <el-form-item label="流程状态:">
                    <el-select v-model="searchForm.processStatus" placeholder="请选择流程状态" clearable style="width: 200px">
                        <el-option label="进行中" value="进行中"></el-option>
                        <el-option label="已完成" value="已完成"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onSubmit">查询</el-button>
                </el-form-item>
            </el-form>
        </el-card>
        <el-card class="tableCard" body-style="height: calc(100% - 40px)">
            <el-table
                :data="tableData"
                v-loading="loading"
                show-overflow-tooltip
                border
                style="width: 100%"
                height="calc(100% - 50px)"
                row-key="id"
                lazy>
                <template #empty>
                    <div class="flex items-center justify-center h-100%">
                    <el-empty description="暂无数据！" />
                    </div>
                </template>
                <el-table-column
                    v-for="(item, index) in tableColumn"
                    :key="index"
                    :prop="item.prop"
                    :label="item.label">
                        <template v-if="item.prop === 'RECORD_NO'" #default="scope">
                            <div>{{ scope.row.field_name }}</div>
                            <el-button
                                type="primary"
                                link
                                @click="goRouter(scope.row.URL)">{{ scope.row.RECORD_NO }}</el-button>
                        </template>
                </el-table-column>
            </el-table>
            <div class="table-pagination">
                <el-pagination
                    v-model:current-page="searchForm.pageNum"
                    v-model:page-size="searchForm.pageSize"
                    :page-sizes="[20, 50, 100]"
                    background
                    layout="sizes, prev, pager, next"
                    :total="searchForm.total"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                />
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import axios from "../assets/axios/finishedProjectPage.js";

let searchForm = ref({
    pageNum: 1,
    pageSize: 20,
    total: 0,
    title: "",
    shellname: "",
    username: "",
    processStatus: "",
});
let tableData = ref([]);
let loading = ref(false);
let tableColumn = [
    {prop: "BPNAME", label: "功能名称"},
    {prop: "SHELLNUMBER", label: "项目编号"},
    {prop: "SHELLNAME", label: "项目名称"},
    {prop: "RECORD_NO", label: "记录编号"},
    {prop: "USERNAME", label: "创建人"},
    {prop: "PROCESS_STATUS", label: "流程状态"},
    {prop: "TITLE", label: "任务名称"},
    {prop: "START_DATE", label: "开始时间"},
    {prop: "END_DATE", label: "完成时间"},
];
onMounted(() => {
    getTableData();
});

const onSubmit = () => {
    searchForm.value.pageNum = 1
    query = searchForm.value
    getTableData();
}
let query = searchForm.value
const getTableData = async () => {
    loading.value = true
    let res = await axios.getTableData(query)
    tableData.value = res.data.data.records
    // tableData.value.forEach(el => {
    //     el.START_DATE = `${el.START_DATE.substr(0, 10)} ${el.START_DATE.substr(11, 8)}`
    //     el.END_DATE = `${el.END_DATE.substr(0, 10)} ${el.END_DATE.substr(11, 8)}`
    // })
    searchForm.value.total = res.data.data.total
    loading.value = false
}
const goRouter = (url) => {
    window.open(`${url}${window.top.location.href.split('=')[1]}t0`, "", "resizable=no,status=no,menubar=no,left=" + (screen.width - 1400) / 2 + ",top=" + (screen.height - 1000) / 2 + ",height=1000,width=1400")
    // window.location.href = `${url}${window.top.location.href.split('=')[1]}`
}
const handleSizeChange = (val) => {
    query.pageSize = val
    getTableData()
}
const handleCurrentChange = (val) => {
    query.pageNum = val
    getTableData()
}

</script>

<style lang="scss" scoped>
#finishedProject {
    margin: 20px;
    height: calc(100% - 40px);
    .searchForm {
        margin-bottom: 20px;
        height: 80px;
        .el-form {
            height: 100%;
            display: flex;
            align-items: center;
            .el-form-item {
                margin-bottom: 0px;
            }
        }
    }
    .tableCard {
        height: calc(100% - 100px);
        .table-pagination {
            height: 50px;
            display: flex;
            justify-content: flex-end;
            align-items: flex-end;
        }
    }
}
</style>