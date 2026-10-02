import axios from "axios";
import SystemVars from '@/helpers/General/SystemVars';

axios.defaults.baseURL = SystemVars.baseUrlAPI;
axios.defaults.withCredentials = true;

// Axios only sends X-XSRF-TOKEN to the page's own origin. In production the
// viewer and the API share ehubapp.com; locally they run on different ports,
// so the token is allowed explicitly — and only for the eHub API origin.
const apiOrigin = new URL(SystemVars.baseUrl, window.location.href).origin;
axios.defaults.withXSRFToken = (config) => {
  try {
    return new URL(config.url, config.baseURL || window.location.href).origin === apiOrigin;
  } catch {
    return false;
  }
};

// The API answers (validation messages, e-mails) in the language the person is using.
axios.interceptors.request.use((config) => {
  try {
    const lang = localStorage.getItem('lang');
    if (lang) config.headers['Accept-Language'] = lang;
  } catch { /* storage unavailable */ }
  return config;
});

// 419 = expired/missing CSRF token: fetch a fresh one and retry once.
axios.interceptors.response.use(undefined, async (error) => {
  const config = error.config;
  if (error.response?.status === 419 && config && !config._csrfRetried) {
    config._csrfRetried = true;
    await axios.get('/sanctum/csrf-cookie', { baseURL: SystemVars.baseUrl });
    return axios(config);
  }
  return Promise.reject(error);
});

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
      params,
      headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
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
