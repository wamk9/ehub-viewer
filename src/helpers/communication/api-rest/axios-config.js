import axios from "axios";
import SystemVars from '@/helpers/General/SystemVars';

axios.defaults.baseURL = SystemVars.baseUrlAPI;
axios.defaults.withCredentials = true;

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
