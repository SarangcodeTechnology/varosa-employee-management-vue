const state = () => ({
  snackbars:[]
});

const mutations = {
  SET_SNACKBAR(state,snackbar){
    state.snackbars=state.snackbars.concat(snackbar);
  }
};

const actions = {
  setSnackbar({commit},snackbar){
    snackbar.showing=true;
    snackbar.color=snackbar.color || "success";
    snackbar.title=snackbar.title || false;
    snackbar.icon=snackbar.icon || "fa-solid fa-circle-check";
    snackbar.timeout=snackbar.timeout || "3000";
    commit('SET_SNACKBAR',snackbar);
  }
};

const getters = {
  snackbars(state) {
    return state.snackbars;
  },
};

export default {
  state, mutations, actions, getters,
};

