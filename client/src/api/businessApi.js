import api from "./axios";

export const getMyBusiness = async () => {
  const response = await api.get("/api/business/me");
  return response.data;
};

export const updateBusiness = async (data) => {
  const response = await api.patch("/api/business/me", data);
  return response.data;
};

export const getBusinessSettings = async () => {
  const response = await api.get("/api/business/settings");
  return response.data;
};

export const updateBusinessSettings = async (data) => {
  const response = await api.put("/api/business/settings", data);
  return response.data;
};

export const updateShareFeedbackSettings = async (data) => {
  const response = await api.patch("/api/business/settings/share-feedback", data);
  return response.data;
};

export const getPrivateFeedback = async (options = {}) => {
  const {
    status,
    page,
    limit = 20,
    fromDate,
    toDate,
    minWords,
    maxWords,
    ratingSort,
  } = options;
  const response = await api.get("/api/feedback", {
    params: {
      ...(status && status !== "all" ? { status } : {}),
      ...(page ? { page } : {}),
      limit,
      ...(fromDate ? { fromDate } : {}),
      ...(toDate ? { toDate } : {}),
      ...(minWords !== null && minWords !== undefined ? { minWords } : {}),
      ...(maxWords !== null && maxWords !== undefined ? { maxWords } : {}),
      ...(ratingSort && ratingSort !== "none" ? { ratingSort } : {}),
    },
  });
  return response.data;
};

export const getUnreadPrivateFeedbackCount = async () => {
  const response = await api.get("/api/feedback/unread-count");
  return response.data;
};

export const markAllPrivateFeedbackAsRead = async () => {
  const response = await api.post("/api/feedback/mark-read");
  return response.data;
};

export const updatePrivateFeedback = async (id, data) => {
  const response = await api.patch(`/api/feedback/${id}`, data);
  return response.data;
};
