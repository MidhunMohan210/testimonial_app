import { useEffect, useRef, useState } from "react";
import { LoaderCircle, MessageCirclePlus } from "lucide-react";
import { toast } from "sonner";
import { connectWhatsAppEmbeddedSignup } from "../api/whatsappApi";
import { useAuth } from "../hooks/useAuth";
import { Button } from "./ui/button";

const FACEBOOK_SDK_ID = "facebook-jssdk";
const FACEBOOK_SDK_SRC = "https://connect.facebook.net/en_US/sdk.js";
const FACEBOOK_ORIGIN = "https://www.facebook.com";
const FACEBOOK_SDK_VERSION = "v25.0";

const parseEmbeddedSignupMessage = (rawData) => {
  if (typeof rawData === "object" && rawData !== null) {
    return rawData;
  }

  if (typeof rawData !== "string") {
    return null;
  }

  try {
    return JSON.parse(rawData);
  } catch {
    return null;
  }
};

const getFacebookSdkConfig = () => {
  const appId = import.meta.env.VITE_META_APP_ID;
  const configId = import.meta.env.VITE_META_CONFIG_ID;

  if (!appId || !configId) {
    throw new Error(
      "Missing Facebook Embedded Signup configuration. Set VITE_META_APP_ID and VITE_META_CONFIG_ID."
    );
  }

  return { appId, configId };
};

const loadFacebookSdk = (appId) =>
  new Promise((resolve, reject) => {
    if (window.FB) {
      resolve(window.FB);
      return;
    }

    const initializeSdk = () => {
      if (!window.FB) {
        reject(new Error("Facebook SDK loaded, but FB is unavailable."));
        return;
      }

      window.FB.init({
        appId,
        autoLogAppEvents: true,
        xfbml: true,
        version: FACEBOOK_SDK_VERSION,
      });

      resolve(window.FB);
    };

    window.fbAsyncInit = initializeSdk;

    const existingScript = document.getElementById(FACEBOOK_SDK_ID);

    if (existingScript) {
      return;
    }

    const script = document.createElement("script");
    script.id = FACEBOOK_SDK_ID;
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.src = FACEBOOK_SDK_SRC;
    script.onerror = () => reject(new Error("Failed to load Facebook SDK."));

    document.body.appendChild(script);
  });

export default function WhatsAppEmbeddedSignupButton() {
  const { business, updateBusiness } = useAuth();
  const [sdkReady, setSdkReady] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    let cancelled = false;
    let appId;

    try {
      ({ appId } = getFacebookSdkConfig());
    } catch (error) {
      console.error("[WhatsApp Embedded Signup] Invalid SDK config", error);
      toast.error(error.message);
      return () => {
        isMountedRef.current = false;
      };
    }

    const handleMessage = async (event) => {
      if (event.origin !== FACEBOOK_ORIGIN) {
        return;
      }

      const message = parseEmbeddedSignupMessage(event.data);

      if (!message || message.type !== "WA_EMBEDDED_SIGNUP") {
        return;
      }

      console.log("[WhatsApp Embedded Signup] Message received", message);

      if (message.event === "FINISH") {
        const wabaId = message.data?.waba_id;
        const phoneNumberId = message.data?.phone_number_id;

        if (!wabaId || !phoneNumberId) {
          console.error("[WhatsApp Embedded Signup] Missing identifiers in FINISH event", {
            waba_id: wabaId,
            phone_number_id: phoneNumberId,
          });

          toast.error("WhatsApp signup finished, but Meta did not return the required IDs.");

          if (isMountedRef.current) {
            setIsConnecting(false);
          }

          return;
        }

        console.log("[WhatsApp Embedded Signup] WABA ID:", wabaId);
        console.log("[WhatsApp Embedded Signup] Phone Number ID:", phoneNumberId);

        try {
          const response = await connectWhatsAppEmbeddedSignup({
            waba_id: wabaId,
            phone_number_id: phoneNumberId,
          });

          updateBusiness(response.business);

          toast.success("WhatsApp connected successfully.");
        } catch (error) {
          const message =
            error.response?.data?.message || "Failed to save WhatsApp connection.";
          console.error("[WhatsApp Embedded Signup] Save failed", error);
          toast.error(message);
        } finally {
          if (isMountedRef.current) {
            setIsConnecting(false);
          }
        }

        return;
      }

      if (message.event === "CANCEL") {
        console.warn("[WhatsApp Embedded Signup] Signup cancelled", message.data);
        toast.message("WhatsApp signup was cancelled.");

        if (isMountedRef.current) {
          setIsConnecting(false);
        }

        return;
      }

      if (message.event === "ERROR") {
        console.error("[WhatsApp Embedded Signup] Meta returned an error", message.data);
        toast.error("Meta reported an error during WhatsApp signup.");

        if (isMountedRef.current) {
          setIsConnecting(false);
        }
      }
    };

    window.addEventListener("message", handleMessage);

    loadFacebookSdk(appId)
      .then(() => {
        if (!cancelled && isMountedRef.current) {
          setSdkReady(true);
        }
      })
      .catch((error) => {
        console.error("[WhatsApp Embedded Signup] SDK load failed", error);
        if (!cancelled) {
          toast.error(error.message || "Failed to load Facebook SDK.");
        }
      });

    return () => {
      cancelled = true;
      isMountedRef.current = false;
      window.removeEventListener("message", handleMessage);
    };
  }, [updateBusiness]);

  const handleConnect = () => {
    let configId;

    try {
      ({ configId } = getFacebookSdkConfig());
    } catch (error) {
      toast.error(error.message);
      return;
    }

    if (!sdkReady || !window.FB) {
      toast.error("Facebook SDK is still loading. Please try again.");
      return;
    }

    setIsConnecting(true);

    // Embedded Signup is launched through FB.login and returns connection details
    // back to the window via postMessage events.
    window.FB.login(
      (response) => {
        console.log("[WhatsApp Embedded Signup] FB.login response", response);

        if (!response.authResponse) {
          toast.message("WhatsApp signup was cancelled before authorization.");

          if (isMountedRef.current) {
            setIsConnecting(false);
          }
        }
      },
      {
        config_id: configId,
        response_type: "code",
        override_default_response_type: true,
        extras: {
          feature: "whatsapp_embedded_signup",
          sessionInfoVersion: "3",
        },
      }
    );
  };

  const isConnected = Boolean(
    business?.whatsappBusinessAccountId && business?.whatsappPhoneNumberId
  );

  return (
    <Button
      variant={isConnected ? "outline" : "default"}
      className="w-full justify-center gap-2"
      onClick={handleConnect}
      disabled={isConnecting || !sdkReady}
    >
      {isConnecting ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        <MessageCirclePlus className="h-4 w-4" />
      )}
      {isConnected ? "Reconnect WhatsApp" : "Connect WhatsApp"}
    </Button>
  );
}
