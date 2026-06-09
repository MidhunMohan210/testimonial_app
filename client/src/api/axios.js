import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
});

const environment = import.meta.env.VITE_ENVIRONMENT || "production";
if (environment === "development") {
  api.defaults.baseURL = "http://localhost:5001/";
} else if (environment === "staging") {
  api.defaults.baseURL = import.meta.env.VITE_PUBLIC_STAGING_URL || "";
} else {
  api.defaults.baseURL = import.meta.env.VITE_API_URL || "";
}

console.log(environment);
console.log(api.defaults.baseURL);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("testiflow_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("testiflow_token");
      localStorage.removeItem("testiflow_user");
      localStorage.removeItem("testiflow_business");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
