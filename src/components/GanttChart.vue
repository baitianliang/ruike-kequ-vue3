<template>
    <div style="height: 100%">
        <div style="height: 40px; margin: 0px 20px; display: flex; justify-content: space-between; align-items: center">
            <div>
                <el-button title="折叠" @click="close"><el-icon><Folder /></el-icon></el-button>
                <el-button title="展开" @click="open"><el-icon><FolderOpened /></el-icon></el-button>
                <el-button title="甘特图" @click="toggleChart"><el-icon><CreditCard /></el-icon></el-button>
                <el-select v-model="zoomValue" @change="changeZoom" style="width: 70px; margin-left: 12px">
                    <el-option
                        v-for="(item, index) in zoomConfig.levels"
                        :key="index"
                        :label="item.label"
                        :value="item.name"
                    />
                </el-select>
            </div>
            <!-- <el-button type="primary" @click="saveTask">保存数据</el-button> -->
        </div>
        <div style="height: calc(100% - 60px); margin: 20px; margin-top: 0px" ref="gantt"></div>
    </div>
</template>

<script setup>
import { Folder, FolderOpened, CreditCard } from '@element-plus/icons-vue'
import { h, render, onMounted, onUnmounted, ref, useTemplateRef } from "vue";
import { ElSelect, ElOption } from "element-plus";
import Gantt from "../utils/gantt/dhtmlxgantt.js";

const props = defineProps({
    dataList: {
        type: Array,
        requied: true
    },
    type: {
        type: Number,
        default: 0
    }
})
const ganttDom = useTemplateRef('gantt')
let zoomValue = ref('day')
// 时间范围配置
const zoomConfig = {
    levels: [
        {
            name:"day",
            label: "日",
            scale_height: 27,
            min_column_width:80,
            scales:[
                {unit: "day", step: 1, format: "%d %M", css: checkHighlight}
            ]
        },
        {
            name:"week",
            label: "周",
            scale_height: 50,
            min_column_width:50,
            scales:[
                {unit: "week", step: 1, format: function (date) {
                    var dateToStr = Gantt.date.date_to_str("%d %M");
                    var endDate = Gantt.date.add(date, 7 - date.getDay(), "day");
                    var weekNum = Gantt.date.date_to_str("%W")(date);
                    return "#" + weekNum + ", " + dateToStr(date) + " - " + dateToStr(endDate);
                }},
                {unit: "day", step: 1, format: "%j %D", css: checkHighlight}
            ]
        },
        {
            name:"month",
            label: "月",
            scale_height: 50,
            min_column_width:120,
            scales:[
                {unit: "month", format: "%F, %Y"},
                {unit: "week", format: "Week #%W"}
            ]
        },
        {
            name:"quarter",
            label: "季",
            height: 50,
            min_column_width:90,
            scales:[
                {unit: "month", step: 1, format: "%M"},
                {
                    unit: "quarter", step: 1, format: function (date) {
                        var dateToStr = Gantt.date.date_to_str("%M");
                        var endDate = Gantt.date.add(date, 2 - date.getMonth() % 3, "month");
                        return dateToStr(date) + " - " + dateToStr(endDate);
                    }
                }
            ]
        },
        {
            name:"year",
            label: "年",
            scale_height: 50,
            min_column_width: 30,
            scales:[
                {unit: "year", step: 1, format: "%Y"}
            ]
        }
    ],
    useKey: "ctrlKey",
    trigger: "wheel",
    element: function () {
        return Gantt.$root.querySelector(".gantt_task");
    }
};
onMounted(() => {
    Gantt.plugins({
		quick_info: true,
        critical_path: true,
		auto_scheduling: true,
		undo: true,
        // click_drag: true,
        // tooltip: true,
        export_api: true
	});
    // 初始化自定义提示
    // _inCustomTooltips()
    // 样式风格
    Gantt.setSkin("material");

    Gantt.config.layout = {
        css: "gantt_container",
        cols: [{
            width: 700,
            min_width: 300,
            rows: [
                { view: "grid", scrollX: "gridScroll", scrollable: true, scrollY: "scrollVer" },
                { view: "scrollbar", id: "gridScroll", group: "horizontalScrolls" }
            ]
        },
        { resizer: true, width: 1 },
        {
            rows: [
                { view: "timeline", scrollX: "scrollHor", scrollY: "scrollVer" },
                { view: "scrollbar", id: "scrollHor", group: "horizontalScrolls" }
            ]
        },
        { view: "scrollbar", id: "scrollVer" }]
    };

    Gantt.locale.labels.section_priority = "Priority";
    Gantt.config.multiselect = true;
    Gantt.config.drag_move = false;
    Gantt.config.drag_progress = false;
    Gantt.config.drag_resize = false;
    Gantt.config.drag_links = false;
	Gantt.attachEvent("onParse", function () {
		Gantt.eachTask(function (task) {
			if (Gantt.hasChild(task.id)) {
				task.type = Gantt.config.types.project;
				Gantt.updateTask(task.id);
			} else if (task.duration === 0) {
				task.type = Gantt.config.types.milestone;
				Gantt.updateTask(task.id);
			}
		});
	});

    Gantt.attachEvent("onTaskDblClick", function(id,e){
        // 可以在这里添加自定义逻辑
        return false;
    });
    Gantt.config.show_quick_info = false
    
    Gantt.attachEvent("onLightbox", function(id){
        return false;
    });
    Gantt.config.grid_elastic_columns = true;
    // 清除删除按钮
    Gantt.attachEvent("onGanttReady", function(){
        Gantt.config.buttons_left = [];
    });

    // Gantt.config.readonly = true;
    Gantt.config.work_time = true;
	Gantt.config.details_on_create = false
    // 动态时间轴
	Gantt.ext.zoom.init(zoomConfig);
	Gantt.ext.zoom.setLevel("day");
    // 配置表格列
    _inConfigColumns()
    Gantt.i18n.setLocale("cn");
	Gantt.config.static_background = true;
	Gantt.config.xml_date = "%Y-%m-%d %H:%i";
    // 初始化dom
    Gantt.init(ganttDom.value);
    // 填入数据
    Gantt.parse({data: props.dataList})
    Gantt.parse({data: []})
    Gantt.refreshData()
})
onUnmounted(() => {
    Gantt.clearAll()
    // // 销毁甘特图
    // if (Gantt.destructor) {
    //     Gantt.getGanttInstance().destructor();
    // }
})
// 初始化自定义提示
function _inCustomTooltips() {
    Gantt.attachEvent("onGanttReady", function () {
        var tooltips = Gantt.ext.tooltips;
        Gantt.templates.tooltip_text = function (start, end, task) {
            var store = Gantt.getDatastore("resource");
            var assignments = task[Gantt.config.resource_property] || [];
            var owners = [];
            assignments.forEach(function (assignment) {
                var owner = store.getItem(assignment.resource_id)
                owners.push(owner.text);
            });
            return "<b>Task:</b> " + task.text + "<br/>" +
                "<b>Owner:</b>" + owners.join(",") + "<br/>" +
                "<b>Start date:</b> " +
                Gantt.templates.tooltip_date_format(start) +
                "<br/><b>End date:</b> " + Gantt.templates.tooltip_date_format(end);
        };
        tooltips.tooltipFor({
            selector: ".gantt_task_link",
            html: function (event, node) {
                var linkId = node.getAttribute(Gantt.config.link_attribute);
                if (linkId) {
                    var link = Gantt.getLink(linkId);
                    var from = Gantt.getTask(link.source);
                    var to = Gantt.getTask(link.target);
                    return [
                        "<b>类型:</b> " + linkTypeToString(link.type),
                        "<b>从: </b> " + from.text,
                        "<b>到: </b> " + to.text
                    ].join("<br>");
                }
            }
        });
        tooltips.tooltipFor({
            selector: ".gantt_row[resource_id]",
            html: function (event, node) {
                var resourceId = node.getAttribute("resource_id");
                var store = Gantt.getDatastore(Gantt.config.resource_store);
                var resource = store.getItem(resourceId);
                var assignments = getResourceAssignments(resource, store)
                var totalDuration = 0;
                for (var i = 0; i < assignments.length; i++) {
                    var task = Gantt.getTask(assignments[i].task_id);
                    totalDuration += task.duration * assignments[i].value;
                }
                return [
                    "<b>Resource:</b> " + resource.text,
                    "<b>Tasks assigned:</b> " + assignments.length,
                    "<b>Total load: </b>" + (totalDuration || 0) + "h"
                ].join("<br>");

            }
        });


        tooltips.tooltipFor({
            selector: ".gantt_scale_cell",
            html: function (event, node) {
                var relativePosition = Gantt.utils.dom.getRelativeEventPosition(event, Gantt.$task_scale);
                return Gantt.templates.tooltip_date_format(Gantt.dateFromPos(relativePosition.x));
            }
        });

        tooltips.tooltipFor({
            selector: ".gantt_resource_marker",
            html: function (event, node) {
                var dataElement = node.querySelector("[data-recource-tasks]");
                var ids = JSON.parse(dataElement.getAttribute("data-recource-tasks"));

                var date = Gantt.templates.parse_date(dataElement.getAttribute("data-cell-date"));
                var resourceId = dataElement.getAttribute("data-resource-id");

                var relativePosition = Gantt.utils.dom.getRelativeEventPosition(event, Gantt.$task_scale);

                var store = Gantt.getDatastore("resource");

                var html = [
                    "<b>" + store.getItem(resourceId).text + "</b>" + ", " + Gantt.templates.tooltip_date_format(date),
                    "",
                    ids.map(function (id, index) {
                        var task = Gantt.getTask(id);
                        var assignenment = Gantt.getResourceAssignments(resourceId, task.id);
                        var amount = "";
                        var taskIndex = (index + 1);
                        if (assignenment[0]) {
                            amount = " (" + assignenment[0].value + "h) ";
                        }
                        return "Task #" + taskIndex + ": " + amount + task.text;
                    }).join("<br>")
                ].join("<br>");

                return html;
            }
        });
    });
}
// 甘特图非工作日颜色
function checkHighlight(date, task) {
    if (!Gantt.isWorkTime({ date, task, unit: Gantt.getScale().unit })) {
        return "weekend";
    }
}

// 配置表格列
function _inConfigColumns() {
    // Gantt.attachEvent("onAfterTaskUpdate", function(id, task) {
    //     refreshSummaryProgress(Gantt.getParent(id), true);
    // });
    // 状态
    const statusSelectOptions = [
        {key: 0, label: "未开始"},
        {key: 1, label: "进行中"},
        {key: 2, label: "已完成"},
    ]
	Gantt.serverList("statusSelectOptions", statusSelectOptions);
    // if(props.type === 3)
    Gantt.config.columns = [
        {label: '作业名称', name: 'TASK_NAME', width: 200, align: "left", resize: true, tree: true},
        {label: '作业状态', name: 'STATUS', width: 120, align: "center", resize: true, editor: {type: "statusSelect", map_to: "STATUS", options:Gantt.serverList("statusSelectOptions")}, template: statusLabel},
        {label: '备注', name: 'remarks', width: 250, align: "center", resize: true, editor: {type: "text", map_to: "remarks"}},
        // {label: '标准计划开始', name: 'MB_planned_start', width: 120, align: "center", resize: true},
        // {label: '标准计划工期', name: 'MB_planned_duration', width: 120, align: "center", resize: true},
        // {label: '标准计划完成', name: 'MB_planned_finish', width: 120, align: "center", resize: true},
        {label: '计划开始', name: 'planned_start', width: 170, align: "center", resize: true, editor: {type: "date", map_to: "planned_start", min: new Date(2025, 1, 1), max: new Date(2026, 1, 1)}, template: PLANNED_START_LABEL},
        {label: '计划工期', name: 'planned_duration', width: 170, align: "center", resize: true, editor: {type: "number", map_to: "planned_duration"}, template: PLANNED_DURATION_LABEL},
        {label: '计划完成', name: 'planned_finish', width: 120, align: "center", resize: true},
        {label: '实际开始', name: 'actual_start', width: 170, align: "center", resize: true, editor: {type: "date", map_to: "actual_start", min: new Date(2025, 1, 1), max: new Date(2026, 1, 1)}, template: ACTUAL_START_LABEL},
        {label: '实际工期', name: 'actual_duration', width: 170, align: "center", resize: true, editor: {type: "number", map_to: "actual_duration"}, template: ACTUAL_DURATION_LABEL},
        {label: '实际完成', name: 'actual_finish', width: 120, align: "center", resize: true},
    ];
    // else
    // Gantt.config.columns = [
    //     {label: '作业名称', name: 'TASK_NAME', width: 200, align: "left", resize: true, tree: true},
    //     {label: '作业状态', name: 'STATUS', width: 120, align: "center", resize: true, editor: {type: "statusSelect", map_to: "STATUS", options:Gantt.serverList("statusSelectOptions")}, template: statusLabel},
    //     {label: '标准计划开始', name: 'MB_planned_start', width: 120, align: "center", resize: true},
    //     {label: '标准计划工期', name: 'MB_planned_duration', width: 120, align: "center", resize: true},
    //     {label: '标准计划完成', name: 'MB_planned_finish', width: 120, align: "center", resize: true},
    // ];
    
    const date_show = Gantt.config.editor_types.date.show
    const number_show = Gantt.config.editor_types.number.show
    const text_show = Gantt.config.editor_types.text.show
    // wbs数据禁止输入日期
    Gantt.config.editor_types.date.show = (o,s,l,c) => {
        let task = Gantt.getTask(o);
        if(task.type === "task") {
            date_show(o,s,l,c)
        }
    }
    Gantt.config.editor_types.date.set_value = (o,s,l,c) => {
        if(c.querySelector("input")) {
            c.querySelector("input") && (c.querySelector("input").value = o)
        }
    }
    // wbs数据禁止输入数字
    Gantt.config.editor_types.number.show = (i,a,r,o) => {
        let task = Gantt.getTask(i);
        if(task.type === "task") {
            number_show(i,a,r,o)
        }
    }
    Gantt.config.editor_types.number.set_value = (e,i,a,r) => {
        if(r.querySelector("input")) {
            r.querySelector("input") && (r.querySelector("input").value = e)
        }
    }
    Gantt.config.editor_types.number.get_value = (e,i,a) => {
        if(a.querySelector("input")) {
            return a.querySelector("input").value
        }
    }
    // 项目数据禁止输入
    Gantt.config.editor_types.text.show = (i,a,r,o) => {
        let task = Gantt.getTask(i);
        if(task.type === "task") {
            text_show(i,a,r,o)
        }
    }
    Gantt.config.editor_types.text.get_input = (e) => {
        // let obj = {value: projectName}
        return e.querySelector("input") || {value: ""}
    }

    let status = null
    Gantt.config.editor_types.statusSelect = {
        show: function (id, column, config, placeholder) {
            let task = Gantt.getTask(id);
            if(task.type === "task") {
                let node = document.createElement("div");
                node.className = "gantt-task-type-editor";
                status = task.STATUS
                // 创建select元素
                const select = h(ElSelect, {
                    modelValue: task.STATUS,
                    'onUpdate:modelValue': (val) => { this.set_value(val) },
                    // 'onUpdate:modelValue': (val) => { this.set_value(val); task.taskOwner = val; Gantt.updateTask(task.id) },
                    filterable: true,
                    placeholder: '请选择'
                }, statusSelectOptions.map(item => h(ElOption, {
                    key: item.key,
                    label: item.label,
                    value: item.key
                })));
                select.name = column.name
                render(select, node)
                placeholder.appendChild(node)
            }
        },
        hide: function () {},
        set_value: function (value, id, column, node) {
            status = value
        },
        get_value: function (id, column, node) {
            let task = Gantt.getTask(id);
            return status || task.STATUS
        },
        is_changed: function (value, id, column, node) {
            var currentValue = this.get_value(id, column, node);
            return value !== currentValue;
        },
        is_valid: function (value, id, column, node) {
            return true
        },
        focus: function (node) {
            // var input = node.querySelector("select");
            // if (!input) { return; }
            // if (input.focus) { input.focus(); }
            // if (input.select) { input.select(); }
        }
    }
}
function PLANNED_START_LABEL(task) {
    if(task.planned_start && task.planned_duration) {
        task.planned_finish = new Date(new Date(task.planned_start).getTime() + ((Number(task.planned_duration)) * 24 * 60 * 60 * 1000))
    }
    return task.planned_start
}
function PLANNED_DURATION_LABEL(task) {
    if(task.planned_start && task.planned_duration) {
        task.planned_finish = new Date(new Date(task.planned_start).getTime() + ((Number(task.planned_duration)) * 24 * 60 * 60 * 1000))
    }
    return task.planned_duration
}
function ACTUAL_START_LABEL(task) {
    if(task.actual_start && task.actual_duration) {
        task.actual_finish = new Date(new Date(task.actual_start).getTime() + ((Number(task.actual_duration)) * 24 * 60 * 60 * 1000))
    }
    return task.actual_start
}
function ACTUAL_DURATION_LABEL(task) {
    if(task.actual_start && task.actual_duration) {
        task.actual_finish = new Date(new Date(task.actual_start).getTime() + ((Number(task.actual_duration)) * 24 * 60 * 60 * 1000))
    }
    return task.actual_duration
}
function statusLabel(task) {
    if(task.type === "task") {
        const findItem = Gantt.serverList("statusSelectOptions").find(el => el.key == task.STATUS)
        if(findItem) {
            return findItem.label
        } else {
            return ""
        }
    } else {
        return ""
    }
}
function refreshSummaryProgress(id, submit) {
    if (!Gantt.isTaskExists(id))
    return;
    var task = Gantt.getTask(id);
    var newProgress = calculateSummaryProgress(task);
    if (newProgress !== task.progress) {
        task.progress = newProgress;
        if (!submit) {
            Gantt.refreshTask(id);
        } else {
            Gantt.updateTask(id);
        }
    }
    if (!submit && Gantt.getParent(id) !== Gantt.config.root_id) {
        refreshSummaryProgress(Gantt.getParent(id), submit);
    }
}

function calculateSummaryProgress(task) {
    if (task.type != Gantt.config.types.project)
        return task.progress;
    // var totalToDo = 0;
    // var totalDone = 0;
    // Gantt.eachTask(function (child) {
    //     if (child.type != Gantt.config.types.project) {
    //         totalToDo += child.duration;
    //         totalDone += (child.progress || 0) * child.duration;
    //     }
    // }, task.id);
    // if (!totalToDo) return 0;
    // else return totalDone / totalToDo;
    let allProgress = 0;
    let num = 0;
    Gantt.eachTask(function (child) {
        if (child.type != Gantt.config.types.project) {
            allProgress += child.progress || 0;
            num++;
        }
    }, task.id);
    if (num === 0) return 0;
    return allProgress / num;
}

// 展开父节点
function open() {
    Gantt.batchUpdate(function (task) {
        Gantt.eachTask(function (task) {
            task.$open = true;
        })
    })
}
// 关闭父节点
function close() {
    Gantt.batchUpdate(function (task) {
        Gantt.eachTask(function (task) {
            task.$open = false;
        })
    })
}
// 时间范围
function changeZoom(val) {
	Gantt.ext.zoom.setLevel(val);
}

const showChart = ref(true)
const onlyGrid = {
    css: "gantt_container",
    cols: [{
        rows: [
            { view: "grid", scrollX: "gridScroll", scrollable: true, scrollY: "scrollVer" },
            { view: "scrollbar", id: "gridScroll", group: "horizontalScrolls" }
        ]
    },
    { resizer: true, width: 1 }]
};

const gridAndChart = {
    css: "gantt_container",
    cols: [{
        width: 700,
        min_width: 300,
        rows: [
            { view: "grid", scrollX: "gridScroll", scrollable: true, scrollY: "scrollVer" },
            { view: "scrollbar", id: "gridScroll", group: "horizontalScrolls" }
        ]
    },
    { resizer: true, width: 1 },
    {
        rows: [
            { view: "timeline", scrollX: "scrollHor", scrollY: "scrollVer" },
            { view: "scrollbar", id: "scrollHor", group: "horizontalScrolls" }
        ]
    },
    { view: "scrollbar", id: "scrollVer" }]
};
// 显示图表
function toggleChart() {
    showChart.value = !showChart.value;
    if (showChart.value) {
        Gantt.config.layout = gridAndChart;
    } else {
        Gantt.config.layout = onlyGrid;
    }
    Gantt.init(ganttDom.value);
}

const emit = defineEmits(['updateTask'])
const saveTask = () => {
    const tasks = Gantt.serialize()
    const data = tasks.data.filter(el => el.type === "task")
    data.forEach(el => {
        el.actual_start = el.actual_start ? el.actual_start.substring(0, 10) : null
        el.actual_finish = el.actual_finish ? el.actual_finish.substring(0, 10) : null
        el.planned_start = el.planned_start ? el.planned_start.substring(0, 10) : null
        el.planned_finish = el.planned_finish ? el.planned_finish.substring(0, 10) : null
    });
    emit("updateTask", data)
}

</script>

<style lang="scss" scoped>
@import "../utils/gantt/dhtmlxgantt.css";

.gantt_task_cell.week_end, .gantt_task_cell.no_work_hour {
    background-color: var(--dhx-gantt-base-colors-background-alt);
}

.gantt_task_row.gantt_selected .gantt_task_cell.week_end {
    background-color: var(--dhx-gantt-base-colors-select);
}
.no-editor-row .gantt_editor {
    pointer-events: none !important;
    background-color: #f5f5f5 !important;
}

.dhx_menu {
    max-height: 400px;
    overflow: auto;
}

.gantt_grid_head_add {
    cursor: default;
}
.gantt_grid_head_add::before {
    display: none;
}
</style>