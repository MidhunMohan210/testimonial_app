import express from "express";
import crypto from "crypto";
import Business from "../models/Business.js";
import Testimonial from "../models/Testimonial.js";
import WhatsappRequest from "../models/WhatsappRequest.js";
import {
  sendWhatsappMessage,
  getBusinessCredentials,
  logWhatsappError,
} from "../controllers/whatsappController.js";

const router = express.Router();

const getNested = (obj, path, fallback = undefined) =>
  path.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : fallback), obj);

const resolveBusiness = async (phoneNumberId, customerPhone) => {
  if (phoneNumberId) {
    const business = await Business.findOne({ whatsappPhoneNumberId: phoneNumberId });
    if (business) {
      return business;
    }
  }

  const request = await WhatsappRequest.findOne({
    customerPhone,
    status: { $ne: "failed" },
    step: { $in: [1, 2] },
  }).sort({ sentAt: -1 });

  if (!request) {
    return null;
  }

  return Business.findById(request.businessId);
};



const verifyWebhookSignature = (req) => {
  // Skip verification in development
  if (process.env.NODE_ENV !== "production") {
    console.log("⚠️ Skipping WhatsApp signature verification (dev mode)");
    return true;
  }

  const signature = req.headers["x-hub-signature-256"];
  const appSecret = process.env.WHATSAPP_APP_SECRET;

  if (!signature) {
    console.warn("Missing WhatsApp signature header");
    return false;
  }

  if (!appSecret) {
    console.error("WHATSAPP_APP_SECRET not configured");
    return false;
  }

  if (!req.rawBody) {
    console.error("Raw body missing for signature verification");
    return false;
  }

  const expectedSignature =
    "sha256=" +
    crypto
      .createHmac("sha256", appSecret)
      .update(req.rawBody)
      .digest("hex");

  try {
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch (error) {
    console.error("Signature verification failed:", error);
    return false;
  }
};

router.get("/whatsapp", (req, res) => {
  const mode = req.query["hub.mode"];
  const verifyToken = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && verifyToken === process.env.WHATSAPP_VERIFY_TOKEN) {
    return res.send(challenge);
  }

  return res.status(403).send("Verification failed");
});

router.post("/whatsapp", async (req, res) => {
  if (!verifyWebhookSignature(req)) {
    return res.status(403).send("Invalid signature");
  }

  console.log("WhatsApp webhook event received");

  try {
    const message = getNested(req.body, ["entry", 0, "changes", 0, "value", "messages", 0]);
    const phoneNumberId = getNested(req.body, [
      "entry",
      0,
      "changes",
      0,
      "value",
      "metadata",
      "phone_number_id",
    ]);

    if (!message) {
      return res.sendStatus(200);
    }

    const customerPhone = message.from;
    const messageId = message.id;
    const messageType = message.type;
    const textBody = getNested(message, ["text", "body"], "").trim();
    const business = await resolveBusiness(phoneNumberId, customerPhone);

    if (!business) {
      return res.sendStatus(200);
    }

    const request = await WhatsappRequest.findOne({
      businessId: business._id,
      customerPhone,
      status: { $ne: "failed" },
      step: { $in: [1, 2] },
    }).sort({ sentAt: -1 });

    if (!request) {
      return res.sendStatus(200);
    }

    const { phoneNumberId: businessPhoneNumberId, accessToken } = getBusinessCredentials(business);

    if (!businessPhoneNumberId || !accessToken) {
      return res.sendStatus(200);
    }

    if (request.step === 1) {
      const rating = Number(textBody);

      if (messageType === "text" && Number.isInteger(rating) && rating >= 1 && rating <= 5) {
        request.tempRating = rating;
        request.step = 2;
        await request.save();

        await sendWhatsappMessage({
          phoneNumberId: businessPhoneNumberId,
          accessToken,
          payload: {
            messaging_product: "whatsapp",
            to: customerPhone,
            type: "text",
            text: {
              body: "Thank you! Could you write a short review about your experience? (Just a sentence or two is enough!)",
            },
          },
        });
      }

      return res.sendStatus(200);
    }

    if (request.step === 2 && messageType === "text" && textBody) {
      if (!messageId) {
        return res.sendStatus(200);
      }

      const existingTestimonial = await Testimonial.findOne({ messageId });

      if (existingTestimonial) {
        request.status = "replied";
        request.step = 3;
        await request.save();
        return res.sendStatus(200);
      }

      await Testimonial.create({
        businessId: business._id,
        customerName: request.customerName || "",
        customerPhone,
        rating: request.tempRating,
        testimonialText: textBody,
        status: "pending",
        source: "whatsapp",
        messageId,
      });

      request.status = "replied";
      request.step = 3;
      await request.save();

      await sendWhatsappMessage({
        phoneNumberId: businessPhoneNumberId,
        accessToken,
        payload: {
          messaging_product: "whatsapp",
          to: customerPhone,
          type: "text",
          text: {
            body: "Thank you so much! Your feedback means a lot to us!",
          },
        },
      });
    }
  } catch (error) {
    logWhatsappError(error, "WhatsApp webhook processing failed");
  }

  return res.sendStatus(200);
});

export default router;
