import Api from '@/helpers/Api/Connection.js';

let User = {








  
  register(data) {
    axios.post(`http://127.0.0.1:8000/api/auth/register`, data)
    .then(response => {
      // JSON responses are automatically parsed.
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

export default User;