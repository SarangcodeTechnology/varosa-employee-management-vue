export const state = () => ({
  isPrinting: false,
});

export const mutations = {
  SET_PRINTING(state, value) {
    state.isPrinting = !!value;
    console.log("isPrinting updated to: " + state.isPrinting);
  },
};

const actions = {
  setIsPrinting({ commit }, value) {
    commit("SET_PRINTING", value);
  },
};

const getters = {
  isPrinting() {
    return state.isPrinting;
  },
};

export default {
  state,
  mutations,
  actions,
  getters,
};
