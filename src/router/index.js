import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        name: '项目批次管理系统',
        component: () => import('../views/PBMS.vue')
    },
    {
        path: '/ProductPlanningManagement',
        name: '产品计划管理',
        component: () => import('../views/ProductPlanningManagement.vue')
    },
]

const router = createRouter({
    history: createWebHashHistory(process.env.BASE_URL),
    routes
})

export default router