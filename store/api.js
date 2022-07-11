const state = () => ({});

const mutations = {};

const actions = {
  async makeGetRequest({dispatch, state, rootGetters}, payload) {
    let temp = this;
    return await this.$axios.get(process.env.BACKEND_API_URL + payload.route, {
        headers: {
          Accept: "application/json",
          Authorization: rootGetters["auth/accessToken"]
        }
      }
    ).then(function (response) {
      return (response);
    }).catch(function (error) {
      console.log( error.response.data.status+" "+error.response.data.error)
      return (error);
    });

  }
};

const getters = {};

export default {
  state, mutations, actions, getters,
};

