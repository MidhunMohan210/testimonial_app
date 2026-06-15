export const DEFAULT_SHARE_FEEDBACK_MESSAGE =
  "Hi, thank you for choosing {{businessName}}\n\nWe’d love to hear about your experience with us.\n\nPlease share your feedback here:";

function resolveBusinessName(business) {
  return (
    business?.businessName?.trim() ||
    business?.name?.trim() ||
    "our business"
  );
}

export function getShareFeedbackMessage(business) {
  const customMessage =
    business?.settings?.shareFeedback?.greetingMessage?.trim();

  if (customMessage) {
    return customMessage;
  }

  return DEFAULT_SHARE_FEEDBACK_MESSAGE.replace(
    "{{businessName}}",
    resolveBusinessName(business)
  );
}

export function buildShareFeedbackFinalMessage(business, message, feedbackLink) {
  const resolvedMessage =
    typeof message === "string" && message.trim()
      ? message.trim()
      : getShareFeedbackMessage(business);

  if (!feedbackLink) {
    return resolvedMessage;
  }

  return `${resolvedMessage}\n${feedbackLink}`;
}