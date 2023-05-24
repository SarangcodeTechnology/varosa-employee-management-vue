export const ColumnFreezedDataTable = () => import('../../components/columnFreezedDataTable.vue' /* webpackChunkName: "components/column-freezed-data-table" */).then(c => wrapFunctional(c.default || c))
export const ConfirmDialog = () => import('../../components/confirmDialog.vue' /* webpackChunkName: "components/confirm-dialog" */).then(c => wrapFunctional(c.default || c))
export const Toast = () => import('../../components/toast.vue' /* webpackChunkName: "components/toast" */).then(c => wrapFunctional(c.default || c))

// nuxt/nuxt.js#8607
function wrapFunctional(options) {
  if (!options || !options.functional) {
    return options
  }

  const propKeys = Array.isArray(options.props) ? options.props : Object.keys(options.props || {})

  return {
    render(h) {
      const attrs = {}
      const props = {}

      for (const key in this.$attrs) {
        if (propKeys.includes(key)) {
          props[key] = this.$attrs[key]
        } else {
          attrs[key] = this.$attrs[key]
        }
      }

      return h(options, {
        on: this.$listeners,
        attrs,
        props,
        scopedSlots: this.$scopedSlots,
      }, this.$slots.default)
    }
  }
}
