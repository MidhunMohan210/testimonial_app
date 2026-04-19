const COOLDOWN_MS = 24 * 60 * 60 * 1000;

function getStorageKey(businessId) {
  return `woice_submission_${businessId}`;
}

function getStoredRecord(businessId) {
  if (!businessId) {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(getStorageKey(businessId));

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue);
    const submittedAt = Number(parsedValue?.submittedAt);

    if (!Number.isFinite(submittedAt) || submittedAt <= 0) {
      return null;
    }

    return { submittedAt };
  } catch {
    return null;
  }
}

export function getCooldownStatus(businessId) {
  const record = getStoredRecord(businessId);

  if (!record) {
    return { isActive: false, remainingMs: 0 };
  }

  const elapsedMs = Date.now() - record.submittedAt;
  const remainingMs = COOLDOWN_MS - elapsedMs;

  return {
    isActive: remainingMs > 0,
    remainingMs: Math.max(0, remainingMs),
  };
}

export function setCooldown(businessId) {
  if (!businessId) {
    return;
  }

  try {
    window.localStorage.setItem(
      getStorageKey(businessId),
      JSON.stringify({
        submittedAt: Date.now(),
      }),
    );
  } catch {
    // Ignore storage write issues and keep submission flow intact.
  }
}
