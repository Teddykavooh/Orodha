import axios from "axios";

// Simple API wrapper. Call setToken(token) after login to attach Authorization header.
const instance = axios.create({
  baseURL: "/api", // frontend dev should proxy to backend or use full tenant domain
  headers: { "Content-Type": "application/json" },
});

function setToken(token) {
  if (token) {
    instance.defaults.headers.common["Authorization"] = `Token ${token}`;
  } else {
    delete instance.defaults.headers.common["Authorization"];
  }
}

setToken(localStorage.getItem("token"));

export default {
  get: (url, opts) => instance.get(url, opts),
  post: (url, data, opts) => instance.post(url, data, opts),
  put: (url, data, opts) => instance.put(url, data, opts),
  patch: (url, data, opts) => instance.patch(url, data, opts),
  delete: (url, opts) => instance.delete(url, opts),
  setToken,
};
