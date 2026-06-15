import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  getBusinessSettings,
  updateShareFeedbackSettings,
  updateBusinessSettings,
} from "../api/businessApi";
import BusinessProfileSettings from "../components/settings/BusinessProfileSettings";
import ReviewFlowSettings from "../components/settings/ReviewFlowSettings";
import SettingsOverview from "../components/settings/SettingsOverview";
import SettingsSectionLayout from "../components/settings/SettingsSectionLayout";
import ShareFeedbackSettings from "../components/settings/ShareFeedbackSettings";
import {
  SETTINGS_SECTION_IDS,
  SETTINGS_SECTIONS,
} from "../components/settings/settingsConfig";
import { ErrorStateCard } from "../components/StateCard";
import { Skeleton } from "../components/ui/skeleton";
import { getPublicAppUrl } from "../lib/publicUrl";
import {
  buildShareFeedbackFinalMessage,
  getShareFeedbackMessage,
} from "../lib/shareFeedback";
import { useAuth } from "../hooks/useAuth";

async function copyText(value) {
  if (!value) return false;

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fall through to the legacy copy approach below.
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
}

function SettingsLoadingState() {
  return (
    <div className="mx-auto max-w-5xl space-y-5 sm:space-y-6">
      <Skeleton className="h-32 w-full rounded-[2rem]" />
      <div className="grid gap-5 lg:grid-cols-2">
        <Skeleton className="h-72 w-full rounded-[2rem]" />
        <Skeleton className="h-72 w-full rounded-[2rem]" />
      </div>
      <Skeleton className="h-56 w-full rounded-[2rem]" />
    </div>
  );
}

export default function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { business, updateBusiness: updateBusinessInAuth } = useAuth();
  const [formError, setFormError] = useState("");
  const [copied, setCopied] = useState(false);
  const [messageCopied, setMessageCopied] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const qrCodeContainerRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      name: "",
      googleReviewLink: "",
      googleReviewEnabled: false,
      isPublicEnabled: true,
      notificationsEnabled: true,
    },
  });

  const settingsQuery = useQuery({
    queryKey: ["business", "settings"],
    queryFn: getBusinessSettings,
  });

  useEffect(() => {
    if (settingsQuery.data) {
      reset(settingsQuery.data);
      setShareMessage(getShareFeedbackMessage(settingsQuery.data));
      setFormError("");
    }
  }, [reset, settingsQuery.data]);

  const slug = settingsQuery.data?.slug || "";
  const publicReviewLink = useMemo(
    () => (slug ? `${getPublicAppUrl()}/r/${slug}` : ""),
    [slug],
  );
  const persistedShareMessage = getShareFeedbackMessage(settingsQuery.data);

  const mutation = useMutation({
    mutationFn: updateBusinessSettings,
    onSuccess: async (data) => {
      setFormError("");
      reset(data);
      queryClient.setQueryData(["business", "settings"], data);
      queryClient.setQueryData(["business", "me"], {
        ...(business || {}),
        businessName: data.name,
        slug: data.slug,
        googleReviewLink: data.googleReviewLink,
        googleReviewEnabled: data.googleReviewEnabled,
        isPublicEnabled: data.isPublicEnabled,
        notificationsEnabled: data.notificationsEnabled,
        settings: data.settings,
      });
      updateBusinessInAuth({
        ...(business || {}),
        businessName: data.name,
        slug: data.slug,
        googleReviewLink: data.googleReviewLink,
        googleReviewEnabled: data.googleReviewEnabled,
        isPublicEnabled: data.isPublicEnabled,
        notificationsEnabled: data.notificationsEnabled,
        settings: data.settings,
      });
      toast.success("Settings saved");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["auth"] }),
      ]);
    },
    onError: (error) => {
      const payload = error.response?.data;
      const details = Array.isArray(payload?.details) ? payload.details : [];

      if (details.length > 0) {
        setFormError(details[0].message || "Please review the form and try again.");
        details.forEach((detail) => {
          if (detail?.field) {
            setError(detail.field, {
              type: "server",
              message: detail.message,
            });
          }
        });
        return;
      }

      setFormError(payload?.message || payload?.error || "Failed to save settings");
    },
  });

  const shareFeedbackMutation = useMutation({
    mutationFn: updateShareFeedbackSettings,
    onSuccess: async (data) => {
      const nextBusiness = data.business;
      const nextSettings = data.settings;

      setFormError("");
      setShareMessage(getShareFeedbackMessage(nextSettings));
      queryClient.setQueryData(["business", "settings"], nextSettings);
      queryClient.setQueryData(["business", "me"], nextBusiness);
      updateBusinessInAuth({
        ...(business || {}),
        ...nextBusiness,
      });
      toast.success(data.message);
      await queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
    onError: (error) => {
      const payload = error.response?.data;
      const message =
        payload?.message || payload?.error || "Failed to save greeting message";

      setFormError(message);
      toast.error(message);
    },
  });

  const handleCopyLink = async () => {
    if (!publicReviewLink) return;

    const didCopy = await copyText(publicReviewLink);

    if (didCopy) {
      setCopied(true);
      toast.success("Link copied");
      window.setTimeout(() => setCopied(false), 2000);
      return;
    }

    toast.error("Could not copy the link. Please copy it manually.");
  };

  const handleCopyMessage = async () => {
    if (!publicReviewLink) return;

    const finalMessage = buildShareFeedbackFinalMessage(
      settingsQuery.data,
      shareMessage,
      publicReviewLink,
    );

    const didCopy = await copyText(finalMessage);

    if (didCopy) {
      setMessageCopied(true);
      toast.success("Message copied");
      window.setTimeout(() => setMessageCopied(false), 2000);
      return;
    }

    toast.error("Could not copy the message. Please copy it manually.");
  };

  const handleShareOnWhatsApp = () => {
    if (!publicReviewLink) {
      toast.error("Feedback link is not available yet.");
      return;
    }

    const finalMessage = buildShareFeedbackFinalMessage(
      settingsQuery.data,
      shareMessage,
      publicReviewLink,
    );
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(finalMessage)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleDownloadQrCode = async () => {
    if (!publicReviewLink) {
      toast.error("Feedback link is not available yet.");
      return;
    }

    const svgElement = qrCodeContainerRef.current?.querySelector("svg");

    if (!svgElement) {
      toast.error("QR code is not ready yet.");
      return;
    }

    try {
      const serializer = new XMLSerializer();
      const svgMarkup = serializer.serializeToString(svgElement);
      const svgBlob = new Blob([svgMarkup], {
        type: "image/svg+xml;charset=utf-8",
      });
      const svgUrl = URL.createObjectURL(svgBlob);
      const image = new Image();

      image.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 512;
        const context = canvas.getContext("2d");

        canvas.width = size;
        canvas.height = size;

        if (!context) {
          URL.revokeObjectURL(svgUrl);
          toast.error("Could not prepare the QR code download.");
          return;
        }

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, size, size);
        context.drawImage(image, 0, 0, size, size);

        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `woice-${slug}-qr.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(svgUrl);
      };

      image.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        toast.error("Could not download the QR code.");
      };

      image.src = svgUrl;
    } catch {
      toast.error("Could not download the QR code.");
    }
  };

  const googleReviewLinkValue = watch("googleReviewLink") || "";
  const hasGoogleReviewLink = Boolean(googleReviewLinkValue.trim());
  const requestedSection = searchParams.get("section");
  const activeSection = SETTINGS_SECTION_IDS.has(requestedSection) ? requestedSection : null;
  const activeTabMeta =
    SETTINGS_SECTIONS.find((item) => item.id === activeSection) || null;
  const isShareSection = activeSection === "share-feedback";
  const isShareMessageDirty = shareMessage !== persistedShareMessage;

  const handleFormSubmit = handleSubmit(async (values) => {
    clearErrors();
    setFormError("");
    await mutation.mutateAsync({
      ...values,
      googleReviewEnabled: values.googleReviewLink?.trim()
        ? values.googleReviewEnabled
        : false,
    });
  });

  const onSubmit = async (event) => {
    if (isShareSection) {
      event.preventDefault();
      clearErrors();
      setFormError("");
      await shareFeedbackMutation.mutateAsync({
        greetingMessage: shareMessage,
      });
      return;
    }

    await handleFormSubmit(event);
  };

  if (settingsQuery.isLoading) {
    return <SettingsLoadingState />;
  }

  if (settingsQuery.isError) {
    return (
      <ErrorStateCard
        message="We couldn’t load your settings right now."
        onRetry={settingsQuery.refetch}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6 px-3">
      <form id="settings-form" onSubmit={onSubmit}>
        {!activeSection ? (
          <SettingsOverview
            sections={SETTINGS_SECTIONS}
            onSelect={(sectionId) => setSearchParams({ section: sectionId })}
          />
        ) : (
          <SettingsSectionLayout
            section={activeTabMeta}
            onBack={() => setSearchParams({})}
            onSubmit={onSubmit}
            isSaving={isShareSection ? shareFeedbackMutation.isPending : mutation.isPending}
            isSaveDisabled={
              settingsQuery.isLoading || (isShareSection ? !isShareMessageDirty : !isDirty)
            }
            error={formError}
          >
            {activeSection === "business-profile" ? (
              <BusinessProfileSettings register={register} errors={errors} />
            ) : null}

            {activeSection === "review-flow" ? (
              <ReviewFlowSettings
                register={register}
                errors={errors}
                hasGoogleReviewLink={hasGoogleReviewLink}
                googleReviewEnabled={watch("googleReviewEnabled")}
                onGoogleReviewEnabledChange={(value) =>
                  hasGoogleReviewLink
                    ? setValue("googleReviewEnabled", value, { shouldDirty: true })
                    : undefined
                }
                googleReviewLinkValue={googleReviewLinkValue}
              />
            ) : null}

            {activeSection === "share-feedback" ? (
              <ShareFeedbackSettings
                publicReviewLink={publicReviewLink}
                copied={copied}
                onCopyLink={handleCopyLink}
                shareMessage={shareMessage}
                onShareMessageChange={setShareMessage}
                onShareOnWhatsApp={handleShareOnWhatsApp}
                messageCopied={messageCopied}
                onCopyMessage={handleCopyMessage}
                onDownloadQrCode={handleDownloadQrCode}
                qrCodeContainerRef={qrCodeContainerRef}
                slug={slug}
              />
            ) : null}
          </SettingsSectionLayout>
        )}
      </form>
    </div>
  );
}
