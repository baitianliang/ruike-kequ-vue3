<template>
    <!-- <iframe src="./产品计划模板.html" width="100%" height="100%"></iframe> -->
    <div id="Planning_Management">
        <div>
            <div>
                <div>
                    <el-icon><Menu /></el-icon>
                    <div>产品计划管理</div>
                </div>
                <div>管理所有产品的主计划及作业分解结构</div>
            </div>
            <el-button :icon="Plus" type="primary">新建计划</el-button>
        </div>
        <el-card shadow="never">
            <el-input :prefix-icon="Search" placeholder="搜索产品名称..."></el-input>
        </el-card>
    </div>
    <!-- <el-icon><Calendar /></el-icon> -->
    <!-- <el-icon><Clock /></el-icon> -->
    <!-- <el-icon><Edit /></el-icon> -->
    <!-- <el-icon><Document /></el-icon> -->
</template>

<script setup>
// import { Menu, Plus, Search, Edit, Calendar, Clock, Document } from '@element-plus/icons-vue'

</script>

<style lang="scss" scoped>
iframe {
    border: 0px;
}
// #Planning_Management {
//     height: 100%;
//     width: 50%;
//     margin: 0 auto;
// }
</style>