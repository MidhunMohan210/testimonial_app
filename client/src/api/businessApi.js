import api from "./axios";

export const getMyBusiness = async () => {
  const response = await api.get("/api/business/me");
  return response.data;
};

export const updateBusiness = async (data) => {
  const response = await api.patch("/api/business/me", data);
  return response.data;
};

export const getPrivateFeedback = async () => {
  const response = await api.get("/api/feedback");
  return response.data;
};
