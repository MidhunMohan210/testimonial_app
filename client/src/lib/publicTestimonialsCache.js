export const PUBLIC_TESTIMONIALS_STALE_TIME_MS = 5 * 60 * 1000;
export const PUBLIC_TESTIMONIALS_GC_TIME_MS = 30 * 60 * 1000;
export const PUBLIC_TESTIMONIALS_STORAGE_EXPIRY_MS = 10 * 60 * 1000;

const PUBLIC_TESTIMONIALS_STORAGE_PREFIX = "woice:public-testimonials:";

function getPublicTestimonialsStorageKey(businessSlug) {
  return `${PUBLIC_TESTIMONIALS_STORAGE_PREFIX}${businessSlug}`;
}

export function readCachedPublicTestimonials(businessSlug) {
  if (!businessSlug || typeof window === "undefined") return undefined;

  try {
    const cached = window.localStorage.getItem(
      getPublicTestimonialsStorageKey(businessSlug)
    );
    if (!cached) return undefined;

    const parsed = JSON.parse(cached);
    const updatedAt = Number(parsed?.updatedAt);

    if (
      !parsed?.data ||
      !Number.isFinite(updatedAt) ||
      Date.now() - updatedAt > PUBLIC_TESTIMONIALS_STORAGE_EXPIRY_MS
    ) {
      window.localStorage.removeItem(getPublicTestimonialsStorageKey(businessSlug));
      return undefined;
    }

    return parsed;
  } catch {
    return undefined;
  }
}

export function writeCachedPublicTestimonials(businessSlug, data) {
  if (!businessSlug || typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      getPublicTestimonialsStorageKey(businessSlug),
      JSON.stringify({
        data,
        updatedAt: Date.now(),
      })
    );
  } catch {
    // Ignore storage failures so embedded widgets still render normally.
  }
}

export function clearCachedPublicTestimonials(businessSlug) {
  if (!businessSlug || typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(getPublicTestimonialsStorageKey(businessSlug));
  } catch {
    // Ignore storage failures; query invalidation will still refresh in memory.
  }
}
