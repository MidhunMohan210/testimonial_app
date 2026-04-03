import axios from "axios";

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
});

export const getBusinessBySlug = async (slug) => {
  const response = await publicApi.get(`/api/r/${slug}`);
  return response.data;
};

export const submitReview = async (slug, data) => {
  const response = await publicApi.post(`/api/r/${slug}/submit`, data);
  return response.data;
};

export const submitFeedback = async (slug, data) => {
  const response = await publicApi.post(`/api/r/${slug}/feedback`, data);
  return response.data;
};
