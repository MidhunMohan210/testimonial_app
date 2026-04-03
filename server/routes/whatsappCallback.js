import crypto from "crypto";
import express from "express";
import axios from "axios";
import WhatsAppAccount from "../models/WhatsAppAccount.js";

const router = express.Router();

const META_GRAPH_BASE_URL = "https://graph.facebook.com/v18.0";

// ─── Config ───────────────────────────────────────────────────────────────────

const getMetaConfig = () => {
  const { META_APP_ID, WHATSAPP_APP_SECRET, META_REDIRECT_URI } = process.env;

  if (!META_APP_ID || !WHATSAPP_APP_SECRET || !META_REDIRECT_URI) {
    throw new Error(
      "Missing required Meta OAuth environment variables. Expected META_APP_ID, WHATSAPP_APP_SECRET, and META_REDIRECT_URI."
    );
  }

  return {
    appId: META_APP_ID,
    appSecret: WHATSAPP_APP_SECRET,
    redirectUri: META_REDIRECT_URI,
  };
};

// ─── Error Logger ─────────────────────────────────────────────────────────────

const logAxiosError = (step, error) => {
  if (axios.isAxiosError(error)) {
    console.error(`[Meta OAuth] ${step} failed`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return;
  }

  console.error(`[Meta OAuth] ${step} failed`, error);
};

// ─── HTML Response ────────────────────────────────────────────────────────────

const renderHtmlResponse = ({ title, message }) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="font-family: Arial, sans-serif; padding: 40px; color: #111827;">
    <h1 style="margin-bottom: 12px;">${message}</h1>
  </body>
</html>`;

// ─── Step 1: Exchange Code for Access Token ───────────────────────────────────

const exchangeCodeForAccessToken = async ({ code, appId, appSecret, redirectUri }) => {
  console.log("[Meta OAuth] Exchanging authorization code for access token");

  const response = await axios.get(`${META_GRAPH_BASE_URL}/oauth/access_token`, {
    params: {
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: redirectUri,
      code,
    },
  });

  return response.data?.access_token;
};

// ─── Step 2: Exchange for Long-Lived Token ────────────────────────────────────

const exchangeForLongLivedToken = async ({ shortLivedToken, appId, appSecret }) => {
  console.log("[Meta OAuth] Exchanging for long-lived access token");

  const response = await axios.get(`${META_GRAPH_BASE_URL}/oauth/access_token`, {
    params: {
      grant_type: "fb_exchange_token",
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: shortLivedToken,
    },
  });

  return response.data?.access_token;
};

// ─── Step 3: Extract WABA ID from Debug Token ─────────────────────────────────

const fetchWabaIdFromToken = async ({ accessToken, appId, appSecret }) => {
  console.log("[Meta OAuth] Fetching WABA ID via debug_token");

  const response = await axios.get(`${META_GRAPH_BASE_URL}/debug_token`, {
    params: {
      input_token: accessToken,
      access_token: `${appId}|${appSecret}`, // App access token format
    },
  });

  const granularScopes = response.data?.data?.granular_scopes ?? [];

  const wabaScope = granularScopes.find(
    (s) => s.scope === "whatsapp_business_management"
  );

  return wabaScope?.target_ids?.[0] ?? null;
};

// ─── Step 4: Fetch Phone Numbers for WABA ────────────────────────────────────

const fetchPhoneNumbers = async ({ wabaId, accessToken }) => {
  console.log("[Meta OAuth] Fetching phone numbers for WABA", { wabaId });

  const response = await axios.get(`${META_GRAPH_BASE_URL}/${wabaId}/phone_numbers`, {
    params: {
      access_token: accessToken,
    },
  });

  return response.data?.data ?? [];
};

// ─── Callback Route ───────────────────────────────────────────────────────────

router.get("/callback", async (req, res) => {
  try {
    console.log("[Meta OAuth] Callback received");

    const { code, state } = req.query;

    // ── CSRF State Check ──────────────────────────────────────────────────────
    const expectedState = req.session?.oauthState;

    if (!expectedState || state !== expectedState) {
      console.error("[Meta OAuth] State mismatch — possible CSRF attack", {
        received: state,
        expected: expectedState,
      });
      return res.status(403).send(
        renderHtmlResponse({
          title: "Forbidden",
          message: "Invalid state parameter. Please try connecting again.",
        })
      );
    }

    // Clear state after verification
    req.session.oauthState = null;

    // ── Authorization Code Check ──────────────────────────────────────────────
    if (!code) {
      console.error("[Meta OAuth] Missing authorization code in query params");
      return res.status(400).send(
        renderHtmlResponse({
          title: "Missing code",
          message: "Missing authorization code. Please try again.",
        })
      );
    }

    const { appId, appSecret, redirectUri } = getMetaConfig();

    // ── Step 1: Short-lived token ─────────────────────────────────────────────
    const shortLivedToken = await exchangeCodeForAccessToken({
      code,
      appId,
      appSecret,
      redirectUri,
    });

    if (!shortLivedToken) {
      console.error("[Meta OAuth] Short-lived token missing in exchange response");
      return res.status(502).send(
        renderHtmlResponse({
          title: "Token exchange failed",
          message: "Failed to exchange authorization code for access token.",
        })
      );
    }

    // ── Step 2: Long-lived token ──────────────────────────────────────────────
    const accessToken = await exchangeForLongLivedToken({
      shortLivedToken,
      appId,
      appSecret,
    });

    if (!accessToken) {
      console.error("[Meta OAuth] Long-lived token exchange failed");
      return res.status(502).send(
        renderHtmlResponse({
          title: "Token exchange failed",
          message: "Failed to obtain long-lived access token.",
        })
      );
    }

    console.log("[Meta OAuth] Long-lived access token obtained", { received: true });

    // ── Step 3: Get WABA ID ───────────────────────────────────────────────────
    const wabaId = await fetchWabaIdFromToken({ accessToken, appId, appSecret });

    if (!wabaId) {
      console.error("[Meta OAuth] WABA ID not found in debug_token response");
      return res.status(502).send(
        renderHtmlResponse({
          title: "WABA fetch failed",
          message: "Failed to fetch WhatsApp Business Account. Ensure you granted the correct permissions.",
        })
      );
    }

    console.log("[Meta OAuth] WABA ID received", { wabaId });

    // ── Step 4: Get Phone Numbers ─────────────────────────────────────────────
    const phoneNumbers = await fetchPhoneNumbers({ wabaId, accessToken });

    if (!phoneNumbers.length) {
      console.error("[Meta OAuth] No phone numbers found for WABA", { wabaId });
      return res.status(404).send(
        renderHtmlResponse({
          title: "Phone number not found",
          message: "No WhatsApp phone number found for this account.",
        })
      );
    }

    // Log available numbers for visibility (no tokens here)
    console.log(
      "[Meta OAuth] Available phone numbers",
      phoneNumbers.map((p) => ({
        id: p.id,
        display: p.display_phone_number,
        verified: p.verified_name,
      }))
    );

    const phoneNumberId = phoneNumbers[0]?.id;

    // ── Step 5: Save to MongoDB ───────────────────────────────────────────────
    await WhatsAppAccount.findOneAndUpdate(
      { waba_id: wabaId },
      {
        waba_id: wabaId,
        phone_number_id: phoneNumberId,
        access_token: accessToken,
        all_phone_numbers: phoneNumbers.map((p) => ({
          id: p.id,
          display_phone_number: p.display_phone_number,
          verified_name: p.verified_name,
        })),
        connected_at: new Date(),
        // userId: req.user?.id  ← uncomment when auth middleware is added
      },
      { upsert: true, new: true }
    );

    console.log("[Meta OAuth] WhatsApp account saved to MongoDB", { wabaId, phoneNumberId });

    return res.send(
      renderHtmlResponse({
        title: "WhatsApp connected",
        message: "✅ WhatsApp connected successfully! You can close this window.",
      })
    );
  } catch (error) {
    logAxiosError("callback processing", error);

    const statusCode = axios.isAxiosError(error)
      ? error.response?.status || 502
      : 500;

    return res.status(statusCode).send(
      renderHtmlResponse({
        title: "WhatsApp connection failed",
        message: "Something went wrong while connecting WhatsApp. Please try again.",
      })
    );
  }
});

export default router;