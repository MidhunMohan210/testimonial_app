export const getBusinessSettings = (business) => {
  const settings = business?.settings || {};
  const shareFeedbackSettings = settings.shareFeedback || {};

  return {
    googleReviewLink: settings.googleReviewLink ?? "",
    googleReviewEnabled: settings.googleReviewEnabled ?? false,
    isPublicEnabled: settings.isPublicEnabled ?? true,
    notificationsEnabled: settings.notificationsEnabled ?? true,
    shareFeedback: {
      ...(shareFeedbackSettings.greetingMessage
        ? { greetingMessage: shareFeedbackSettings.greetingMessage }
        : {}),
    },
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
    settings,
  };
};
