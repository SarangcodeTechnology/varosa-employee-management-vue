const state = () => ({});

const mutations = {};

const actions = {
  async makeGetRequest({ dispatch, state, rootGetters }, payload) {
    let temp = this;
    let params = payload.params || {};
    return await this.$axios
      .get(process.env.BACKEND_API_URL + payload.route, {
        headers: {
          Accept: "application/json",
          Authorization: rootGetters["auth/accessToken"],
        },
        params,
      })
      .then(function (response) {
        if (response.data.status === "OK") {
          return response;
        } else {
          dispatch(
            "toast/setSnackbar",
            {
              text: response.data.message,
              color: "error",
              icon: "fa-solid fa-circle-xmark",
            },
            { root: true }
          );
          return response;
        }
      })
      .catch(function (error) {
        console.log(
          error.response.data.status + " " + error.response.data.error
        );
        return error;
      });
  },
  async makePostRequest({ dispatch, state, rootGetters }, payload) {
    let temp = this;
    return await this.$axios
      .post(process.env.BACKEND_API_URL + payload.route, payload.data, {
        headers: {
          Accept: "application/json",
          Authorization: rootGetters["auth/accessToken"],
        },
      })
      .then(function (response) {
        if (response.data.status === "OK") {
          return response;
        } else {
          dispatch(
            "toast/setSnackbar",
            {
              text: response.data.message,
              color: "error",
              icon: "fa-solid fa-circle-xmark",
            },
            { root: true }
          );
          return response;
        }
      })
      .catch(function (error) {
        console.log(
          error.response.data.status + " " + error.response.data.error
        );
        return error;
      });
  },
  async makePostRequestFile({ dispatch, state, rootGetters }, payload) {
    let temp = this;
    return await this.$axios
      .post(process.env.BACKEND_API_URL + payload.route, payload.data, {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
          Authorization: rootGetters["auth/accessToken"],
        },
      })
      .then(function (response) {
        if (response.data.status === "OK") {
          return response;
        } else {
          dispatch(
            "toast/setSnackbar",
            {
              text: response.data.message,
              color: "error",
              icon: "fa-solid fa-circle-xmark",
            },
            { root: true }
          );
          return response;
        }
      })
      .catch(function (error) {
        console.log(
          error.response.data.status + " " + error.response.data.error
        );
        return error;
      });
  },
};

const getters = {};

export default {
  state,
  mutations,
  actions,
  getters,
};
