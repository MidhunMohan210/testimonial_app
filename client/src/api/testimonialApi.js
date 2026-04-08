import api from "./axios";

export const getTestimonials = async (status, options = {}) => {
  const { page, limit = 100 } = options;
  const response = await api.get("/api/testimonials", {
    params: {
      ...(status && status !== "all" ? { status } : {}),
      ...(page ? { page } : {}),
      limit,
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
