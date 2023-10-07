import axios from 'axios';

let API = {
  verifyUserToken() {
    axios.get(`http://127.0.0.1:8000/api/user/token`)
    .then(response => {
      // JSON responses are automatically parsed.
      return response.data
    })
    .catch(e => {
      return this.errors.push(e)
    })
  },
}

export default API;