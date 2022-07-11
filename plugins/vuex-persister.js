import createPersistedState from 'vuex-persistedstate'

export default ({store}) => {
  createPersistedState({
    key: 'varosaHRMVuex',
    paths:["auth"]
  })(store)
}
