import { createStore } from 'vuex';

const auth = {
    state: {
        isAuthenticated: document.cookie.split(';').some(c => c.trim().startsWith('ehub_logged_in=')),
    },
    mutations: {
        SET_AUTH(state, value) {
            state.isAuthenticated = value;
        }
    },
    actions: {
        setAuthenticated(context, value) {
            context.commit('SET_AUTH', value);
        },
        setToken(context) {
            context.commit('SET_AUTH', true);
        },
        removeToken(context) {
            context.commit('SET_AUTH', false);
        }
    },
    getters: {
        isLoggedIn: state => state.isAuthenticated,
        getToken:   state => state.isAuthenticated,
    },
};

const store = createStore({
    modules: {
        auth: auth
    }
});

export default store;
