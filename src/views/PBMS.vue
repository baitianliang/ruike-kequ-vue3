<template>
    <!-- P2402720 -->
    <div id="Pbms" v-loading="loading">
        <div class="header">
            项目批次管理 - Project Batch Management
        </div>
        <div class="content">
            <div>
                <el-card shadow="never" body-style="padding: 0px; height: 100%;">
                    <div class="base_title">项目信息</div>
                    <div class="button_group">
                        <el-button @click="showPorjcetList" type="primary">选择项目</el-button>
                        <el-button @click="showGanttChart(ganttData1, 1)" type="primary">甘特图</el-button>
                    </div>
                    <div class="left_list" :loading="leftLoading">
                        <el-card
                            shadow="never"
                            class="left_item"
                            body-style="padding: 10px">
                            <el-descriptions class-name="el-descriptions" :column="1">
                                <el-descriptions-item label="项目编号:">{{ projectInfo.proj_number }}</el-descriptions-item>
                                <el-descriptions-item label="项目名称:">{{ projectInfo.post1 }}</el-descriptions-item>
                            </el-descriptions>
                            <el-descriptions class-name="el-descriptions" :column="2">
                                <el-descriptions-item label="业务洲区:">{{ projectInfo.zzdywb8 }}</el-descriptions-item>
                                <el-descriptions-item label="业务片区:">{{ projectInfo.zzdywb10 }}</el-descriptions-item>
                                <el-descriptions-item label="项目国家:">{{ projectInfo.zgj }}</el-descriptions-item>
                                <el-descriptions-item label="贸易条款:">{{ projectInfo.zmytk }}</el-descriptions-item>
                                <el-descriptions-item label="客户编号:">{{ projectInfo.zzdywb1 }}</el-descriptions-item>
                                <el-descriptions-item label="客户名称:">{{ projectInfo.zzdywb2 }}</el-descriptions-item>
                                <el-descriptions-item label="项目币种:">{{ projectInfo.zzdywb4 }}</el-descriptions-item>
                                <el-descriptions-item label="客户结算金额:">{{ projectInfo.zkhjsjez }}</el-descriptions-item>
                            </el-descriptions>
                        </el-card>
                    </div>
                </el-card>
                <el-card shadow="never" class="left_card" body-style="padding: 0px; height: 100%;">
                    <div class="base_title">发货批次列表</div>
                    <div class="button_group">
                        <el-button @click="addListItem" type="primary">新增批次</el-button>
                        <!-- <el-button type="success" size="small">保存</el-button> -->
                    </div>
                    <div style="padding: 15px; background: #f0f7ff; display: flex; align-items: center; font-size: 12px; line-height: 12px;">
                        总计数:&nbsp;<p style="margin: 0px; font-weight: 600; color: #1890ff; margin-right: 10px;">{{ leftList.length }}</p>
                        已发货:&nbsp;<p style="margin: 0px; font-weight: 600; color: #1890ff">{{ leftList.filter(item => item.zt_pczt_pd === '已发货').length }}</p>
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
                                    <!-- {{ item.zt_sb_xmfhpch }} -->
                                    {{ item.zt_batch_number }}
                                </div>
                                <div>
                                    <!-- <el-tag type="primary">进行中</el-tag> -->
                                    <el-tag type="success">{{ item.zt_pczt_pd }}</el-tag>
                                </div>
                            </div>
                            <el-descriptions class-name="el-descriptions" :title="item.zt_sb_xmfhpcmc" :column="1">
                                <el-descriptions-item label="币种:">{{ item.zt_tc_hbdm }}</el-descriptions-item>
                            </el-descriptions>
                            <el-descriptions class-name="el-descriptions" :column="2">
                                <el-descriptions-item label="FAT时间:">{{ item.zt01_fat_date }}</el-descriptions-item>
                                <el-descriptions-item label="预计发货时间:">{{ item.zt01_fh_date }}</el-descriptions-item>
                                <el-descriptions-item label="金额（原币）:">{{ item.zt_pc_batch_amount_yb }}</el-descriptions-item>
                                <el-descriptions-item label="金额（本币）:">{{ item.zt_pc_batch_amount_bb }}</el-descriptions-item>
                            </el-descriptions>
                            <el-divider style="margin: 5px 0px;" />
                            <el-descriptions class-name="el-descriptions" :column="1">
                                <el-descriptions-item label="备注:">{{ item.zt_description }}</el-descriptions-item>
                            </el-descriptions>
                            <el-button type="primary" style="width: 100%" @click.stop="editItem(item)">编辑</el-button>
                        </el-card>
                    </div>
                </el-card>
            </div>
            <div class="rigth_content">
                <el-card class="top_card" shadow="never" body-style="padding: 0px; height: 100%;">
                    <div class="base_title">
                        <div>批次产品 - {{ activeIndex === null ? '请选择批次' : `${leftList[activeIndex].zt_batch_number}` }}</div>
                        <div>产品数:&nbsp;{{ projectBathcTable.tableData.length }}
                            <!-- &nbsp;&nbsp;|&nbsp;&nbsp;产品总数:&nbsp;{{ 10 }} -->
                        </div>
                    </div>
                    <div class="button_group">
                        <el-button @click="showAllProjectList" type="primary">新增产品</el-button>
                        <!-- <el-button @click="showGanttChart(ganttData2, 2)" type="primary">甘特图</el-button> -->
                        <el-button type="success" @click="updateProjectList">保存</el-button>
                        <el-button type="danger" @click="deleteProject">删除</el-button>
                    </div>
                        <!-- show-overflow-tooltip
                        @current-change="checkedItem" -->
                    <el-table
                        ref="projectTableRef"
                        :data="projectBathcTable.tableData"
                        @selection-change="selectionChange"
                        highlight-current-row
                        scrollbar-always-on
                        height="calc(100% - 123px)"
                        border style="width: calc(100% - 20px); margin: 10px 10px;">
                        <el-table-column type="selection" width="40" fixed />
                        <el-table-column
                            label="SAP删除"
                            width="100"
                            align="center">
                            <template #default="scope">
                                <el-icon :size="20" v-if="scope.row.is_delete === 1"><RemoveFilled style="color: red"/></el-icon>
                            </template>
                        </el-table-column>
                        <el-table-column
                            v-for="(item, index) in projectBathcTable.tableColumns"
                            :key="index"
                            :prop="item.prop"
                            :label="item.label"
                            :min-width="item.width">
                            <template v-if="item.prop === 'zt_pl_pk'" #default="scope">
                                <el-select
                                    v-model="scope.row.zt_pl_pk"
                                    placeholder="批次币种"
                                    disabled
                                    clearable>
                                    <el-option
                                        v-for="(item, index) in distList.factory"
                                        :key="index"
                                        :label="item.WERKS_TEXT"
                                        :value="item.WERKS" />
                                </el-select>
                            </template>
                            <template v-else-if="item.prop === 'zt_sb_bpcsl'" #default="scope">
                                <el-input-number controls-position="right" v-model="scope.row.zt_sb_bpcsl" :precision="2" :step="1" :max="scope.row.ZT_SYWFPSL_JY" :min="0" />
                            </template>
                            <template v-else-if="item.prop === 'zt_description'" #default="scope">
                                <el-input v-model="scope.row.zt_description"  />
                            </template>
                        </el-table-column>
                    </el-table>
                </el-card>
                <div class="bottom_content">
                    <el-card shadow="never" class="planning_card" body-style="padding: 0px; height: 100%;">
                        <div class="base_title">
                            <!-- <div>产品计划 - {{ checkedProject.zt_mil_wlmc_mc ? `${checkedProject.zt_mil_wlmc_mc} (${checkedProject.zt_mil_wlgg})` : '请选择产品' }}</div> -->
                            <div>批次计划</div>
                            <div>任务数:&nbsp;{{ planningTable.tableData.length }}
                                <!-- &nbsp;&nbsp;|&nbsp;&nbsp;完成率:&nbsp;{{ 10 }}% -->
                            </div>
                        </div>
                        <div class="button_group">
                            <el-button @click="showGanttChart(ganttData2, 2)" type="primary">甘特图</el-button>
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
                                :min-width="item.width">
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
                                <template v-else-if="item.prop === 'remarks'" #default="scope">
                                    <el-input v-model="scope.row.remarks" :placeholder="scope.row.remarks_notes"  />
                                </template>
                                <template v-else-if="item.prop === 'planned_start'" #default="scope">
                                    <el-date-picker
                                        v-model="scope.row.planned_start"
                                        type="date"
                                        placeholder="计划开始"
                                        clearable
                                        format="YYYY-MM-DD"
                                        value-format="YYYY-MM-DD"
                                        style="width: 100%"
                                    />
                                </template>
                                <template v-else-if="item.prop === 'planned_duration'" #default="scope">
                                    <el-input-number controls-position="right" v-model="scope.row.planned_duration" :precision="0" :step="1" />
                                </template>
                                <template v-else-if="item.prop === 'planned_finish'" #default="scope">
                                    {{ getplanned_finish(scope.row) }}
                                </template>
                                <template v-else-if="item.prop === 'actual_start'" #default="scope">
                                    <el-date-picker
                                        v-model="scope.row.actual_start"
                                        type="date"
                                        placeholder="实际开始"
                                        clearable
                                        format="YYYY-MM-DD"
                                        value-format="YYYY-MM-DD"
                                        style="width: 100%"
                                    />
                                </template>
                                <template v-else-if="item.prop === 'actual_duration'" #default="scope">
                                    <el-input-number controls-position="right" v-model="scope.row.actual_duration" :precision="0" :step="1" />
                                </template>
                                <template v-else-if="item.prop === 'actual_finish'" #default="scope">
                                    {{ getactual_finish(scope.row) }}
                                </template>
                                
                            </el-table-column>
                        </el-table>
                    </el-card>
                    <!-- <el-card shadow="never" class="components_card" body-style="padding: 0px; height: 100%;">
                        <div class="base_title">
                            <div>产品组件 - {{ '请选择物料' }}</div>
                            <div>组件数:&nbsp;{{ 0 }}
                                &nbsp;&nbsp;|&nbsp;&nbsp;库存充足:&nbsp;{{ 0 }}
                            </div>
                        </div>
                    </el-card> -->
                </div>
            </div>
        </div>

        <el-dialog
            v-model="projcetDialogVisible"
            title="选择项目"
            :close-on-click-modal="false"
            width="1600">
            <div style="display: flex; margin-bottom: 20px">
                <el-input style="width: 200px; margin-right: 20px" v-model="searchProjectAllForm.projNumber" placeholder="请输入项目编号查询"></el-input>
                <el-input style="width: 200px; margin-right: 20px" v-model="searchProjectAllForm.post1" placeholder="请输入项目名称查询"></el-input>
                <el-button type="primary" @click="searchProjectAllData">搜索</el-button>
            </div>
            <el-table
                :data="projectAllTable.tableData"
                v-loading="projectAllTable.loading"
                @row-dblclick="chooseProject"
                border
                height="50vh"
                style="width: 100%">
                <el-table-column
                    v-for="(item, index) in projectAllTable.tableColumns"
                    :key="index"
                    :prop="item.prop"
                    :label="item.label"
                    :min-width="item.width"
                    :align="item.align">
                </el-table-column>
                <el-table-column align="center" label="操作" width="120">
                    <template #default="scope">
                        <el-button type="primary" @click="chooseProject(scope.row)">
                        选择
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="table-pagination">
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
            </div>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="projcetDialogVisible = false">关闭</el-button>
                </div>
            </template>
        </el-dialog>

        <el-dialog
            v-model="dialogVisible"
            v-if="dialogVisible"
            :title="itemData.zt_sb_xmfhpch ? '编辑批次' : '新增批次'"
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
                    <!-- <el-form-item label="批次号:">
                        <el-input disabled v-model="itemData.zt_sb_xmfhpch" placeholder="批次号" clearable />
                    </el-form-item> -->
                    <el-form-item label="项目批次号:">
                        <el-input disabled v-model="itemData.zt_batch_number" placeholder="项目批次号" clearable />
                    </el-form-item>
                    <el-form-item label="发货批次-顺序号:" prop="zt_batch_import">
                        <el-input @input="updateItem" v-model="itemData.zt_batch_import" placeholder="输入A\B\C等字段" clearable />
                    </el-form-item>
                </div>
                <div class="line_flex">
                    <el-form-item label="批次名称:" prop="zt_sb_xmfhpcmc">
                        <el-input v-model="itemData.zt_sb_xmfhpcmc" placeholder="批次名称" clearable />
                    </el-form-item>
                    <el-form-item label="批次状态:" prop="zt_pczt_pd">
                        <el-select
                            v-model="itemData.zt_pczt_pd"
                            placeholder="批次状态"
                            clearable>
                            <el-option
                                v-for="(item, index) in distList.status"
                                :key="index"
                                :label="item"
                                :value="item" />
                        </el-select>
                    </el-form-item>
                </div>
                
                    <el-form-item label="批次币种:" prop="zt_tc_hbdm">
                        <el-select
                            v-model="itemData.zt_tc_hbdm"
                            placeholder="批次币种"
                            clearable>
                            <el-option
                                v-for="(item, index) in distList.currency"
                                :key="index"
                                :label="item"
                                :value="item" />
                        </el-select>
                    </el-form-item>
                <div class="line_flex">
                    <el-form-item label="批次金额（原币）:">
                        <el-input-number disabled controls-position="right" v-model="itemData.zt_pc_batch_amount_yb" :precision="2" :step="1" />
                    </el-form-item>
                    <el-form-item label="批次金额（本币）:">
                        <el-input-number disabled controls-position="right" v-model="itemData.zt_pc_batch_amount_bb" :precision="2" :step="1" />
                    </el-form-item>
                </div>
                <div class="line_flex">
                    <el-form-item label="FAT时间:" prop="zt01_fat_date">
                        <el-date-picker
                            v-model="itemData.zt01_fat_date"
                            type="date"
                            placeholder="FAT时间"
                            clearable
                            format="YYYY-MM-DD"
                            value-format="YYYY-MM-DD"
                            style="width: 100%"
                        />
                    </el-form-item>
                    <el-form-item label="预计发货时间:" prop="zt01_fh_date">
                        <el-date-picker
                            v-model="itemData.zt01_fh_date"
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
                    <el-input v-model="itemData.zt_description" placeholder="备注" clearable />
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button :loading="dialogLoading" @click="dialogVisible = false">取消</el-button>
                    <el-button :loading="dialogLoading" type="primary" @click="saveItem">保存</el-button>
                </div>
            </template>
        </el-dialog>

        <el-dialog
            v-model="projcetBatchDialogVisible"
            v-if="projcetBatchDialogVisible"
            title="新增批次产品"
            :close-on-click-modal="false"
            width="1200">
            <el-table
                ref="multipleTableRef"
                :data="projectBatchAllTable.tableData"
                row-key="id"
                v-loading="projectBatchAllTable.loading"
                @selection-change="handleSelectionChange"
                show-overflow-tooltip border
                scrollbar-always-on
                height="60vh"
                style="width: 100%">
                <el-table-column type="selection" width="40" fixed />
                <el-table-column
                    label="SAP删除"
                    width="100"
                    align="center">
                    <template #default="scope">
                        <el-icon :size="20" v-if="scope.row.is_delete === 1"><RemoveFilled style="color: red"/></el-icon>
                    </template>
                </el-table-column>
                <el-table-column
                    v-for="(item, index) in projectBatchAllTable.tableColumns"
                    :key="index"
                    :prop="item.prop"
                    :label="item.label"
                    :min-width="item.width"
                    :align="item.align">
                    <template v-if="item.prop === 'zt_pl_pk'" #default="scope">
                        <el-select
                            disabled
                            v-model="scope.row.zt_pl_pk"
                            @change="pushUpdateFactory(scope.row)"
                            placeholder="工厂">
                            <el-option
                                v-for="(item, index) in distList.factory"
                                :key="index"
                                :label="item.WERKS_TEXT"
                                :value="item.WERKS" />
                        </el-select>
                    </template>
                    <template v-else-if="item.prop === 'ZT_SYWFPSL'" #default="scope">
                        <el-input-number controls-position="right" v-model="scope.row.ZT_SYWFPSL" :precision="2" :step="1" :max="scope.row.ZT_SYWFPSL_JY" :min="0" />
                    </template>
                    <template v-else-if="item.prop === 'zt_sb_bpcsl'" #default="scope">
                        {{ scope.row.zt_sb_bpcsl = scope.row.ZT_SYWFPSL + (scope.row.zt_sb_bpcsl_01 || 0) }}
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
                    v-model:current-page="projectBatchAllTable.pageNum"
                    v-model:page-size="projectBatchAllTable.pageSize"
                    :page-sizes="[20, 50, 100]"
                    background
                    layout="sizes, prev, pager, next"
                    :total="projectBatchAllTable.total"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                />
            </div> -->
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="projcetBatchDialogVisible = false">取消</el-button>
                    <el-button :loading="dialogLoading" v-if="false" :disabled="updateFactoryList.length === 0" type="primary" @click="updateFactory">更新工厂</el-button>
                    <el-button :loading="dialogLoading" :disabled="checkedSelectionList.length === 0" type="primary" @click="updateProject">保存</el-button>
                </div>
            </template>
        </el-dialog>

        <el-dialog v-if="ganttChartVisible" v-model="ganttChartVisible" body-class="gantt-chart-body" title="甘特图" :close-on-click-modal="false" fullscreen>
            <Gantt :dataList="projectGanttData" :type="ganttType" @updateTask="updateTask"></Gantt>
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
import { RemoveFilled } from '@element-plus/icons-vue'
import axios from "../assets/axios/index.js";
import Gantt from '../components/GanttChart.vue'

const loading = ref(false);
const searchName = ref("");
const leftLoading = ref(false);
const leftList = ref([]);
const projcetDialogVisible = ref(false);
const dialogVisible = ref(false);
const projcetBatchDialogVisible = ref(false);
const ruleFormRef = useTemplateRef('ruleFormRef');
const itemData = ref({});
const activeIndex = ref(null);
const rules = ref({
    zt_batch_import: [
        { required: true, message: '请输入发货批次-顺序号', trigger: 'blur' },
    ],
    zt_sb_xmfhpcmc: [
        { required: true, message: '请输入批次名称', trigger: 'blur' },
    ],
    zt_pczt_pd: [
        { required: true, message: '请选择批次状态', trigger: 'change' },
    ],
    zt_tc_hbdm: [
        { required: true, message: '请选择批次币种', trigger: 'change' },
    ],
    zt01_fat_date: [
        { required: true, message: '请输入FAT时间', trigger: 'change' },
    ],
    zt01_fh_date: [
        { required: true, message: '请输入预计发货时间', trigger: 'change' },
    ],
})
const distList = ref({
    status: ['设计中', '生产中', '完工待发', '已发货待确认', '已发货'],
    currency: ['CNY', 'EUR', 'GBP', 'USD'],
    factory: [],
})

const projectInfo = ref({})

const projectAllTable = ref({
    tableColumns: [
        {label: '商机编号', prop: 'zzsjbh', width: 90},
        {label: '项目编号', prop: 'proj_number'},
        {label: '项目名称', prop: 'post1', width: 230},
        {label: '业务洲区', prop: 'zzdywb8', width: 120},
        {label: '业务片区', prop: 'zzdywb10', width: 80},
        {label: '客户编码', prop: 'zzdywb1', width: 80},
        {label: '客户名称', prop: 'zzdywb2', width: 180},
        {label: '项目币种', prop: 'zzdywb4'},
        {label: '结算金额', prop: 'zkhjsjez'},
    ],
    tableData: [],
    pageNum: 1,
    pageSize: 20,
    total: 0,
    projNumber: '',
    post1: '',
    loading: false,
})

const projectBathcTable = ref({
    tableColumns: [
        {label: '物料编码', prop: 'zt_mil_wlbm', width: 180},
        {label: '物料名称', prop: 'zt_mil_wlmc_mc', width: 350},
        {label: '物料型号', prop: 'zt_mil_wlgg', width: 150},
        {label: '工厂', prop: 'zt_pl_pk', width: 350},
        {label: '数量', prop: 'zt_sb_bpcsl', width: 210},
        {label: '单位', prop: 'zt_mil_jldw', width: 130},
        {label: '站点', prop: 'zt_mcr_zd', width: 200},
        {label: '柜号', prop: 'zt_mcr_gh', width: 200},
        {label: '本批次下单金额（原币）', prop: 'Product_Amount_YB', width: 200},
        {label: '本批次下单金额（本币）', prop: 'Product_Amount_BB', width: 200},
        // {label: '备注', prop: 'zt_description', width: 330},
        // {label: '批次标识号', prop: 'ZT01_AUTO_0001', width: 150},
        // {label: '产品标识号', prop: 'ZT01_AUTO_0001_01', width: 150},
        // {label: '产品数量', prop: 'ZT_CPSL', width: 150},
        {label: '已分批', prop: 'ZT_PAL_YFPSL', width: 150},
    ],
    tableData: []
})

const projectBatchAllTable = ref({
    pageNum: 1,
    pageSize: 1000,
    total: 0,
    tableColumns: [
        {label: '物料编码', prop: 'zt_mil_wlbm', width: 150},
        {label: '物料名称', prop: 'zt_mil_wlmc_mc', width: 300},
        {label: '物料型号', prop: 'zt_mil_wlgg', width: 150},
        // {label: '复核数量（报价系统复核）', prop: 'zt_quantity', width: 200},
        {label: '下单数量（SAP下单数量）', prop: 'ZT01_YXD', width: 200},
        {label: '已分批数量', prop: 'ZT_PAL_YFPSL', width: 130},
        {label: '本次分批数量', prop: 'ZT_SYWFPSL', width: 180},
        {label: '计量单位', prop: 'zt_mil_jldw', width: 100, align: 'center'},
        {label: '工厂', prop: 'zt_pl_pk', width: 250},
        {label: '站点', prop: 'zt_mcr_zd', width: 200},
        {label: '柜号', prop: 'zt_mcr_gh', width: 200},
        // {label: '报价系统', prop: 'ZT01_BJ_TB', width: 130, align: 'center'},
        // {label: 'ERP系统', prop: 'ZT01_SAP_TB', width: 130, align: 'center'},
        // {label: '产品标识号', prop: 'ZT01_AUTO_0001', width: 130},
        // {label: '批次标识号', prop: 'ZT01_AUTO_0001_01', width: 130},
        {label: '当前批次', prop: 'zt_sb_bpcsl_01', width: 130},
        {label: '分配后批次', prop: 'zt_sb_bpcsl', width: 130},
        {label: '产品数量 - 校验', prop: 'ZT_SYWFPSL_JY', width: 130},
        {label: '序号', prop: 'zt_auto_number', width: 200},
    ],
    tableData: []
})
const planningTable = ref({
    tableColumns: [
        {label: '作业名称', prop: 'TASK_NAME', width: 200},
        {label: '作业状态', prop: 'STATUS', width: 120},
        {label: '备注', prop: 'remarks', width: 250},
        // {label: '标准计划开始', prop: 'MB_planned_start', width: 120},
        // {label: '标准计划工期', prop: 'MB_planned_duration', width: 120},
        // {label: '标准计划完成', prop: 'MB_planned_finish', width: 120},
        {label: '计划开始', prop: 'planned_start', width: 170},
        {label: '计划工期', prop: 'planned_duration', width: 170},
        {label: '计划完成', prop: 'planned_finish', width: 120},
        {label: '实际开始', prop: 'actual_start', width: 170},
        {label: '实际工期', prop: 'actual_duration', width: 170},
        {label: '实际完成', prop: 'actual_finish', width: 120},
    ],
    tableData: []
})

const multipleTableRef = useTemplateRef('multipleTableRef');
const projectTableRef = useTemplateRef('projectTableRef');
let projectId = null

onMounted(() => {
    // projectId = window.location.href.split('?')[1].split('=')[1]
    axios.getDictList(projectId).then(res => {
    //     distList.value.status = res.data.data.pczt
    //     distList.value.currency = res.data.data.pcbz
        distList.value.factory = res.data.data.factory
    })
    // getLeftList()
});

const showPorjcetList = () => {
    projcetDialogVisible.value = true;
    getAllProjectList()
}

const chooseProject = (item) => {
    projectBathcTable.value.tableData = [];
    planningTable.value.tableData = [];
    projectGanttData.value = [];
    checkedProject.value = {};
    checkedSelectionList.value = [];
    checkedProjectList = [];
    activeIndex.value = null;
    projectId = item.proj_number
    projectInfo.value = item
    getLeftList()
    getGanttData1()
    projcetDialogVisible.value = false;
}

const ganttData1 = ref([])
const getGanttData1 = () => {
    axios.getGanttData1(projectId)
    .then(res => {
        ganttData1.value = setGanttData(res.data.data, 1);
    })
}

const addListItem = () => {
    if(!projectInfo.value.proj_number)
    return ElMessage.info('请先选择项目');
    itemData.value = {
        zt_batch_number: projectInfo.value.proj_number,
        zt_batch_import: "",
        zt_sb_xmfhpch: "",
        zt_sb_xmfhpcmc: "",
        zt_pczt_pd: "",
        zt_tc_hbdm: "",
        zt_pc_batch_amount_yb: "",
        zt_pc_batch_amount_bb: "",
        zt01_fat_date: "",
        zt01_fh_date: "",
        zt_description: "",
        zt_prj_number: projectId
    }
    dialogVisible.value = true;
}

const editItem = (item) => {
    itemData.value = item;
    dialogVisible.value = true;
}

const updateItem = () => {
    itemData.value.zt_batch_number = itemData.value.zt_batch_import ? `${projectInfo.value.proj_number}-${itemData.value.zt_batch_import}` : projectInfo.value.proj_number
}

function getLeftList() {
    activeIndex.value = null;
    leftLoading.value = true;
    axios.getLeftList({projNumber: projectId, ztSbXmfhpcmc: searchName.value, post1: projectInfo.value.post1})
    .then(res => {
        leftList.value = res.data.data;
        // leftList.value.slot()
        leftLoading.value = false;
    })
}

let dialogLoading = ref(false)
const saveItem = async () => {
    await ruleFormRef.value.validate((valid, fields) => {
        if (valid) {
            dialogLoading.value = true;
            axios.updateLeftItem(itemData.value)
            .then(res => {
                if(res.data.code === 200) {
                    itemData.value.id ? ElMessage.success('修改成功') : ElMessage.success('新增成功')
                    getLeftList()
                    dialogVisible.value = false;
                    dialogLoading.value = false;
                } else {
                    ElMessage.error(res.data.msg)
                    dialogLoading.value = false;
                }
            })
        }
    })
}

const selectItem = (item, index) => {
    projectBathcTable.value.tableData = [];
    planningTable.value.tableData = [];
    projectGanttData.value = [];
    checkedProject.value = {};
    checkedSelectionList.value = [];
    checkedProjectList = [];
    activeIndex.value = index;
    getProjectList()
    checkedItem()
    // getGanttData2()
}

const ganttData2 = ref([])
const getGanttData2 = () => {
    axios.getGanttData2(leftList.value[activeIndex.value].zt_sb_xmfhpch)
    .then(res => {
        ganttData2.value = setGanttData(res.data.data);
    })
}

const getProjectList = () => {
    axios.getProjectList({projNumber: projectInfo.value.proj_number, waers: projectInfo.value.zzdywb4, ztBatchId: leftList.value[activeIndex.value].id})
    .then(res => {
        projectBathcTable.value.tableData = res.data.data;
        if(res.data.data.length > 0) {
            // nextTick(() => {
            //     projectTableRef.value.setCurrentRow(projectBathcTable.value.tableData[0]);
            // })
        }
    })
}

const showAllProjectList = () => {
    if(activeIndex.value === null)
    return ElMessage.info('请先选择批次');
    getAllProjectBatchList()
    .then(res => {
        projcetBatchDialogVisible.value = true;
    })
}

const updateProjectList = () => {
    if(activeIndex.value === null)
    return ElMessage.info('请先选择批次');
    loading.value = true;
    projectBathcTable.value.tableData.forEach(el => {
        el.zt_batch_number = leftList.value[activeIndex.value].zt_batch_number
    })
    axios.updateProject(projectBathcTable.value.tableData)
    .then(res => {
        getProjectList()
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
        '提示',
        {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
    .then(() => {
        loading.value = true;
        const ids = checkedProjectList.map(el => el.id)
        axios.deleteProject(ids)
        .then(res => {
            getProjectList()
            ElMessage.success('删除成功')
            loading.value = false;
        })
    })
    .catch(() => {})
}

const checkedProject = ref({})
const projectGanttData = ref([])
const ganttType = ref(null)
const ganttData3 = ref([])
const checkedItem = (item) => {
    axios.getPlanningList(leftList.value[activeIndex.value].zt_sb_xmfhpch)
    .then(res => {
        planningTable.value.tableData = res.data.data;
    })
    getGanttData2()
    // if(item) {
    //     checkedProject.value = item
    //     // axios.getPlanningList(item.id)
    //     axios.getPlanningList(leftList.value[activeIndex.value].zt_sb_xmfhpch)
    //     .then(res => {
    //         planningTable.value.tableData = res.data.data;
    //     })
    //     axios.getGanttData3(item.id)
    //     .then(res => {
    //         ganttData3.value = setGanttData(res.data.data);
    //     })
    // } else {
    //     checkedProject.value = {}
    // }
}

const setGanttData = (data, val) => {
    data.forEach(el => {
        el.open = true
        el.MB_planned_start = el.MB_planned_start && `${el.MB_planned_start.substring(0, 10)}`
        el.MB_planned_finish = el.MB_planned_finish && `${el.MB_planned_finish.substring(0, 10)}`
        el.planned_start = el.planned_start && `${el.planned_start.substring(0, 10)}`
        el.planned_finish = el.planned_finish && `${el.planned_finish.substring(0, 10)}`
        el.actual_start = el.actual_start && `${el.actual_start.substring(0, 10)}`
        el.actual_finish = el.actual_finish && `${el.actual_finish.substring(0, 10)}`
        el.start_date = el.planned_start && `${el.planned_start} 00:00:00` || ""
        el.duration = el.planned_duration
        // el.id = el.ID
        // el.parent = String(el.parent_id_01 || el.PARENT_ID)
        el.parent = val === 1 ? String(el.PARENT_ID) : String(el.parent_id_01)
        // el.parent = el.id !== 275 ? String(el.PARENT_ID_01) : '0'
        if(el.TASK_TYPE === 'WBS') el.type = 'project';
        else if(el.TASK_TYPE === 'TASK') el.type = 'task';
        el.text = el.TASK_NAME
        el.remarks = el.remarks || ""
        el.actual_start = el.actual_start || ""
        el.actual_duration = el.actual_duration || ""
        el.actual_finish = el.actual_finish || ""
        // el.STATUS = ['未开始', '进行中', '已完成'][el.STATUS]
    })
    return data
}

const getplanned_finish = (item) => {
    if(item.planned_start && item.planned_duration) {
        let time = new Date(new Date(item.planned_start).getTime() + item.planned_duration * 24 * 60 * 60 * 1000)
        item.planned_finish = `${time.getFullYear() + '-' + (time.getMonth() + 1 < 10 ? '0' + (time.getMonth() + 1) : time.getMonth() + 1) + '-' + (time.getDate() < 10 ? '0' + time.getDate() : time.getDate())}`
        return item.planned_finish
    }
}
const getactual_finish = (item) => {
    if(item.actual_start && item.actual_duration) {
        let time = new Date(new Date(item.actual_start).getTime() + item.actual_duration * 24 * 60 * 60 * 1000)
        item.actual_finish = `${time.getFullYear() + '-' + (time.getMonth() + 1 < 10 ? '0' + (time.getMonth() + 1) : time.getMonth() + 1) + '-' + (time.getDate() < 10 ? '0' + time.getDate() : time.getDate())}`
        return item.actual_finish
    }
}

const getAllProjectBatchList = async () => {
    checkedSelectionList.value = [];
    updateFactoryList.value = [];
    projectBatchAllTable.value.loading = true;
    axios.getAllProjectBatchList({projNumber: projectInfo.value.proj_number, waers: leftList.value[activeIndex.value].zt_tc_hbdm, ztBatchId: leftList.value[activeIndex.value].id})
    .then(res => {
        projectBatchAllTable.value.tableData = res.data.data;
        projectBatchAllTable.value.loading = false;
    })
}

let checkedSelectionList = ref([])
const handleSelectionChange = (list, val) => {
    checkedSelectionList.value = list
}

const getAllProjectList = () => {
    projectAllTable.value.loading = true;
    axios.getAllProjectList({ pageNum: projectAllTable.value.pageNum, pageSize: projectAllTable.value.pageSize, projNumber: projectAllTable.value.projNumber, post1: projectAllTable.value.post1 })
    .then(res => {
        projectAllTable.value.tableData = res.data.data.records;
        projectAllTable.value.total = res.data.data.total;
        projectAllTable.value.loading = false;
    })
}

let searchProjectAllForm = ref({
    projNumber: '',
    post1: ''
})
const searchProjectAllData = () => {
    projectAllTable.value.projNumber = searchProjectAllForm.value.projNumber;
    projectAllTable.value.post1 = searchProjectAllForm.value.post1;
    getAllProjectList()
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
    updateFactoryList.value.find(el => el.ZT01_AUTO_0001 === row.ZT01_AUTO_0001).zt_pl_pk = row.zt_pl_pk;
    else
    updateFactoryList.value.push(row);
}

const updateFactory = () => {
    dialogLoading.value = true;
    axios.updateTheFactory(updateFactoryList.value)
    .then(res => {
        ElMessage.success(res.data.msg)
        updateFactoryList.value = []
        getAllProjectBatchList()
        dialogLoading.value = false;
    })
}

const updateProject = () => {
    if(updateFactoryList.value.length > 0) {
        return ElMessage.info('检测到有工厂信息未更新，请先更新工厂信息！')
    }
    checkedSelectionList.value.forEach(el => {
        el.pcid = leftList.value[activeIndex.value].id;
        el.zt_prj_number = leftList.value[activeIndex.value].zt_prj_number;
        el.zt_sb_xmfhpch = leftList.value[activeIndex.value].zt_sb_xmfhpch;
        el.zt_sb_xmfhpcmc = leftList.value[activeIndex.value].zt_sb_xmfhpcmc;
        // el.RECORD_NO = leftList.value[activeIndex.value].RECORD_NO;
        el.zt01_fat_date = leftList.value[activeIndex.value].zt01_fat_date;
        el.zt_batch_number = leftList.value[activeIndex.value].zt_batch_number
    })
    dialogLoading.value = true;
    axios.updatePopUp(checkedSelectionList.value)
    .then(res => {
        getProjectList()
        getLeftList()
        ElMessage.success(res.data.msg)
        checkedSelectionList.value = []
        projcetBatchDialogVisible.value = false
        dialogLoading.value = false;
    })
}

const ganttChartVisible = ref(false)
const showGanttChart = (dataList, type) => {
    console.log(dataList)
    if(dataList.length === 0) {
        return ElMessage.info('暂无计划数据')
    }
    // dataList
    // planningTable.value.tableData.forEach(el => {
    //     el.start_date = el.MB_planned_start && `${el.MB_planned_start} 00:00:00`
    //     el.duration = el.MB_planned_duration
    // })
    projectGanttData.value = dataList
    ganttType.value = type
    ganttChartVisible.value = true;
}
const updatePlanningList = () => {
    // if(!checkedProject.value.zt_mil_wlmc_mc) {
    //     return ElMessage.info('请先选择批次产品')
    // }
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
        >:first-child {
            width: 25%;
            max-height: 100%;
            overflow: hidden;
            overflow-y: auto;
            // >:first-child {
            //     height: 30%;
            // }
            // >:last-child {
            //     height: calc(70% - 10px);
            // }
            >div {
                width: 100%;
            }
        }
        .left_card {
            // width: 25%;
            margin-top: 10px;
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
                    width: calc(100% - 6px);
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