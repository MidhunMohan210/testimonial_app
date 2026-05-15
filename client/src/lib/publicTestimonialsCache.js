export const PUBLIC_TESTIMONIALS_STALE_TIME_MS = 5 * 60 * 1000;
export const PUBLIC_TESTIMONIALS_GC_TIME_MS = 30 * 60 * 1000;
export const PUBLIC_TESTIMONIALS_STORAGE_EXPIRY_MS = 10 * 60 * 1000;

const PUBLIC_TESTIMONIALS_STORAGE_PREFIX = "woice_testimonials_";

function getWidgetCacheKey(businessSlug) {
  return `${PUBLIC_TESTIMONIALS_STORAGE_PREFIX}${businessSlug}`;
}

function isCacheShapeValid(cache) {
  return (
    cache &&
    Array.isArray(cache.testimonials) &&
    Number.isFinite(Number(cache.cachedAt))
  );
}

export function readWidgetCache(businessSlug) {
  if (!businessSlug || typeof window === "undefined") return undefined;

  try {
    const cached = window.localStorage.getItem(getWidgetCacheKey(businessSlug));
    if (!cached) return undefined;

    const parsed = JSON.parse(cached);
    if (!isCacheShapeValid(parsed)) {
      window.localStorage.removeItem(getWidgetCacheKey(businessSlug));
      return undefined;
    }

    return {
      ...parsed,
      cachedAt: Number(parsed.cachedAt),
      version: parsed.version ?? null,
    };
  } catch {
    return undefined;
  }
}

export function saveWidgetCache(businessSlug, data, version) {
  if (!businessSlug || typeof window === "undefined" || !data) return;

  try {
    window.localStorage.setItem(
      getWidgetCacheKey(businessSlug),
      JSON.stringify({
        businessName: data.businessName || "",
        slug: data.slug || businessSlug,
        averageRating: Number(data.averageRating || 0),
        totalCount: Number(data.totalCount || 0),
        testimonials: Array.isArray(data.testimonials) ? data.testimonials : [],
        cachedAt: Date.now(),
        version: version ?? null,
      })
    );
  } catch {
    // Ignore storage failures so embedded widgets still render normally.
  }
}

export function clearCachedPublicTestimonials(businessSlug) {
  if (!businessSlug || typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(getWidgetCacheKey(businessSlug));
  } catch {
    // Ignore storage failures; query invalidation will still refresh in memory.
  }
}

export function shouldUseCache(cached, version) {
  if (!isCacheShapeValid(cached)) {
    return false;
  }

  const isFresh =
    Date.now() - Number(cached.cachedAt) < PUBLIC_TESTIMONIALS_STORAGE_EXPIRY_MS;

  return isFresh && cached.version === (version ?? null);
}

export function getCachedTestimonialsData(cached, businessSlug) {
  if (!isCacheShapeValid(cached)) {
    return undefined;
  }

  return {
    businessName: cached.businessName || "",
    slug: cached.slug || businessSlug,
    averageRating: Number(cached.averageRating || 0),
    totalCount: Number(cached.totalCount || cached.testimonials.length || 0),
    testimonials: cached.testimonials,
  };
}
