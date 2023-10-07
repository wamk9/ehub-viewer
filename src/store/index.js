import VueCookies from 'vue-cookies'
import { createStore } from 'vuex';

//import  auth  from './auth.js';

const auth =  {
    state: {
      token: null,
    },
    mutations: {
      SET_TOKEN(state, payload) {
        if (payload === null)
          VueCookies.remove('token')
        else
          VueCookies.set('token', payload);

        state.token = payload;
      }
    },
    actions: {
      setToken(context, payload) {
        /*console.log(payload)
        const token = context.state.token
        token.push(payload)
*/      
        context.commit('SET_TOKEN', payload)
      },
      removeToken(context) {
        context.commit('SET_TOKEN', null)
      }
    },
    getters: {
      getToken: state => state.token || VueCookies.get('token'),
    },
  };

const store = createStore({
    modules: {
    auth : auth
  }
})

export default store;