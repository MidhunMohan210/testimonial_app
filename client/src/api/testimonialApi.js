import api from "./axios";

export const getTestimonials = async (status) => {
  const response = await api.get("/api/testimonials", {
    params: status && status !== "all" ? { status } : {},
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
