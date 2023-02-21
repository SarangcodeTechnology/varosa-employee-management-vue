import Vue from 'vue'
import Router from 'vue-router'
import { normalizeURL, decode } from 'ufo'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _7ef4e6f2 = () => interopDefault(import('..\\pages\\bank.vue' /* webpackChunkName: "pages/bank" */))
const _b5f1fe6e = () => interopDefault(import('..\\pages\\category.vue' /* webpackChunkName: "pages/category" */))
const _1f21e71d = () => interopDefault(import('..\\pages\\change-password.vue' /* webpackChunkName: "pages/change-password" */))
const _a26e72dc = () => interopDefault(import('..\\pages\\client-roster.vue' /* webpackChunkName: "pages/client-roster" */))
const _2ac53be6 = () => interopDefault(import('..\\pages\\clients.vue' /* webpackChunkName: "pages/clients" */))
const _b7cffee2 = () => interopDefault(import('..\\pages\\employee-roster.vue' /* webpackChunkName: "pages/employee-roster" */))
const _726b1dca = () => interopDefault(import('..\\pages\\employees.vue' /* webpackChunkName: "pages/employees" */))
const _49a54746 = () => interopDefault(import('..\\pages\\holiday.vue' /* webpackChunkName: "pages/holiday" */))
const _2057b27c = () => interopDefault(import('..\\pages\\leave.vue' /* webpackChunkName: "pages/leave" */))
const _0cb95e72 = () => interopDefault(import('..\\pages\\leave-payout.vue' /* webpackChunkName: "pages/leave-payout" */))
const _56d8aa2e = () => interopDefault(import('..\\pages\\login.vue' /* webpackChunkName: "pages/login" */))
const _fcef8f56 = () => interopDefault(import('..\\pages\\salary.vue' /* webpackChunkName: "pages/salary" */))
const _a90e3524 = () => interopDefault(import('..\\pages\\settings.vue' /* webpackChunkName: "pages/settings" */))
const _1d442d24 = () => interopDefault(import('..\\pages\\sheet.vue' /* webpackChunkName: "pages/sheet" */))
const _1f731296 = () => interopDefault(import('..\\pages\\user.vue' /* webpackChunkName: "pages/user" */))
const _e59df1d2 = () => interopDefault(import('..\\pages\\index.vue' /* webpackChunkName: "pages/index" */))

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
    component: _7ef4e6f2,
    meta: {"name":"BankManagement"},
    name: "bank"
  }, {
    path: "/category",
    component: _b5f1fe6e,
    meta: {"name":"CategoryManagement"},
    name: "category"
  }, {
    path: "/change-password",
    component: _1f21e71d,
    meta: {"name":"ChangePassword"},
    name: "change-password"
  }, {
    path: "/client-roster",
    component: _a26e72dc,
    meta: {"name":"ClientRoster"},
    name: "client-roster"
  }, {
    path: "/clients",
    component: _2ac53be6,
    meta: {"name":"ClientManagement","validations":{"editedItem":{"siteName":{},"address":{},"phone":{}},"employeeMappings":{"newMapping":{"category":{},"quantity":{}}}}},
    name: "clients"
  }, {
    path: "/employee-roster",
    component: _b7cffee2,
    meta: {"name":"EmployeeRoster"},
    name: "employee-roster"
  }, {
    path: "/employees",
    component: _726b1dca,
    meta: {"name":"EmployeeManagement","validations":{"editedItem":{"vsNo":{},"staffName":{},"phone":{},"category":{},"dateOfBirth":{},"assignedHours":{},"basicHours":{}},"clientMappings":{"newMapping":{"client":{}}}}},
    name: "employees"
  }, {
    path: "/holiday",
    component: _49a54746,
    meta: {"name":"HolidayManagement"},
    name: "holiday"
  }, {
    path: "/leave",
    component: _2057b27c,
    meta: {"name":"LeaveHistory"},
    name: "leave"
  }, {
    path: "/leave-payout",
    component: _0cb95e72,
    meta: {"name":"Leave Payout"},
    name: "leave-payout"
  }, {
    path: "/login",
    component: _56d8aa2e,
    meta: {"name":"Login","layout":"login","validations":{"email":{},"password":{}}},
    name: "login"
  }, {
    path: "/salary",
    component: _fcef8f56,
    meta: {"name":"SalaryDetails"},
    name: "salary"
  }, {
    path: "/settings",
    component: _a90e3524,
    meta: {"name":"settings"},
    name: "settings"
  }, {
    path: "/sheet",
    component: _1d442d24,
    meta: {"name":"MonthlySalarySheet"},
    name: "sheet"
  }, {
    path: "/user",
    component: _1f731296,
    meta: {"name":"UserManagement","validations":{"clientMappings":{"newMapping":{"client":{}}}}},
    name: "user"
  }, {
    path: "/",
    component: _e59df1d2,
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
