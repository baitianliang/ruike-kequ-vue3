<template>
    <div id="Pbms" v-loading="loading">
        <div class="header">
            项目批次管理 - Project Batch Management
        </div>
        <div class="content">
            <el-card shadow="never" class="left_card" body-style="padding: 0px; height: 100%;">
                <div class="base_title">发货批次列表</div>
                <div class="button_group">
                    <el-button @click="addListItem" type="primary">新增批次</el-button>
                    <!-- <el-button type="success" size="small">保存</el-button> -->
                </div>
                <div style="padding: 15px; background: #f0f7ff; display: flex; align-items: center; font-size: 12px; line-height: 12px;">
                    总计数:&nbsp;<p style="margin: 0px; font-weight: 600; color: #1890ff; margin-right: 10px;">{{ leftList.length }}</p>
                    已发货:&nbsp;<p style="margin: 0px; font-weight: 600; color: #1890ff">{{ leftList.filter(item => item.ZT_PCZT_PD === '已发货').length }}</p>
                </div>
                <div style="padding: 8px 10px; display: flex">
                    <el-input v-model="searchName" size="small">
                        <template #append>
                            <el-button @click="getLeftList">查询</el-button>
                        </template>
                    </el-input>
                </div>
                <div class="left_list" :loading="leftLoading">
                    <el-card
                        v-for="(item, index) in leftList"
                        :key="index"
                        shadow="never"
                        class="left_item"
                        :class="activeIndex === index? 'active_item' : ''"
                        body-style="padding: 10px"
                        @click="selectItem(item, index)">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px">
                            <div style="font-weight: 600; color: #1890ff; font-size: 16px;">
                                {{ item.ZT_SB_XMFHPCH }}
                            </div>
                            <div>
                                <!-- <el-tag type="primary">进行中</el-tag> -->
                                <el-tag type="success">{{ item.ZT_PCZT_PD }}</el-tag>
                            </div>
                        </div>
                        <el-descriptions class-name="el-descriptions" :title="item.ZT_SB_XMFHPCMC" :column="2">
                            <el-descriptions-item label="币种:">{{ item.ZT_TC_HBDM }}</el-descriptions-item>
                            <el-descriptions-item label="金额（原币）:">{{ item.ZT_SB_PCZJE_01 }}</el-descriptions-item>
                            <el-descriptions-item label="FAT时间:">{{ item.ZT01_FAT_DATE }}</el-descriptions-item>
                            <el-descriptions-item label="预计发货时间:">{{ item.ZT01_FH_DATE }}</el-descriptions-item>
                        </el-descriptions>
                        <el-divider style="margin: 5px 0px;" />
                        <el-descriptions title="" :column="1">
                            <el-descriptions-item label="金额（本币）:">{{ item.ZT_SM_HSJE }}</el-descriptions-item>
                            <el-descriptions-item label="备注:">{{ item.ZT_DESCRIPTION }}</el-descriptions-item>
                        </el-descriptions>
                        <el-button type="primary" style="width: 100%" @click.stop="editItem(item)">编辑</el-button>
                    </el-card>
                </div>
            </el-card>
            <div class="rigth_content">
                <el-card class="top_card" shadow="never" body-style="padding: 0px; height: 100%;">
                    <div class="base_title">
                        <div>批次产品 - {{ activeIndex === null ? '请选择批次' : leftList[activeIndex].ZT_SB_XMFHPCH }}</div>
                        <div>产品数:&nbsp;{{ projectTable.tableData.length }}
                            <!-- &nbsp;&nbsp;|&nbsp;&nbsp;产品总数:&nbsp;{{ 10 }} -->
                        </div>
                    </div>
                    <div class="button_group">
                        <el-button @click="showAllProjectList" type="primary">新增产品</el-button>
                        <el-button type="success" @click="updateProjectList">保存</el-button>
                        <el-button type="danger" @click="deleteProject">删除</el-button>
                    </div>
                    <el-table
                        ref="projectTableRef"
                        :data="projectTable.tableData"
                        @selection-change="selectionChange"
                        highlight-current-row
                        show-overflow-tooltip
                        height="calc(100% - 123px)"
                        @current-change="checkedItem"
                        border style="width: calc(100% - 20px); margin: 10px 10px;">
                        <el-table-column type="selection" width="40" />
                        <el-table-column
                            v-for="(item, index) in projectTable.tableColumns"
                            :key="index"
                            :prop="item.prop"
                            :label="item.label"
                            :width="item.width">
                            <template v-if="item.prop === 'ZT_PL_CX_BM'" #default="scope">
                                <el-select
                                    v-model="scope.row.ZT_PL_CX_BM"
                                    placeholder="批次币种"
                                    disabled
                                    clearable>
                                    <el-option
                                        v-for="(item, index) in distList.factory"
                                        :key="index"
                                        :label="item.ZT_PL_CX_MC"
                                        :value="item.ZT_PL_CX_BM" />
                                </el-select>
                            </template>
                            <template v-else-if="item.prop === 'ZT_SB_BPCSL'" #default="scope">
                                <el-input-number controls-position="right" v-model="scope.row.ZT_SB_BPCSL" :precision="2" :step="1" :max="scope.row.ZT_CPSL" :min="0" />
                            </template>
                            <template v-else-if="item.prop === 'ZT_DESCRIPTION'" #default="scope">
                                <el-input v-model="scope.row.ZT_DESCRIPTION"  />
                            </template>
                        </el-table-column>
                    </el-table>
                </el-card>
                <div class="bottom_content">
                    <el-card shadow="never" class="planning_card" body-style="padding: 0px; height: 100%;">
                        <div class="base_title">
                            <div>产品计划 - {{ checkedProject.ZT_MIL_WLMC_MC || '请选择产品' }}</div>
                            <div>任务数:&nbsp;{{ planningTable.tableData.length }}
                                <!-- &nbsp;&nbsp;|&nbsp;&nbsp;完成率:&nbsp;{{ 10 }}% -->
                            </div>
                        </div>
                        <div class="button_group">
                            <el-button @click="showGanttChart" type="primary">甘特图</el-button>
                            <el-button type="success" @click="updatePlanningList">保存</el-button>
                        </div>
                        <el-table
                            :data="planningTable.tableData"
                            height="calc(100% - 123px)"
                            border style="width: calc(100% - 20px); margin: 10px 10px;">
                            <!-- <el-table-column type="selection" width="40" /> -->
                            <el-table-column
                                v-for="(item, index) in planningTable.tableColumns"
                                :key="index"
                                :prop="item.prop"
                                :label="item.label"
                                :width="item.width">
                                <template v-if="item.prop === 'STATUS'" #default="scope">
                                    <!-- {{ ['未开始', '进行中', '已完成'][scope.row.STATUS] }} -->
                                    <el-select
                                        v-model="scope.row.STATUS"
                                        placeholder="作业状态">
                                        <el-option label="未开始" :value="0" />
                                        <el-option label="进行中" :value="1" />
                                        <el-option label="已完成" :value="2" />
                                    </el-select>
                                </template>
                                <template v-else-if="item.prop === 'REMARKS'" #default="scope">
                                    <el-input v-model="scope.row.REMARKS"  />
                                </template>
                                <template v-else-if="item.prop === 'PLANNED_START'" #default="scope">
                                    <el-date-picker
                                        v-model="scope.row.PLANNED_START"
                                        type="date"
                                        placeholder="计划开始"
                                        clearable
                                        format="YYYY-MM-DD"
                                        value-format="YYYY-MM-DD"
                                        style="width: 100%"
                                    />
                                </template>
                                <template v-else-if="item.prop === 'PLANNED_DURATION'" #default="scope">
                                    <el-input-number controls-position="right" v-model="scope.row.PLANNED_DURATION" :precision="0" :step="1" />
                                </template>
                                <template v-else-if="item.prop === 'PLANNED_FINISH'" #default="scope">
                                    {{ getPLANNED_FINISH(scope.row) }}
                                </template>
                                <template v-else-if="item.prop === 'ACTUAL_START'" #default="scope">
                                    <el-date-picker
                                        v-model="scope.row.ACTUAL_START"
                                        type="date"
                                        placeholder="实际开始"
                                        clearable
                                        format="YYYY-MM-DD"
                                        value-format="YYYY-MM-DD"
                                        style="width: 100%"
                                    />
                                </template>
                                <template v-else-if="item.prop === 'ACTUAL_DURATION'" #default="scope">
                                    <el-input-number controls-position="right" v-model="scope.row.ACTUAL_DURATION" :precision="0" :step="1" />
                                </template>
                                <template v-else-if="item.prop === 'ACTUAL_FINISH'" #default="scope">
                                    {{ getACTUAL_FINISH(scope.row) }}
                                </template>
                                
                            </el-table-column>
                        </el-table>
                    </el-card>
                    <el-card shadow="never" class="components_card" body-style="padding: 0px; height: 100%;">
                        <div class="base_title">
                            <div>产品组件 - {{ '请选择物料' }}</div>
                            <div>组件数:&nbsp;{{ 0 }}
                                &nbsp;&nbsp;|&nbsp;&nbsp;库存充足:&nbsp;{{ 0 }}
                            </div>
                        </div>
                    </el-card>
                </div>
            </div>
        </div>

        <el-dialog
            v-model="dialogVisible"
            v-if="dialogVisible"
            :title="itemData.ZT_SB_XMFHPCH ? '编辑批次' : '新增批次'"
            :close-on-click-modal="false"
            width="1000">
            <el-form
                ref="ruleFormRef"
                style="margin: 0px 20px"
                size="large"
                :model="itemData"
                :rules="rules"
                label-position="top">
                <div class="line_flex">
                    <el-form-item label="批次号:">
                        <el-input disabled v-model="itemData.ZT_SB_XMFHPCH" placeholder="批次号" clearable />
                    </el-form-item>
                    <el-form-item label="批次名称:" prop="ZT_SB_XMFHPCMC">
                        <el-input v-model="itemData.ZT_SB_XMFHPCMC" placeholder="批次名称" clearable />
                    </el-form-item>
                </div>
                <div class="line_flex">
                    <el-form-item label="批次状态:" prop="ZT_PCZT_PD">
                        <el-select
                            v-model="itemData.ZT_PCZT_PD"
                            placeholder="批次状态"
                            clearable>
                            <el-option
                                v-for="(item, index) in distList.status"
                                :key="index"
                                :label="item.OPTION_NAME"
                                :value="item.OPTION_VALUE" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="批次币种:" prop="ZT_TC_HBDM">
                        <el-select
                            v-model="itemData.ZT_TC_HBDM"
                            placeholder="批次币种"
                            clearable>
                            <el-option
                                v-for="(item, index) in distList.currency"
                                :key="index"
                                :label="item.ZT_TC_HBDM"
                                :value="item.ZT_TC_HBDM" />
                        </el-select>
                    </el-form-item>
                </div>
                <div class="line_flex">
                    <el-form-item label="批次金额（原币）:">
                        <el-input-number disabled controls-position="right" v-model="itemData.ZT_SB_PCZJE_01" :precision="2" :step="1" />
                    </el-form-item>
                    <el-form-item label="批次金额（本币）:">
                        <el-input-number disabled controls-position="right" v-model="itemData.ZT_SM_HSJE" :precision="2" :step="1" />
                    </el-form-item>
                </div>
                <div class="line_flex">
                    <el-form-item label="FAT时间:" prop="ZT01_FAT_DATE">
                        <el-date-picker
                            v-model="itemData.ZT01_FAT_DATE"
                            type="date"
                            placeholder="FAT时间"
                            clearable
                            format="YYYY-MM-DD"
                            value-format="YYYY-MM-DD"
                            style="width: 100%"
                        />
                    </el-form-item>
                    <el-form-item label="预计发货时间:" prop="ZT01_FH_DATE">
                        <el-date-picker
                            v-model="itemData.ZT01_FH_DATE"
                            type="date"
                            placeholder="预计发货时间"
                            clearable
                            format="YYYY-MM-DD"
                            value-format="YYYY-MM-DD"
                            style="width: 100%"
                        />
                    </el-form-item>
                </div>
                <el-form-item label="备注:">
                    <el-input v-model="itemData.ZT_DESCRIPTION" placeholder="备注" clearable />
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="saveItem">保存</el-button>
                </div>
            </template>
        </el-dialog>

        <el-dialog
            v-model="projcetDialogVisible"
            v-if="projcetDialogVisible"
            title="新增批次产品"
            :close-on-click-modal="false"
            width="1200"
            min-heigth="1000">
            <el-table
                ref="multipleTableRef"
                :data="projectAllTable.tableData"
                row-key="ID"
                v-loading="projectAllTable.loading"
                @selection-change="handleSelectionChange"
                @select-all="handleSelectionAll"
                show-overflow-tooltip border
                height="800"
                style="width: 100%">
                <el-table-column type="selection" width="40" />
                <el-table-column
                    v-for="(item, index) in projectAllTable.tableColumns"
                    :key="index"
                    :prop="item.prop"
                    :label="item.label"
                    :width="item.width"
                    :align="item.align">
                    <template v-if="item.prop === 'ZT_PL_CX_BM'" #default="scope">
                        <el-select
                            v-model="scope.row.ZT_PL_CX_BM"
                            @change="pushUpdateFactory(scope.row)"
                            placeholder="工厂">
                            <el-option
                                v-for="(item, index) in distList.factory"
                                :key="index"
                                :label="item.ZT_PL_CX_BM + '-' + item.ZT_PL_CX_MC"
                                :value="item.ZT_PL_CX_BM" />
                        </el-select>
                    </template>
                    <template v-else-if="item.prop === 'ZT_SYWFPSL'" #default="scope">
                        <el-input-number controls-position="right" v-model="scope.row.ZT_SYWFPSL" :precision="2" :step="1" :max="scope.row.ZT_SYWFPSL_JY" :min="0" />
                    </template>
                    <template v-else-if="item.prop === 'ZT_SB_BPCSL'" #default="scope">
                        {{ scope.row.ZT_SB_BPCSL = scope.row.ZT_SYWFPSL + (scope.row.ZT_SB_BPCSL_01 || 0) }}
                    </template>
                    <template v-else-if="item.prop === 'ZT01_BJ_TB'" #default="scope">
                        <el-checkbox disabled :model-value="scope.row.ZT01_BJ_TB === 1" label="" />
                    </template>
                    <template v-else-if="item.prop === 'ZT01_SAP_TB'" #default="scope">
                        <el-checkbox disabled :model-value="scope.row.ZT01_SAP_TB === 1" label="" />
                    </template>
                </el-table-column>
            </el-table>
            <!-- <div class="table-pagination">
                <el-pagination
                    v-model:current-page="projectAllTable.pageNum"
                    v-model:page-size="projectAllTable.pageSize"
                    :page-sizes="[20, 50, 100]"
                    background
                    layout="sizes, prev, pager, next"
                    :total="projectAllTable.total"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                />
            </div> -->
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="projcetDialogVisible = false">取消</el-button>
                    <el-button :disabled="updateFactoryList.length === 0" type="primary" @click="updateFactory">更新工厂</el-button>
                    <el-button :disabled="checkedSelectionList.length === 0" type="primary" @click="updateProject">保存</el-button>
                </div>
            </template>
        </el-dialog>

        <el-dialog v-if="ganttChartVisible" v-model="ganttChartVisible" body-class="gantt-chart-body" title="甘特图" :close-on-click-modal="false" fullscreen>
            <Gantt :dataList="projectGanttData" @updateTask="updateTask"></Gantt>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="ganttChartVisible = false">关闭</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { nextTick, onMounted, ref, useTemplateRef } from "vue";
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from "../assets/axios/index.js";
import Gantt from '../components/GanttChart.vue'

const loading = ref(false);
const searchName = ref("");
const leftLoading = ref(false);
const leftList = ref([]);
const dialogVisible = ref(false);
const projcetDialogVisible = ref(false);
const ruleFormRef = useTemplateRef('ruleFormRef');
const itemData = ref({});
const activeIndex = ref(null);
const rules = ref({
    ZT_SB_XMFHPCMC: [
        { required: true, message: '请输入批次名称', trigger: 'blur' },
    ],
    ZT_PCZT_PD: [
        { required: true, message: '请选择批次状态', trigger: 'change' },
    ],
    ZT_TC_HBDM: [
        { required: true, message: '请选择批次币种', trigger: 'change' },
    ],
    ZT01_FAT_DATE: [
        { required: true, message: '请输入FAT时间', trigger: 'change' },
    ],
    ZT01_FH_DATE: [
        { required: true, message: '请输入预计发货时间', trigger: 'change' },
    ],
})
const distList = ref({
    status: [],
    currency: [],
    factory: [],
})

const projectTable = ref({
    tableColumns: [
        {label: '物料编码', prop: 'ZT_MIL_WLBM', width: 180},
        {label: '物料描述', prop: 'ZT_MIL_WLMC_MC', width: 230},
        {label: '工厂', prop: 'ZT_PL_CX_BM', width: 350},
        {label: '数量', prop: 'ZT_SB_BPCSL', width: 210},
        {label: '单位', prop: 'ZT_MIL_JLDW', width: 130},
        {label: '站点', prop: 'ZT_MCR_ZD', width: 200},
        {label: '柜号', prop: 'ZT_MCR_GH', width: 200},
        {label: '备注', prop: 'ZT_DESCRIPTION', width: 330},
        {label: '批次标识号', prop: 'ZT01_AUTO_0001', width: 150},
        {label: '产品标识号', prop: 'ZT01_AUTO_0001_01', width: 150},
        {label: '产品数量', prop: 'ZT_CPSL', width: 150},
        {label: '已分批', prop: 'ZT_PAL_YFPSL', width: 150},
    ],
    tableData: []
})

const projectAllTable = ref({
    pageNum: 1,
    pageSize: 1000,
    total: 0,
    tableColumns: [
        {label: '物料编码', prop: 'ZT_MIL_WLBM', width: 150},
        {label: '物料描述', prop: 'ZT_MIL_WLMC', width: 300},
        {label: '复核数量', prop: 'ZT_QUANTITY', width: 130},
        {label: '下单数量', prop: 'ZT01_YXD', width: 130},
        {label: '已分批数量', prop: 'ZT_PAL_YFPSL', width: 130},
        {label: '本次分批数量', prop: 'ZT_SYWFPSL', width: 180},
        {label: '计量单位', prop: 'ZT_MIL_JLDW', width: 100, align: 'center'},
        {label: '工厂', prop: 'ZT_PL_CX_BM', width: 250},
        {label: '站点', prop: 'ZT_MCR_ZD', width: 200},
        {label: '柜号', prop: 'ZT_MCR_GH', width: 200},
        {label: '报价系统', prop: 'ZT01_BJ_TB', width: 130, align: 'center'},
        {label: 'ERP系统', prop: 'ZT01_SAP_TB', width: 130, align: 'center'},
        {label: '产品标识号', prop: 'ZT01_AUTO_0001', width: 130},
        {label: '批次标识号', prop: 'ZT01_AUTO_0001_01', width: 130},
        {label: '当前批次', prop: 'ZT_SB_BPCSL_01', width: 130},
        {label: '分配后批次', prop: 'ZT_SB_BPCSL', width: 130},
        {label: '剩余未分批', prop: 'ZT_SYWFPSL_JY', width: 130},
    ],
    tableData: []
})
const planningTable = ref({
    tableColumns: [
        {label: '作业名称', prop: 'TASK_NAME', width: 200},
        {label: '作业状态', prop: 'STATUS', width: 120},
        {label: '备注', prop: 'REMARKS', width: 250},
        {label: '标准计划开始', prop: 'MB_PLANNED_START', width: 120},
        {label: '标准计划工期', prop: 'MB_PLANNED_DURATION', width: 120},
        {label: '标准计划完成', prop: 'MB_PLANNED_FINISH', width: 120},
        {label: '计划开始', prop: 'PLANNED_START', width: 170},
        {label: '计划工期', prop: 'PLANNED_DURATION', width: 170},
        {label: '计划完成', prop: 'PLANNED_FINISH', width: 120},
        {label: '实际开始', prop: 'ACTUAL_START', width: 170},
        {label: '实际工期', prop: 'ACTUAL_DURATION', width: 170},
        {label: '实际完成', prop: 'ACTUAL_FINISH', width: 120},
    ],
    tableData: []
})

const multipleTableRef = useTemplateRef('multipleTableRef');
const projectTableRef = useTemplateRef('projectTableRef');
let projectId = null

onMounted(() => {
    projectId = window.location.href.split('?')[1].split('=')[1]
    axios.getDictList(projectId).then(res => {
        distList.value.status = res.data.data.pczt
        distList.value.currency = res.data.data.pcbz
        distList.value.factory = res.data.data.factory
    })
    getLeftList()
});

const addListItem = () => {
    itemData.value = {
        ZT_SB_XMFHPCH: "",
        ZT_SB_XMFHPCMC: "",
        ZT_PCZT_PD: "",
        ZT_TC_HBDM: "",
        ZT_SB_PCZJE_01: "",
        ZT_SM_HSJE: "",
        ZT01_FAT_DATE: "",
        ZT01_FH_DATE: "",
        ZT_DESCRIPTION: "",
        ZT_PRJ_NUMBER: projectId
    }
    dialogVisible.value = true;
}

const editItem = (item) => {
    itemData.value = item;
    dialogVisible.value = true;
}

function getLeftList() {
    activeIndex.value = null;
    leftLoading.value = true;
    axios.getLeftList(projectId, searchName.value ? `&ztSbXmfhpcmc=${searchName.value}` : "")
    .then(res => {
        leftList.value = res.data.data;
        leftLoading.value = false;
    })
}

const saveItem = async () => {
    loading.value = true;
    await ruleFormRef.value.validate((valid, fields) => {
        if (valid) {
            dialogVisible.value = false;
            axios.updateLeftItem(itemData.value)
            .then(res => {
                console.log(res)
                itemData.value.ZT_SB_XMFHPCH ? ElMessage.success('修改成功') : ElMessage.success('新增成功')
                getLeftList()
                loading.value = false;
            })
        }
    })
}

const selectItem = (item, index) => {
    projectTable.value.tableData = [];
    planningTable.value.tableData = [];
    projectGanttData.value = [];
    checkedProject.value = {};
    checkedSelectionList.value = [];
    checkedProjectList = [];
    activeIndex.value = index;
    getProjectList(item.ZT_SB_XMFHPCH)
}

const getProjectList = (ZT_SB_XMFHPCH) => {
    axios.getProjectList(ZT_SB_XMFHPCH)
    .then(res => {
        projectTable.value.tableData = res.data.data;
        if(res.data.data.length > 0) {
            nextTick(() => {
                projectTableRef.value.setCurrentRow(projectTable.value.tableData[0]);
            })
        }
    })
}

const showAllProjectList = () => {
    if(activeIndex.value === null)
    return ElMessage.info('请先选择批次');
    getAllProjectList()
    .then(res => {
        projcetDialogVisible.value = true;
    })
}

const updateProjectList = () => {
    if(activeIndex.value === null)
    return ElMessage.info('请先选择批次');
    loading.value = true;
    axios.updateProject(projectTable.value.tableData)
    .then(res => {
        getProjectList(leftList.value[activeIndex.value].ZT_SB_XMFHPCH)
        ElMessage.success('更新成功')
        loading.value = false;
    })
}

let checkedProjectList = []
const selectionChange = (val) => {
    checkedProjectList = val
}
const deleteProject = () => {
    if(checkedProjectList.length === 0) {
        return ElMessage.info('请先选择要删除的项目')
    }
    ElMessageBox.confirm(
        '是否确认删除选中的项目?',
        'Warning',
        {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
    .then(() => {
        loading.value = true;
        axios.deleteProject(checkedProjectList)
        .then(res => {
            getProjectList(leftList.value[activeIndex.value].ZT_SB_XMFHPCH)
            ElMessage.success('删除成功')
            loading.value = false;
        })
    })
    .catch(() => {})
}

const checkedProject = ref({})
const projectGanttData = ref([])
const checkedItem = (item) => {
    // console.log(item)
    if(item) {
        checkedProject.value = item
        axios.getPlanningList({...item, projectId: projectId})
        .then(res => {
            planningTable.value.tableData = res.data.data;
        })
        axios.getGanttData({...item, projectId: projectId})
        .then(res => {
            console.log(res)
            projectGanttData.value = res.data.data;
            projectGanttData.value.forEach(el => {
                el.open = true
                el.start_date = el.MB_PLANNED_START && `${el.MB_PLANNED_START} 00:00:00`
                el.duration = el.MB_PLANNED_DURATION
                el.id = el.ID
                // console.log(el.PARENT_ID)
                el.parent = String(el.PARENT_ID_01)
                // el.parent = el.id !== 275 ? String(el.PARENT_ID_01) : '0'
                if(el.TASK_TYPE === 'WBS') el.type = 'project';
                else if(el.TASK_TYPE === 'TASK') el.type = 'task';
                el.text = el.TASK_NAME
                el.REMARKS = el.REMARKS || ""
                el.ACTUAL_START = el.ACTUAL_START || ""
                el.ACTUAL_DURATION = el.ACTUAL_DURATION || ""
                el.ACTUAL_FINISH = el.ACTUAL_FINISH || ""
                // el.STATUS = ['未开始', '进行中', '已完成'][el.STATUS]
            })
        })
    } else {
        checkedProject.value = {}
    }
}

const getPLANNED_FINISH = (item) => {
    if(item.PLANNED_START && item.PLANNED_DURATION) {
        let time = new Date(new Date(item.PLANNED_START).getTime() + item.PLANNED_DURATION * 24 * 60 * 60 * 1000)
        item.PLANNED_FINISH = `${time.getFullYear() + '-' + (time.getMonth() + 1 < 10 ? '0' + (time.getMonth() + 1) : time.getMonth() + 1) + '-' + (time.getDate() < 10 ? '0' + time.getDate() : time.getDate())}`
        return item.PLANNED_FINISH
    }
}
const getACTUAL_FINISH = (item) => {
    if(item.ACTUAL_START && item.ACTUAL_DURATION) {
        let time = new Date(new Date(item.ACTUAL_START).getTime() + item.ACTUAL_DURATION * 24 * 60 * 60 * 1000)
        item.ACTUAL_FINISH = `${time.getFullYear() + '-' + (time.getMonth() + 1 < 10 ? '0' + (time.getMonth() + 1) : time.getMonth() + 1) + '-' + (time.getDate() < 10 ? '0' + time.getDate() : time.getDate())}`
        return item.ACTUAL_FINISH
    }
}

const getAllProjectList = async () => {
    checkedSelectionList.value = [];
    updateFactoryList.value = [];
    projectAllTable.value.loading = true;
    axios.getAllProjectList(leftList.value[activeIndex.value].ZT_PRJ_NUMBER, leftList.value[activeIndex.value].ZT_SB_XMFHPCH, projectAllTable.value.pageNum, projectAllTable.value.pageSize)
    .then(res => {
        projectAllTable.value.tableData = res.data.data.list;
        projectAllTable.value.total = res.data.data.total;
        // nextTick(() => {
        //     if (checkedSelectionList) {
        //         checkedSelectionList.forEach((row) => {
        //             multipleTableRef.value.toggleRowSelection(row)
        //         })
        //     }
            projectAllTable.value.loading = false;
        // })
    })
}

let checkedSelectionList = ref([])
const handleSelectionChange = (list, val) => {
    console.log(list, val)
    // if(checkedSelectionList.value.includes(val))
    // checkedSelectionList.value.splice(checkedSelectionList.value.indexOf(val), 1)
    // else
    // checkedSelectionList.value.push(val)
    checkedSelectionList.value = list
    console.log(checkedSelectionList.value)
}
const handleSelectionAll = (list, val) => {
    console.log(list, val)
}

const handleCurrentChange = (val) => {
    projectAllTable.value.pageNum = val;
    getAllProjectList();
}

const handleSizeChange = (val) => {
    projectAllTable.value.pageNum = 1;
    projectAllTable.value.pageSize = val;
    getAllProjectList();
}

const updateFactoryList = ref([])
const pushUpdateFactory = (row) => {
    if(updateFactoryList.value.find(el => el.ZT01_AUTO_0001 === row.ZT01_AUTO_0001))
    updateFactoryList.value.find(el => el.ZT01_AUTO_0001 === row.ZT01_AUTO_0001).ZT_PL_CX_BM = row.ZT_PL_CX_BM;
    else
    updateFactoryList.value.push(row);
    console.log(updateFactoryList.value)
}

const updateFactory = () => {
    loading.value = true;
    axios.updateTheFactory(updateFactoryList.value)
    .then(res => {
        console.log(res)
        ElMessage.success(res.data.msg)
        updateFactoryList.value = []
        getAllProjectList()
        loading.value = false;
    })
}

const updateProject = () => {
    if(updateFactoryList.value.length > 0) {
        return ElMessage.info('检测到有工厂信息未更新，请先更新工厂信息！')
    }
    checkedSelectionList.value.forEach(el => {
        el.RECORD_NO = leftList.value[activeIndex.value].RECORD_NO;
        el.ZT_SB_XMFHPCH = leftList.value[activeIndex.value].ZT_SB_XMFHPCH;
        el.ZT01_FAT_DATE = leftList.value[activeIndex.value].ZT01_FAT_DATE;
    })
    loading.value = true;
    axios.updatePopUp(checkedSelectionList.value)
    .then(res => {
        getProjectList(leftList.value[activeIndex.value].ZT_SB_XMFHPCH)
        ElMessage.success(res.data.msg)
        checkedSelectionList.value = []
        projcetDialogVisible.value = false
        loading.value = false;
    })
}

const ganttChartVisible = ref(false)
const showGanttChart = () => {
    if(projectGanttData.value.length === 0) {
        return ElMessage.info('暂无计划数据')
    }
    // projectGanttData.value
    // planningTable.value.tableData.forEach(el => {
    //     el.start_date = el.MB_PLANNED_START && `${el.MB_PLANNED_START} 00:00:00`
    //     el.duration = el.MB_PLANNED_DURATION
    // })
    ganttChartVisible.value = true;
}
const updatePlanningList = () => {
    if(!checkedProject.value.ZT_MIL_WLMC_MC) {
        return ElMessage.info('请先选择批次产品')
    }
    if(planningTable.value.tableData.length === 0) {
        return ElMessage.info('暂无产品计划数据')
    }
    ElMessageBox.confirm(
        '是否更改产品计划数据?',
        '提示',
        {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'Info',
        }
    )
    .then(() => {
        loading.value = true;
        axios.updatePlanningList(planningTable.value.tableData)
        .then(res => {
            checkedItem(checkedProject.value)
            ElMessage.success('更新成功')
            loading.value = false;
        })
    })
    .catch(() => {})
}
const updateTask = (data) => {
    loading.value = true;
    axios.updatePlanningList(data)
    .then(res => {
        checkedItem(checkedProject.value)
        ElMessage.success('更新成功')
        loading.value = false;
    })
}

</script>


<style lang="scss" scoped>
#Pbms {
    height: 100%;
    background: #f0f2f5;
    .header {
        background: linear-gradient(135deg, #1890ff 0%, #0066cc 100%);
        color: white;
        padding: 12px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
        height: 26px;
        font-size: 18px;
        font-weight: bold;
    }
    .content {
        height: calc(100% - 70px);
        width: calc(100% - 20px);
        display: flex;
        justify-content: space-between;
        margin: 10px;
        .left_card {
            width: 25%;
            .left_list {
                height: calc(100% - 195px);
                padding: 10px;
                .el-card {
                    cursor: pointer;
                }
                .el-card:hover {
                    border-color: #1890ff;
                    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
                }
                .left_item {
                    margin-top: 10px;
                    .el-descriptions {
                        .el-descriptions__cell {
                            padding-bottom: 0px;
                        }
                    }
                }
                .left_item:first-child {
                    margin-top: 0px;
                }
                .active_item {
                    border-color: #1890ff;
                    background: #e6f7ff;
                    :deep(.el-descriptions__body) {
                        background: inherit;
                    }
                }
            }
        }
        .rigth_content {
            width: calc(75% - 10px);
            .top_card {
                height: 40%;
            }
            .bottom_content {
                display: flex;
                justify-content: space-between;
                height: calc(60% - 10px);
                margin-top: 9px;
                .planning_card {
                    width: calc(50% - 6px);
                }
                .components_card {
                    width: calc(50% - 6px);
                }
            }
        }
        .base_title {
            margin: 0px;
            padding: 10px 15px;
            border-bottom: 2px solid #e8e8e8;
            font-size: 14px;
            font-weight: 500;
            display: flex;
            justify-content: space-between;
        }
        .button_group {
            padding: 8px 15px;
            border-bottom: 1px solid #f0f0f0;
        }
    }

    .line_flex {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .el-form-item {
            width: 45%;
            .el-input-number {
                width: 100%;
            }
        }
    }
    
    .table-pagination {
        height: 50px;
        display: flex;
        justify-content: flex-end;
        align-items: flex-end;
    }
    :deep(.gantt-chart-body) {
        height: calc(100% - 96px);
    }
}
</style>