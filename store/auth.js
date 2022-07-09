const state = () => ({
  userFunctionalities: undefined,
  userId: undefined,
  restrictAccessToClients: undefined,
  accessToken: undefined,
});

const mutations = {
  SET_USER_FUNCTIONALITIES(state, payload) {
    if (payload) {
      state.userFunctionalities = payload.functionalities;
      state.userId = payload.userId;
      state.restrictAccessToClients = payload.restrictAccessToClients;
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
    state.userFunctionalities = undefined;
    state.userId = undefined;
    state.restrictAccessToClients = undefined;
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
        temp.$axios.get(process.env.BACKEND_API_URL + 'functionality/mappings/currentUser', {
          headers: {
            Accept: "application/json",
            Authorization: temp.$cookiz.get('accessToken')
          }
        }).then(function (response) {
          state.commit('SET_USER_FUNCTIONALITIES', response.data.data);
          temp.app.router.push("/");
          resolve(response);
        }).catch(function (error) {
          reject(error);
        });
        resolve(response);
      }).catch(function (error) {
        reject(error);
      });
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
};

export default {
  state, mutations, actions, getters,
};

