import axios from "axios";
import Business from "../models/Business.js";
import WhatsappRequest from "../models/WhatsappRequest.js";

const formatPhone = (phone) => String(phone).replace(/\s+/g, "");

const getBusinessCredentials = (business) => ({
  phoneNumberId:
    business.whatsappPhoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID,
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
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
      return res
        .status(400)
        .json({ message: "WhatsApp credentials are not configured" });
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
            name: "testimonial_request",
            language: { code: "en_US" },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: customerName },
                  { type: "text", text: business.businessName },
                ],
              },
            ],
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

      logWhatsappError(error, "WhatsApp send request failed");
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  } catch (error) {
    logWhatsappError(error, "WhatsApp controller failed");
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getRequests = async (req, res) => {
  try {
    const requests = await WhatsappRequest.find({
      businessId: req.user.businessId,
    }).sort({
      sentAt: -1,
    });

    return res.json(requests);
  } catch (error) {
    logWhatsappError(error, "WhatsApp requests fetch failed");
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { sendWhatsappMessage, getBusinessCredentials, logWhatsappError };
