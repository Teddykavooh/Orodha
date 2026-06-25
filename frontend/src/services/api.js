import axios from "axios";

const  organisation = localStorage.getItem("organisation");
const protocol = window.location.protocol;
const port = window.location.port
  ? `:${window.location.port}`
  : "";
const host = window.location.hostname;

const API_URL = import.meta.env.VITE_PROXY_TARGET || 'https://orodha-backend.vercel.app'; // Fallback just in case

const API_URL2 = import.meta.env.VITE_PROXY_TARGET_CUSTOM || 'orodha-backend.vercel.app'

// Simple API wrapper. Call setToken(token) after login to attach Authorization header.

const instance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

const instance2 = axios.create({
  baseURL: `${protocol}//${organisation}.${API_URL2}/api`,
  headers: { "Content-Type": "application/json" },
});


function setToken(token) {
  // console.log("setToken: ", token)
  if (token) {
    instance.defaults.headers.common["Authorization"] = `Token ${token}`;
    instance2.defaults.headers.common["Authorization"] = `Token ${token}`;
  } else {
    delete instance.defaults.headers.common["Authorization"];
    delete instance2.defaults.headers.common["Authorization"];
  }
}

function setOrganisation(org) {
  // If org is null, undefined, or empty, save an empty string instead of "null"
  if (!org || org === "null" || org === "undefined") {
    localStorage.removeItem("organisation");
  } else {
    localStorage.setItem("organisation", org);
  }
}

setToken(localStorage.getItem("token"));
setOrganisation(localStorage.getItem("organisation"));

// Named Export 1: Public API Client
export const publicApi = {
  get: (url, opts) => instance.get(url, opts),
  post: (url, data, opts) => instance.post(url, data, opts),
  put: (url, data, opts) => instance.put(url, data, opts),
  patch: (url, data, opts) => instance.patch(url, data, opts),
  delete: (url, opts) => instance.delete(url, opts),
};

// Named Export 1: Tenant API Client
export const tenantApi = {
  get: (url, opts) => instance2.get(url, opts),
  post: (url, data, opts) => instance2.post(url, data, opts),
  put: (url, data, opts) => instance2.put(url, data, opts),
  patch: (url, data, opts) => instance2.patch(url, data, opts),
  delete: (url, opts) => instance2.delete(url, opts),
  setToken,
  setOrganisation
};