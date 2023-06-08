import Vue from 'vue'
import Router from 'vue-router'
import { normalizeURL, decode } from 'ufo'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _189b65c8 = () => interopDefault(import('../pages/bank.vue' /* webpackChunkName: "pages/bank" */))
const _3fc75cec = () => interopDefault(import('../pages/category.vue' /* webpackChunkName: "pages/category" */))
const _3d952988 = () => interopDefault(import('../pages/change-password.vue' /* webpackChunkName: "pages/change-password" */))
const _3446731e = () => interopDefault(import('../pages/client-roster.vue' /* webpackChunkName: "pages/client-roster" */))
const _fdab15a8 = () => interopDefault(import('../pages/clients.vue' /* webpackChunkName: "pages/clients" */))
const _1924cc2c = () => interopDefault(import('../pages/dashain-sheet.vue' /* webpackChunkName: "pages/dashain-sheet" */))
const _662b84ae = () => interopDefault(import('../pages/employee-roster.vue' /* webpackChunkName: "pages/employee-roster" */))
const _cc0035ae = () => interopDefault(import('../pages/employees.vue' /* webpackChunkName: "pages/employees" */))
const _71ba6f7c = () => interopDefault(import('../pages/holiday.vue' /* webpackChunkName: "pages/holiday" */))
const _6a05fd4a = () => interopDefault(import('../pages/leave.vue' /* webpackChunkName: "pages/leave" */))
const _14305908 = () => interopDefault(import('../pages/leave-payout.vue' /* webpackChunkName: "pages/leave-payout" */))
const _017df90d = () => interopDefault(import('../pages/login.vue' /* webpackChunkName: "pages/login" */))
const _2b8cc556 = () => interopDefault(import('../pages/salary.vue' /* webpackChunkName: "pages/salary" */))
const _32e393a2 = () => interopDefault(import('../pages/settings.vue' /* webpackChunkName: "pages/settings" */))
const _702d07fa = () => interopDefault(import('../pages/sheet.vue' /* webpackChunkName: "pages/sheet" */))
const _7788ebd7 = () => interopDefault(import('../pages/user.vue' /* webpackChunkName: "pages/user" */))
const _37d655f6 = () => interopDefault(import('../pages/index.vue' /* webpackChunkName: "pages/index" */))

const emptyFn = () => {}

Vue.use(Router)

export const routerOptions = {
  mode: 'history',
  base: '/',
  linkActiveClass: 'nuxt-link-active',
  linkExactActiveClass: 'nuxt-link-exact-active',
  scrollBehavior,

  routes: [{
    path: "/bank",
    component: _189b65c8,
    meta: {"name":"BankManagement"},
    name: "bank"
  }, {
    path: "/category",
    component: _3fc75cec,
    meta: {"name":"CategoryManagement"},
    name: "category"
  }, {
    path: "/change-password",
    component: _3d952988,
    meta: {"name":"ChangePassword"},
    name: "change-password"
  }, {
    path: "/client-roster",
    component: _3446731e,
    meta: {"name":"ClientRoster"},
    name: "client-roster"
  }, {
    path: "/clients",
    component: _fdab15a8,
    meta: {"name":"ClientManagement","validations":{"editedItem":{"siteName":{},"address":{},"phone":{}},"employeeMappings":{"newMapping":{"category":{},"quantity":{}}}}},
    name: "clients"
  }, {
    path: "/dashain-sheet",
    component: _1924cc2c,
    meta: {"name":"DashainWorkingCalculation"},
    name: "dashain-sheet"
  }, {
    path: "/employee-roster",
    component: _662b84ae,
    meta: {"name":"EmployeeRoster"},
    name: "employee-roster"
  }, {
    path: "/employees",
    component: _cc0035ae,
    meta: {"name":"EmployeeManagement","validations":{"editedItem":{"vsNo":{},"staffName":{},"phone":{},"category":{},"dateOfBirth":{},"assignedHours":{},"basicHours":{}},"clientMappings":{"newMapping":{"client":{}}}}},
    name: "employees"
  }, {
    path: "/holiday",
    component: _71ba6f7c,
    meta: {"name":"HolidayManagement"},
    name: "holiday"
  }, {
    path: "/leave",
    component: _6a05fd4a,
    meta: {"name":"LeaveHistory"},
    name: "leave"
  }, {
    path: "/leave-payout",
    component: _14305908,
    meta: {"name":"Leave Payout"},
    name: "leave-payout"
  }, {
    path: "/login",
    component: _017df90d,
    meta: {"name":"Login","layout":"login","validations":{"email":{},"password":{}}},
    name: "login"
  }, {
    path: "/salary",
    component: _2b8cc556,
    meta: {"name":"SalaryDetails"},
    name: "salary"
  }, {
    path: "/settings",
    component: _32e393a2,
    meta: {"name":"settings"},
    name: "settings"
  }, {
    path: "/sheet",
    component: _702d07fa,
    meta: {"name":"MonthlySalarySheet"},
    name: "sheet"
  }, {
    path: "/user",
    component: _7788ebd7,
    meta: {"name":"UserManagement","validations":{"clientMappings":{"newMapping":{"client":{}}}}},
    name: "user"
  }, {
    path: "/",
    component: _37d655f6,
    meta: {"name":"Dashboard"},
    name: "index"
  }],

  fallback: false
}

export function createRouter (ssrContext, config) {
  const base = (config._app && config._app.basePath) || routerOptions.base
  const router = new Router({ ...routerOptions, base  })

  // TODO: remove in Nuxt 3
  const originalPush = router.push
  router.push = function push (location, onComplete = emptyFn, onAbort) {
    return originalPush.call(this, location, onComplete, onAbort)
  }

  const resolve = router.resolve.bind(router)
  router.resolve = (to, current, append) => {
    if (typeof to === 'string') {
      to = normalizeURL(to)
    }
    return resolve(to, current, append)
  }

  return router
}
