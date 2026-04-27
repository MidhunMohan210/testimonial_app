export const getBusinessSettings = (business) => {
  const settings = business?.settings || {};

  return {
    googleReviewLink: settings.googleReviewLink ?? business?.googleReviewLink ?? "",
    googleReviewEnabled:
      settings.googleReviewEnabled ?? business?.googleReviewEnabled ?? false,
    isPublicEnabled: settings.isPublicEnabled ?? business?.isPublicEnabled ?? true,
    notificationsEnabled:
      settings.notificationsEnabled ?? business?.notificationsEnabled ?? true,
  };
};

export const toBusinessResponse = (business) => {
  if (!business) {
    return null;
  }

  const settings = getBusinessSettings(business);

  return {
    _id: business._id,
    businessName: business.businessName,
    slug: business.slug,
    whatsappBusinessAccountId: business.whatsappBusinessAccountId,
    whatsappPhoneNumberId: business.whatsappPhoneNumberId,
    createdAt: business.createdAt,
    googleReviewLink: settings.googleReviewLink,
    googleReviewEnabled: settings.googleReviewEnabled,
    isPublicEnabled: settings.isPublicEnabled,
    notificationsEnabled: settings.notificationsEnabled,
  };
};

export const assignBusinessSettings = (business, updates = {}) => {
  const currentSettings = getBusinessSettings(business);

  business.settings = {
    ...currentSettings,
    ...(updates.googleReviewLink !== undefined
      ? { googleReviewLink: updates.googleReviewLink }
      : {}),
    ...(updates.googleReviewEnabled !== undefined
      ? { googleReviewEnabled: updates.googleReviewEnabled }
      : {}),
    ...(updates.isPublicEnabled !== undefined
      ? { isPublicEnabled: updates.isPublicEnabled }
      : {}),
    ...(updates.notificationsEnabled !== undefined
      ? { notificationsEnabled: updates.notificationsEnabled }
      : {}),
  };

  // Mirror into legacy flat fields during the compatibility window.
  business.googleReviewLink = business.settings.googleReviewLink;
  business.googleReviewEnabled = business.settings.googleReviewEnabled;
  business.isPublicEnabled = business.settings.isPublicEnabled;
  business.notificationsEnabled = business.settings.notificationsEnabled;

  return business.settings;
};
