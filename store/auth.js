const state = () => ({
  userFunctionalities: [],
  allUserFunctionalities: [],
  userId: null,
  restrictAccessToClients: false,
  accessToken: null,
});

const mutations = {
  SET_USER_FUNCTIONALITIES(state, payload) {
    if (payload) {
      state.userFunctionalities = payload.functionalities;
      state.userId = payload.userId;
      state.restrictAccessToClients = payload.restrictAccessToClients;
    }
  }, SET_ALL_USER_FUNCTIONALITIES(state, payload) {
    if (payload) {
      state.allUserFunctionalities = payload;
    }
  },
  SET_ACCESS_TOKEN(state, payload) {
    let accessToken = "Bearer " + payload;
    state.accessToken = accessToken;
    this.$cookiz.set('accessToken', accessToken, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    })
  },
  UNSET_USER(state) {
    state.userFunctionalities = [];
    state.allUserFunctionalities = [];
    state.userId = undefined;
    state.restrictAccessToClients = false;
    state.accessToken = undefined;
  }
};

const actions = {
  loginOrRegister(state, payload) {
    let temp = this;
    return new Promise((resolve, reject) => {
      this.$axios.post(process.env.BACKEND_API_URL + payload.route, payload.data, {
        headers: {
          Accept: "application/json",
        }
      }).then(function (response) {
        state.commit('SET_ACCESS_TOKEN', response.headers.authorization);
        state.dispatch("getAllActiveFunctionalitiesMappings");
        state.dispatch("getCurrentUserFunctionalitiesMappings");
        temp.app.router.push("/");
        resolve(response);
      }).catch(function (error) {
        reject(error);
      });
    });
  },
  async getAllActiveFunctionalitiesMappings(state) {
    const temp = this;
    await this.$axios.get(process.env.BACKEND_API_URL + 'functionality/getAll/active', {
      headers: {
        Accept: "application/json",
        Authorization: temp.$cookiz.get('accessToken')
      }
    }).then(function (response) {
      state.commit('SET_ALL_USER_FUNCTIONALITIES', response.data.data);
      return response;
    }).catch(function (error) {
      return error;
    });
  },
  async getCurrentUserFunctionalitiesMappings(state) {
    const temp = this;
    temp.$axios.get(process.env.BACKEND_API_URL + 'functionality/mappings/currentUser', {
      headers: {
        Accept: "application/json",
        Authorization: temp.$cookiz.get('accessToken')
      }
    }).then(function (response) {
      state.commit('SET_USER_FUNCTIONALITIES', response.data.data);
      return(response);
    }).catch(function(error){
      return (error);
    });
  }, logout(state) {
    state.commit("UNSET_USER");
    this.$cookiz.remove('accessToken');
    this.app.router.push("/login");
  },

};

const getters = {
  accessToken(state) {
    return state.accessToken;
  },
  allUserFunctionalities(state) {
    return state.allUserFunctionalities;
  },
  userFunctionalities(state) {
    return state.userFunctionalities;
  }
};

export default {
  state, mutations, actions, getters,
};

