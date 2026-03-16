import express from "express";
import Testimonial from "../models/Testimonial.js";
import WhatsappRequest from "../models/WhatsappRequest.js";
import { sendWhatsappMessage } from "../controllers/whatsappController.js";

const router = express.Router();

router.get("/whatsapp", (req, res) => {
  return res.status(200).send("Twilio WhatsApp webhook is active");
});

router.post("/whatsapp", async (req, res) => {
  console.log("WhatsApp webhook payload:", JSON.stringify(req.body, null, 2));

  try {
    const customerPhone = String(req.body.From || "")
      .replace("whatsapp:", "")
      .trim();
    const textBody = String(req.body.Body || "").trim();

    if (!customerPhone || !textBody) {
      return res.sendStatus(200);
    }

    const request = await WhatsappRequest.findOne({
      customerPhone,
      status: { $ne: "failed" },
      step: { $in: [1, 2] },
    }).sort({ sentAt: -1 });

    if (!request) {
      return res.sendStatus(200);
    }

    if (request.step === 1) {
      const rating = Number(textBody);

      if (Number.isInteger(rating) && rating >= 1 && rating <= 5) {
        request.tempRating = rating;
        request.step = 2;
        await request.save();

        await sendWhatsappMessage({
          to: customerPhone,
          body: "Thank you! Could you write a short review about your experience? (Just a sentence or two is enough!)",
        });
      }

      return res.sendStatus(200);
    }

    if (request.step === 2 && textBody) {
      await Testimonial.create({
        businessId: request.businessId,
        customerName: request.customerName || "",
        customerPhone,
        rating: request.tempRating,
        testimonialText: textBody,
        status: "pending",
        source: "whatsapp",
      });

      request.status = "replied";
      request.step = 3;
      await request.save();

      await sendWhatsappMessage({
        to: customerPhone,
        body: "Thank you so much! Your feedback means a lot to us!",
      });
    }
  } catch (error) {
    console.error("WhatsApp webhook processing failed:", error.message);
  }

  return res.sendStatus(200);
});

export default router;
