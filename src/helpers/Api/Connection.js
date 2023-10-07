import axios from "axios";
import store from '@/store';

axios.defaults.baseURL = "http://ehubapp.com/api";
axios.defaults.headers.common['Authorization'] = "Bearer " + store.getters.getToken;

// axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
//axios.defaults.headers.options['Access-Control-Allow-Origin'] = '*';

let Api = {
  get(route, params) {
    axios.get(route, {
      data : JSON.stringify(params),
      withCredentials: false,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json;charset=utf-8',
        'Access-Control-Allow-Origin': '*',
                  'Access-Control-Allow-Headers': '*',
                  'Access-Control-Allow-Credentials': 'true'
      }
    })
    .then(response => {
      // JSON responses are automatically parsed.
      return { 
        code: response.status,
        response : response.data
      };
    })
    .catch(e => {
      return { 
        code: e.status,
        response : this.errors.push(e)
      };
    })
  },

  post(route, params) {
    axios.post(route, params, {
      //data : JSON.stringify(params),
      //withCredentials: true,
      headers: {
        //'Accept': 'application/json',
        'Content-Type': 'application/json',
        //'Access-Control-Allow-Origin': '*',
        //'Access-Control-Allow-Headers': '*',
        //'Access-Control-Allow-Credentials': 'true'
      }
    })
    .then(response => {
      // JSON responses are automatically parsed.
      return { 
        code: response.status,
        response : response.data
      };
    })
    .catch(e => {
      return { 
        code: e.status,
        response : e.data
      };
    })
  },

  async postAsync(route, params) {
    return await axios.post(route, params, {
      //data : JSON.stringify(params),
      //withCredentials: true,
      headers: {
        //'Accept': 'application/json',
        'Content-Type': 'application/json',
        //'Access-Control-Allow-Origin': '*',
        //'Access-Control-Allow-Headers': '*',
        //'Access-Control-Allow-Credentials': 'true'
      }
    })
    .then(response => {
      // JSON responses are automatically parsed.
      return { 
        code: response.status,
        response : response.data
      };
    })
    .catch(e => {
      return { 
        code: e.status,
        response : this.errors.push(e)
      };
    })
  },

};

export default Api;