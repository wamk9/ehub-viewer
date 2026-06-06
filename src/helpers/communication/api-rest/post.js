import axios, { handleResponse } from "./axios-config.js";

export default async function post(route, data) {
  return await handleResponse(
    axios.post(route, data, {
      withCredentials: false,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json;charset=utf-8'
      }
    })
  );
}
