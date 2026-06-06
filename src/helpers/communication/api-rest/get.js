import axios, { handleResponse } from "./axios-config.js";

export default async function get(route, params) {
  return await handleResponse(
    axios.get(route, {
      params,
      withCredentials: false,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json;charset=utf-8'
      }
    })
  );
}
