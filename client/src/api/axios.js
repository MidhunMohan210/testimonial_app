import axios from "axios";
import { getApiBaseUrl } from "../lib/apiUrl";

const api = axios.create({
  baseURL: getApiBaseUrl(),
});

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

    if (error.response?.status === 403 && error.response?.data?.code === "ACCOUNT_SUSPENDED") {
      const rawBusiness = localStorage.getItem("testiflow_business");
      if (rawBusiness) {
        try {
          const business = JSON.parse(rawBusiness);
          localStorage.setItem(
            "testiflow_business",
            JSON.stringify({ ...(business || {}), accountStatus: "suspended" }),
          );
        } catch {
          localStorage.removeItem("testiflow_business");
        }
      }

      if (window.location.pathname !== "/suspended") {
        window.location.href = "/suspended";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
