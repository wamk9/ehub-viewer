import axios, { handleResponse } from "./axios-config.js";

export default async function put(route, data) {
  return await handleResponse(
    axios.put(route, data, {
      withCredentials: false,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json;charset=utf-8'
      }
    })
  );
}
