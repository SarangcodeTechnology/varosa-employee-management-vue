import Vue from 'vue'
import Router from 'vue-router'
import { normalizeURL, decode } from 'ufo'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _398594a8 = () => interopDefault(import('../pages/bank.vue' /* webpackChunkName: "pages/bank" */))
const _3868e124 = () => interopDefault(import('../pages/category.vue' /* webpackChunkName: "pages/category" */))
const _56e384d8 = () => interopDefault(import('../pages/change-password.vue' /* webpackChunkName: "pages/change-password" */))
const _743c970d = () => interopDefault(import('../pages/client-roster.vue' /* webpackChunkName: "pages/client-roster" */))
const _0569eac8 = () => interopDefault(import('../pages/clients.vue' /* webpackChunkName: "pages/clients" */))
const _fc652af4 = () => interopDefault(import('../pages/dashain-sheet.vue' /* webpackChunkName: "pages/dashain-sheet" */))
const _484cc36c = () => interopDefault(import('../pages/employee-roster.vue' /* webpackChunkName: "pages/employee-roster" */))
const _0c3863c5 = () => interopDefault(import('../pages/employees.vue' /* webpackChunkName: "pages/employees" */))
const _140c35d0 = () => interopDefault(import('../pages/holiday.vue' /* webpackChunkName: "pages/holiday" */))
const _54952df7 = () => interopDefault(import('../pages/leave.vue' /* webpackChunkName: "pages/leave" */))
const _108604ec = () => interopDefault(import('../pages/leave-payout.vue' /* webpackChunkName: "pages/leave-payout" */))
const _e9d3b4ae = () => interopDefault(import('../pages/login.vue' /* webpackChunkName: "pages/login" */))
const _560ba78c = () => interopDefault(import('../pages/salary.vue' /* webpackChunkName: "pages/salary" */))
const _2b8517da = () => interopDefault(import('../pages/settings.vue' /* webpackChunkName: "pages/settings" */))
const _5181a89f = () => interopDefault(import('../pages/sheet.vue' /* webpackChunkName: "pages/sheet" */))
const _422abbbb = () => interopDefault(import('../pages/user.vue' /* webpackChunkName: "pages/user" */))
const _7d22fadc = () => interopDefault(import('../pages/index.vue' /* webpackChunkName: "pages/index" */))

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
    component: _398594a8,
    meta: {"name":"BankManagement"},
    name: "bank"
  }, {
    path: "/category",
    component: _3868e124,
    meta: {"name":"CategoryManagement"},
    name: "category"
  }, {
    path: "/change-password",
    component: _56e384d8,
    meta: {"name":"ChangePassword"},
    name: "change-password"
  }, {
    path: "/client-roster",
    component: _743c970d,
    meta: {"name":"ClientRoster"},
    name: "client-roster"
  }, {
    path: "/clients",
    component: _0569eac8,
    meta: {"name":"ClientManagement","validations":{"editedItem":{"siteName":{},"address":{},"phone":{}},"employeeMappings":{"newMapping":{"category":{},"quantity":{}}}}},
    name: "clients"
  }, {
    path: "/dashain-sheet",
    component: _fc652af4,
    meta: {"name":"DashainWorkingCalculation"},
    name: "dashain-sheet"
  }, {
    path: "/employee-roster",
    component: _484cc36c,
    meta: {"name":"EmployeeRoster"},
    name: "employee-roster"
  }, {
    path: "/employees",
    component: _0c3863c5,
    meta: {"name":"EmployeeManagement","validations":{"editedItem":{"vsNo":{},"staffName":{},"phone":{},"category":{},"dateOfBirth":{},"assignedHours":{},"basicHours":{}},"clientMappings":{"newMapping":{"client":{}}}}},
    name: "employees"
  }, {
    path: "/holiday",
    component: _140c35d0,
    meta: {"name":"HolidayManagement"},
    name: "holiday"
  }, {
    path: "/leave",
    component: _54952df7,
    meta: {"name":"LeaveHistory"},
    name: "leave"
  }, {
    path: "/leave-payout",
    component: _108604ec,
    meta: {"name":"Leave Payout"},
    name: "leave-payout"
  }, {
    path: "/login",
    component: _e9d3b4ae,
    meta: {"name":"Login","layout":"login","validations":{"email":{},"password":{}}},
    name: "login"
  }, {
    path: "/salary",
    component: _560ba78c,
    meta: {"name":"SalaryDetails"},
    name: "salary"
  }, {
    path: "/settings",
    component: _2b8517da,
    meta: {"name":"settings"},
    name: "settings"
  }, {
    path: "/sheet",
    component: _5181a89f,
    meta: {"name":"MonthlySalarySheet"},
    name: "sheet"
  }, {
    path: "/user",
    component: _422abbbb,
    meta: {"name":"UserManagement","validations":{"clientMappings":{"newMapping":{"client":{}}}}},
    name: "user"
  }, {
    path: "/",
    component: _7d22fadc,
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
