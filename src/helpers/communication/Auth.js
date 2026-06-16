import Api from '@/helpers/communication/Connection';
import store from '@/store';
import router from '@/router'

let Auth = {
  async login(data) {
      let result = await Api.postAsync('/auth/login', data);

      if (result.code == 200) {
        store.dispatch('setToken', result.response.token);
        router.go();
      }
  },
  async logout() {
    let result = await Api.postAsync('/auth/logout');
    store.dispatch('removeToken');

    if (result.code == 200) {
      store.dispatch('removeToken');
      router.go();
    }
  },
  async register(data) {
    let result = await Api.postAsync('/auth/register', data);

    if (result.code == 200) {
      store.dispatch('setToken', result.response.token);
      router.go();
    }
  },
  verifyUserToken() {
    Api.get('/user/token')
    .then(response => {
      // JSON responses are automatically parsed.
      return response.data
    })
    .catch(e => {
      return this.errors.push(e)
    })
  },
}

export default Auth;