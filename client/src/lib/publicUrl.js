const FALLBACK_PUBLIC_APP_URL = "https://www.app.woice.it.com";

export function getPublicAppUrl() {
  const configuredUrl = import.meta.env.VITE_PUBLIC_APP_URL || FALLBACK_PUBLIC_APP_URL;

  return configuredUrl.replace(/\/+$/, "");
}
