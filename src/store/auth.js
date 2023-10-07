const auth =  {
  state: {
    token: null,
  },
  mutations: {
    SET_TOKEN(state, payload) {
      state.token = payload;
    }
  },
  actions: {
    setToken(context, payload) {
      const token = context.state.token
      token.push(payload)
      context.commit('SET_TOKEN', token)
    }
  },
  getters: {
  },
};