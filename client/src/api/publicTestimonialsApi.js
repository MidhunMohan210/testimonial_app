import axios from "axios";
import { getApiBaseUrl } from "../lib/apiUrl";

const publicApi = axios.create({
  baseURL: getApiBaseUrl(),
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
