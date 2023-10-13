import Api from '@/helpers/Api/Connection.js';
import store from '@/store';
import router from '@/router'

let Auth = {
  async login(data) {
      let result = await Api.postAsync('/auth/login', data);

      if (result.code == 200) {
        store.dispatch('setToken', result.response.token);
        router.go();
      } else {
        console.error (result.response);
      }
  },
  async logout() {
    let result = await Api.postAsync('/auth/logout');
    store.dispatch('removeToken');

    if (result.code == 200) {
      store.dispatch('removeToken');
      router.go();
    } else {
      console.error (result.response);
    }
  },
  async register(data) {
    let result = await Api.postAsync('/auth/register', data);

    if (result.code == 200) {
      store.dispatch('setToken', result.response.token);
      router.go();
    } else {
      console.error (result.response);
    }
  },
}

export default Auth;