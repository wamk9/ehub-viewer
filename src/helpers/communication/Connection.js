import axios from "axios";
import store from '@/store';
import SystemVars from '@/helpers/General/SystemVars';

axios.defaults.baseURL = SystemVars.baseUrlAPI;

axios.interceptors.request.use(config => {
  const token = store.getters.getToken
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

// axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
//axios.defaults.headers.options['Access-Control-Allow-Origin'] = '*';

const Api = {
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
        response : e.message
      };
    })
  },

  post(route, params) {
    axios.post(route, params, {
      //data : JSON.stringify(params),
      //withCredentials: true,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
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
        code: e.response.status,
        response : e.response.data
      };
    })
  },
  async postAsync(route, params) {
    return await axios.post(route, params, {
      //data : JSON.stringify(params),
      //withCredentials: true,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
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
        code: e.response.status,
        response : e.response.data
      };
    })
  },
  async getAsync(route, params) {
    return await axios.get(route, params, {
      //data : JSON.stringify(params),
      //withCredentials: true,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
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
        code: e.response.status,
        response : e.response.data
      };
    })
  },
  async patchAsync(route, params) {
    return await axios.patch(route, params, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + store.getters.getToken,
      }
    })
    .then(response => {
      return {
        code: response.status,
        response : response.data
      };
    })
    .catch(e => {
      return {
        code: e.response?.status || 500,
        response : e.response?.data || e.message
      };
    })
  },
  async deleteAsync(route, params) {
    return await axios.delete(route, {
      data: params,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + store.getters.getToken,
      }
    })
    .then(response => {
      return {
        code: response.status,
        response : response.data
      };
    })
    .catch(e => {
      return {
        code: e.response?.status || 500,
        response : e.response?.data || e.message
      };
    })
  },

};

export default Api;