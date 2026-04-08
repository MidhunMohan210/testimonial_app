import axios from "axios";
import Business from "../models/Business.js";
import WhatsappRequest from "../models/WhatsappRequest.js";
import WhatsAppAccount from "../models/WhatsAppAccount.js";
import { toBusinessResponse } from "../utils/businessSettings.js";
import { createHttpError } from "../utils/httpError.js";

const formatPhone = (phone) => String(phone).replace(/\s+/g, "");

const getBusinessCredentials = async (businessId) => {
  const account = await WhatsAppAccount.findOne({ business: businessId });

  if (!account) {
    throw new Error("WhatsApp account not connected for this business");
  }

  return {
    phoneNumberId: account.phone_number_id,
    accessToken: account.access_token,
  };
};

const sendWhatsappMessage = async ({ phoneNumberId, accessToken, payload }) => {
  const url = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;

  return axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
};

const logWhatsappError = (error, context) => {
  if (axios.isAxiosError(error)) {
    console.error(context, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return;
  }

  console.error(context, error);
};

export const sendRequest = async (req, res) => {
  const { customerName, customerPhone } = req.body;

  if (!customerPhone) {
    throw createHttpError(400, "Customer phone is required");
  }

  const business = await Business.findById(req.user.businessId);

  if (!business) {
    throw createHttpError(404, "Business not found");
  }

  const { phoneNumberId, accessToken } = await getBusinessCredentials(
    business._id,
  ).catch((error) => {
    logWhatsappError(error, "WhatsApp controller failed");
    throw createHttpError(500, "Internal server error");
  });

  if (!phoneNumberId || !accessToken) {
    throw createHttpError(400, "WhatsApp credentials are not configured");
  }

  const normalizedPhone = formatPhone(customerPhone);

  const request = await WhatsappRequest.create({
    businessId: business._id,
    customerName: customerName?.trim(),
    customerPhone: normalizedPhone,
    status: "sent",
    step: 1,
  });

  const templateName = "woice_review_request_v1"; // later from DB
  const languageCode = "en_US"; // must match template exactly

  await sendWhatsappMessage({
    phoneNumberId,
    accessToken,
    payload: {
      messaging_product: "whatsapp",
      to: normalizedPhone,
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode },
        components: [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: customerName || "Customer", // fallback safety
              },
              {
                type: "text",
                text: business?.businessName || "Our Business",
              },
            ],
          },
        ],
      },
    },
  }).catch(async (error) => {
    request.status = "failed";
    await request.save();

    logWhatsappError(error, "WhatsApp send request failed");
    throw createHttpError(500, "Internal server error");
  });

  return res.json({
    message: "WhatsApp request sent successfully",
    request,
  });
};

export const getRequests = async (req, res) => {
  const requests = await WhatsappRequest.find({
    businessId: req.user.businessId,
  }).sort({
    sentAt: -1,
  });

  return res.json(requests);
};

export const saveEmbeddedSignupConnection = async (req, res) => {
  const { waba_id: wabaId, phone_number_id: phoneNumberId } = req.body;

  if (!wabaId || !phoneNumberId) {
    throw createHttpError(400, "waba_id and phone_number_id are required");
  }

  const business = await Business.findById(req.user.businessId);

  if (!business) {
    throw createHttpError(404, "Business not found");
  }

  business.whatsappBusinessAccountId = String(wabaId).trim();
  business.whatsappPhoneNumberId = String(phoneNumberId).trim();
  await business.save();

  console.log("[WhatsApp Embedded Signup] Connection saved", {
    businessId: business._id.toString(),
    waba_id: business.whatsappBusinessAccountId,
    phone_number_id: business.whatsappPhoneNumberId,
  });

  return res.json({
    message: "WhatsApp connection saved successfully",
    business: toBusinessResponse(business),
  });
};

export const saveWhatsAppAccount = async (req, res) => {
  const {
    waba_id,
    phone_number_id,
    business_id,
    access_token,
    business,
    user,
  } = req.body;

  if (!waba_id || !phone_number_id || !access_token) {
    throw createHttpError(
      400,
      "waba_id, phone_number_id, and access_token are required",
      {
        success: false,
        message: "waba_id, phone_number_id, and access_token are required",
      },
    );
  }

  const account = await WhatsAppAccount.findOneAndUpdate(
    { waba_id },
    {
      waba_id,
      phone_number_id,
      business_id: business_id ?? null,
      business: business ?? null,
      user: user ?? null,
      access_token,

      connected_at: new Date(),
    },
    { upsert: true, new: true },
  );

  return res.status(200).json({
    success: true,
    message: "WhatsApp account saved successfully",
    data: {
      waba_id: account.waba_id,
      phone_number_id: account.phone_number_id,
      business_id: account.business_id,
      connected_at: account.connected_at,
    },
  });
};

export { sendWhatsappMessage, getBusinessCredentials, logWhatsappError };
