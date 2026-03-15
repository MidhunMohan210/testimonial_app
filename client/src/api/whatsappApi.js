import api from "./axios";

export const sendRequest = async (data) => {
  const response = await api.post("/api/whatsapp/send", data);
  return response.data;
};

export const sendTestRequest = async (data) => {
  const response = await api.post("/api/whatsapp/send-test", data);
  return response.data;
};
