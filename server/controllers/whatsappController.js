import twilio from "twilio";
import Business from "../models/Business.js";
import WhatsappRequest from "../models/WhatsappRequest.js";

const formatPhone = (phone) => String(phone).replace(/\s+/g, "");
const twilioClient = () => twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const maskValue = (value, visible = 4) => {
  if (!value) {
    return "missing";
  }

  if (value.length <= visible) {
    return "*".repeat(value.length);
  }

  return `${"*".repeat(Math.max(0, value.length - visible))}${value.slice(-visible)}`;
};

const getBusinessCredentials = () => ({
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  fromNumber: process.env.TWILIO_WHATSAPP_FROM_NUMBER,
});

const sendWhatsappMessage = async ({ to, body }) => {
  return twilioClient().messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM_NUMBER,
    to: to.startsWith("whatsapp:") ? to : `whatsapp:${to}`,
    body,
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

    const { accountSid, authToken, fromNumber } = getBusinessCredentials();

    console.log("Twilio config check:", {
      accountSid: accountSid ? `${accountSid.slice(0, 2)}...${accountSid.slice(-4)}` : "missing",
      authToken: maskValue(authToken),
      fromNumber: fromNumber || "missing",
    });

    if (!accountSid || !authToken || !fromNumber) {
      return res.status(400).json({ message: "Twilio WhatsApp credentials are not configured" });
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
      console.log("Twilio send attempt:", {
        from: fromNumber,
        to: `whatsapp:${normalizedPhone}`,
        customerName: customerName?.trim() || "there",
      });

      await sendWhatsappMessage({
        to: normalizedPhone,
        body: `Hi ${customerName?.trim() || "there"}! Please rate your experience from 1 to 5 by replying with a number.`,
      });

      return res.json({
        message: "WhatsApp request sent successfully",
        request,
      });
    } catch (error) {
      console.error("Twilio send failed:", {
        message: error.message,
        code: error.code,
        status: error.status,
        moreInfo: error.moreInfo,
      });

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
