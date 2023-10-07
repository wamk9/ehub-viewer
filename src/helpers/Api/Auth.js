import Api from '@/helpers/Api/Connection.js';
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
  






  
  register(data) {
    axios.post(`http://127.0.0.1:8000/api/auth/register`, data)
    .then(response => {
      

      return response.data
    })
    .catch(e => {
      return e.data;
    })
  },
  verifyUserToken() {
    axios.get(`http://127.0.0.1:8000/api/user/token`)
    .then(response => {
      // JSON responses are automatically parsed.
      return response.data
    })
    .catch(e => {
      return e.data;
    })
  },
}

export default Auth;