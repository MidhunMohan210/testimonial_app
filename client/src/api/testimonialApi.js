import api from "./axios";

export const getTestimonials = async (status, options = {}) => {
  const {
    page,
    limit = 20,
    fromDate,
    toDate,
    minWords,
    maxWords,
    ratingSort,
  } = options;
  const response = await api.get("/api/testimonials", {
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

export const updateStatus = async (id, status) => {
  const response = await api.patch(`/api/testimonials/${id}/status`, { status });
  return response.data;
};

export const addManual = async (data) => {
  const response = await api.post("/api/testimonials/manual", data);
  return response.data;
};

export const getUnreadTestimonialCount = async () => {
  const response = await api.get("/api/testimonials/unread-count");
  return response.data;
};

export const markAllTestimonialsAsRead = async () => {
  const response = await api.post("/api/testimonials/mark-read");
  return response.data;
};
