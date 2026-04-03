import api from "./axios";

export const sendRequest = async (data) => {
  const response = await api.post("/api/whatsapp/send", data);
  return response.data;
};

export const connectWhatsAppEmbeddedSignup = async (data) => {
  const response = await api.post("/api/whatsapp/connect", data);
  return response.data;
};
