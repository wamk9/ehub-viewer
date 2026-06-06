import axios, { handleResponse } from "./axios-config.js";

export default async function del(route, params = {}) {
  return await handleResponse(
    axios.delete(route, {
      params,
      withCredentials: false,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json;charset=utf-8'
      }
    })
  );
}
