import api from "./axios";

export const getAdminOverview = async () => {
  const response = await api.get("/api/admin/overview");
  return response.data;
};

export const getAdminBusinesses = async (params = {}) => {
  const response = await api.get("/api/admin/businesses", { params });
  return response.data;
};

export const getAdminBusinessById = async (businessId) => {
  const response = await api.get(`/api/admin/businesses/${businessId}`);
  return response.data;
};

export const updateAdminBusinessStatus = async (businessId, payload) => {
  const response = await api.patch(
    `/api/admin/businesses/${businessId}/status`,
    payload,
  );
  return response.data;
};

export const updateAdminBusinessBeta = async (businessId, payload) => {
  const response = await api.patch(
    `/api/admin/businesses/${businessId}/beta`,
    payload,
  );
  return response.data;
};
