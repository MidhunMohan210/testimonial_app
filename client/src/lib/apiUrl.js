const API_URLS_BY_ENVIRONMENT = {
  development: "http://localhost:5001",
  staging: import.meta.env.VITE_PUBLIC_STAGING_URL || "",
  production: import.meta.env.VITE_API_URL || "",
};

function normalizeUrl(url) {
  return String(url || "").replace(/\/+$/, "");
}

function resolveApiBaseUrl() {
  const environment = String(import.meta.env.VITE_ENVIRONMENT || "production").trim();
  const mappedUrl = API_URLS_BY_ENVIRONMENT[environment];

  if (mappedUrl !== undefined) {
    return normalizeUrl(mappedUrl);
  }

  return normalizeUrl(import.meta.env.VITE_API_URL || "");
}

export const API_BASE_URL = resolveApiBaseUrl();

export function getApiBaseUrl() {
  return API_BASE_URL;
}
