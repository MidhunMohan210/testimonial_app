import axios from "axios";

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
});

export const getPublicTestimonials = async (slug, params = {}) => {
  const response = await publicApi.get(`/api/p/${slug}`, { params });
  return response.data;
};

export const getPublicTestimonialsVersion = async (slug) => {
  const response = await publicApi.get(
    `/api/p/business/${slug}/testimonials-version`
  );
  return response.data;
};
