import TelegramBot from "node-telegram-bot-api";

import Business from "../models/Business.js";
import Testimonial from "../models/Testimonial.js";
import WhatsappRequest from "../models/WhatsappRequest.js";

const sessions = new Map();
let botInstance = null;

const sendSafeMessage = async (bot, chatId, text) => {
  try {
    await bot.sendMessage(chatId, text);
  } catch (error) {
    console.error("Telegram: Failed to send message:", error.message);
  }
};

export const startTelegramBot = () => {
  if (botInstance || !process.env.TELEGRAM_BOT_TOKEN) {
    return botInstance;
  }

  const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

  bot.on("message", async (message) => {
    const chatId = String(message.chat.id);
    const text = message.text?.trim();

    try {
      if (!text) {
        await sendSafeMessage(bot, chatId, "Something went wrong. Please try again.");
        return;
      }

      const session = sessions.get(chatId);

      if (!session) {
        console.log(`Telegram: New conversation started for chatId: ${chatId}`);
        sessions.set(chatId, { step: 0 });
        await sendSafeMessage(
          bot,
          chatId,
          "👋 Hi! Welcome to TestiFlow Test Bot.\nTo simulate a testimonial request, please send your phone number (e.g. 9188XXXXXXXX)"
        );
        return;
      }

      if (session.step === 0) {
        const customerPhone = text.replace(/\s+/g, "");

        const request = await WhatsappRequest.findOne({
          customerPhone,
          status: "sent",
        }).sort({ sentAt: -1 });

        if (!request) {
          sessions.delete(chatId);
          await sendSafeMessage(
            bot,
            chatId,
            "No pending testimonial request found for this number.\nPlease ask the business to send a request first from the TestiFlow dashboard."
          );
          return;
        }

        const business = await Business.findById(request.businessId);

        if (!business) {
          sessions.delete(chatId);
          await sendSafeMessage(bot, chatId, "Something went wrong. Please try again.");
          return;
        }

        sessions.set(chatId, {
          step: 1,
          customerPhone,
          customerName: request.customerName || "there",
          businessId: business._id,
        });

        await sendSafeMessage(
          bot,
          chatId,
          `Hi ${request.customerName || "there"}! 👋\nHow would you rate your experience?\nReply with a number:\n1 ⭐\n2 ⭐⭐\n3 ⭐⭐⭐\n4 ⭐⭐⭐⭐\n5 ⭐⭐⭐⭐⭐`
        );
        return;
      }

      if (session.step === 1) {
        const rating = Number(text);

        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
          await sendSafeMessage(bot, chatId, "Please reply with a number between 1 and 5 only.");
          return;
        }

        console.log(`Telegram: Rating received: ${rating} for phone: ${session.customerPhone}`);
        sessions.set(chatId, {
          ...session,
          step: 2,
          rating,
        });

        await sendSafeMessage(
          bot,
          chatId,
          "Thank you! 🙏\nCould you write a short review about your experience?\n(Just a sentence or two is enough!)"
        );
        return;
      }

      if (session.step === 2) {
        const testimonialText = text;

        await Testimonial.create({
          businessId: session.businessId,
          customerName: session.customerName,
          customerPhone: session.customerPhone,
          rating: session.rating,
          testimonialText,
          status: "pending",
          source: "whatsapp",
          collectedAt: new Date(),
        });

        await WhatsappRequest.findOneAndUpdate(
          {
            customerPhone: session.customerPhone,
            businessId: session.businessId,
            status: "sent",
          },
          {
            status: "replied",
          },
          {
            sort: { sentAt: -1 },
          }
        );

        console.log(`Telegram: Testimonial saved for phone: ${session.customerPhone}`);
        sessions.delete(chatId);

        await sendSafeMessage(
          bot,
          chatId,
          `Thank you so much! ⭐\nYour feedback means a lot to us!\n\nHere is what we saved:\n⭐ Rating: ${session.rating}/5\n💬 Review: ${testimonialText}\n\n(TestiFlow Test Mode)`
        );
      }
    } catch (error) {
      console.error("Telegram bot error:", error.message);
      sessions.delete(chatId);
      await sendSafeMessage(bot, chatId, "Something went wrong. Please try again.");
    }
  });

  botInstance = bot;
  return botInstance;
};
