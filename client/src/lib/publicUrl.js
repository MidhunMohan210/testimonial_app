const PUBLIC_APP_URLS_BY_ENVIRONMENT = {
  staging: "https://staging.woice.it.com",
  production: "https://app.woice.it.com",
};

const FALLBACK_PUBLIC_APP_URL = PUBLIC_APP_URLS_BY_ENVIRONMENT.production;
const DEVELOPMENT_FALLBACK_PUBLIC_APP_URL = "http://localhost:5174";

function normalizeUrl(url) {
  return String(url || "").replace(/\/+$/, "");
}

function resolvePublicAppUrl() {
  const environment = String(import.meta.env.VITE_ENVIRONMENT || "production").trim();
  
  if (environment === "development") {
    if (typeof window !== "undefined" && window.location?.origin) {
      return normalizeUrl(window.location.origin);
    }

    return normalizeUrl(DEVELOPMENT_FALLBACK_PUBLIC_APP_URL);
  }

  const mappedUrl = PUBLIC_APP_URLS_BY_ENVIRONMENT[environment];

  if (mappedUrl) {
    return normalizeUrl(mappedUrl);
  }

  const configuredUrl = import.meta.env.VITE_PUBLIC_APP_URL || FALLBACK_PUBLIC_APP_URL;

  if (typeof console !== "undefined" && console.warn) {
    console.warn(
      `[publicUrl] Unknown VITE_ENVIRONMENT "${environment}". Falling back to ${normalizeUrl(configuredUrl)}.`,
    );
  }

  return normalizeUrl(configuredUrl);
}

export const PUBLIC_APP_BASE_URL = resolvePublicAppUrl();

export function getPublicAppUrl() {
  return PUBLIC_APP_BASE_URL;
}
