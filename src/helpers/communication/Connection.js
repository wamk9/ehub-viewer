import axios from "axios";
import SystemVars from '@/helpers/General/SystemVars';

axios.defaults.baseURL = SystemVars.baseUrlAPI;
axios.defaults.withCredentials = true;

const Api = {
  get(route, params) {
    axios.get(route, {
      data: JSON.stringify(params),
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json;charset=utf-8' }
    })
    .then(response => {
      return { code: response.status, response: response.data };
    })
    .catch(e => {
      return { code: e.status, response: e.message };
    })
  },

  post(route, params) {
    axios.post(route, params, {
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
    })
    .then(response => {
      return { code: response.status, response: response.data };
    })
    .catch(e => {
      return { code: e.response.status, response: e.response.data };
    })
  },

  async fetchCsrf() {
    return await axios.get('/sanctum/csrf-cookie', { baseURL: SystemVars.baseUrl });
  },

  async postAsync(route, params) {
    return await axios.post(route, params, {
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
    })
    .then(response => {
      return { code: response.status, response: response.data };
    })
    .catch(e => {
      return { code: e.response.status, response: e.response.data };
    })
  },

  async getAsync(route, params) {
    return await axios.get(route, {
      ...params,
      headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Pragma': 'no-cache', ...(params?.headers ?? {}) }
    })
    .then(response => {
      return { code: response.status, response: response.data };
    })
    .catch(e => {
      return { code: e.response?.status || 500, response: e.response?.data || e.message };
    })
  },

  async patchAsync(route, params) {
    return await axios.patch(route, params, {
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
    })
    .then(response => {
      return { code: response.status, response: response.data };
    })
    .catch(e => {
      return { code: e.response?.status || 500, response: e.response?.data || e.message };
    })
  },

  async postFormAsync(route, formData) {
    return await axios.post(route, formData, {
      headers: { 'Accept': 'application/json' }
    })
    .then(response => {
      return { code: response.status, response: response.data };
    })
    .catch(e => {
      return { code: e.response?.status || 500, response: e.response?.data || e.message };
    })
  },

  async deleteAsync(route, params) {
    return await axios.delete(route, {
      data: params,
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
    })
    .then(response => {
      return { code: response.status, response: response.data };
    })
    .catch(e => {
      return { code: e.response?.status || 500, response: e.response?.data || e.message };
    })
  },
};

export default Api;
