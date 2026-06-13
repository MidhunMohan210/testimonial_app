import axios from "axios";
import { getApiBaseUrl } from "../lib/apiUrl";

const publicApi = axios.create({
  baseURL: getApiBaseUrl(),
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
