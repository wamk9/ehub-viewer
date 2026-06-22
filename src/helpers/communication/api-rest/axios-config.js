import axios from "axios";
import SystemVars from '@/helpers/General/SystemVars';

axios.defaults.baseURL = SystemVars.baseUrlAPI;
axios.defaults.withCredentials = true;

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('ehub:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export const handleResponse = async (promise) => {
  try {
    const response = await promise;
    return {
      code: response.status,
      response: response.data
    };
  } catch (error) {
    throw {
      code: error.response?.status || 500,
      response: error.response?.data || error.message
    };
  }
};

export default axios;
