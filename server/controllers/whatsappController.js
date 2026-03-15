import axios from "axios";
import Business from "../models/Business.js";
import WhatsappRequest from "../models/WhatsappRequest.js";

const formatPhone = (phone) => String(phone).replace(/\s+/g, "");

const getBusinessCredentials = (business) => ({
  phoneNumberId: business.whatsappPhoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID,
  accessToken: business.whatsappAccessToken || process.env.WHATSAPP_ACCESS_TOKEN,
});

const sendWhatsappMessage = async ({ phoneNumberId, accessToken, payload }) => {
  const url = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;

  return axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
};

export const sendRequest = async (req, res) => {
  try {
    const { customerName, customerPhone } = req.body;

    if (!customerPhone) {
      return res.status(400).json({ message: "Customer phone is required" });
    }

    const business = await Business.findById(req.user.businessId);

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const { phoneNumberId, accessToken } = getBusinessCredentials(business);

    if (!phoneNumberId || !accessToken) {
      return res.status(400).json({ message: "WhatsApp credentials are not configured" });
    }

    const normalizedPhone = formatPhone(customerPhone);

    const request = await WhatsappRequest.create({
      businessId: business._id,
      customerName: customerName?.trim(),
      customerPhone: normalizedPhone,
      status: "sent",
      step: 1,
    });

    try {
      await sendWhatsappMessage({
        phoneNumberId,
        accessToken,
        payload: {
          messaging_product: "whatsapp",
          to: normalizedPhone,
          type: "template",
          template: {
            name: "hello_world",
            language: { code: "en_US" },
          },
        },
      });

      return res.json({
        message: "WhatsApp request sent successfully",
        request,
      });
    } catch (error) {
      request.status = "failed";
      await request.save();

      return res.status(500).json({
        message: "Failed to send WhatsApp message",
        error: error.response?.data || error.message,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: "Unable to send request", error: error.message });
  }
};

export const getRequests = async (req, res) => {
  try {
    const requests = await WhatsappRequest.find({ businessId: req.user.businessId }).sort({
      sentAt: -1,
    });

    return res.json(requests);
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch requests", error: error.message });
  }
};

export const sendTestRequest = async (req, res) => {
  try {
    const { customerName, customerPhone } = req.body;

    if (!customerPhone) {
      return res.status(400).json({ message: "Customer phone is required" });
    }

    const normalizedPhone = formatPhone(customerPhone);

    const request = await WhatsappRequest.create({
      businessId: req.user.businessId,
      customerName: customerName?.trim(),
      customerPhone: normalizedPhone,
      status: "sent",
      step: 1,
    });

    return res.status(201).json({
      message: "Test request created. Open Telegram bot and send your phone number to test.",
      request,
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to create test request", error: error.message });
  }
};

export { sendWhatsappMessage, getBusinessCredentials };
