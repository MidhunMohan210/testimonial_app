import { CheckCircle2, Copy, Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

export default function ShareFeedbackSettings({
  publicReviewLink,
  copied,
  onCopyLink,
  shareMessage,
  onShareMessageChange,
  onShareOnWhatsApp,
  messageCopied,
  onCopyMessage,
  onDownloadQrCode,
  qrCodeContainerRef,
  slug,
}) {
  return (
    <div className="">
      <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4 sm:p-5">
        <div className="space-y-5">
          <div>
            <h3 className="text-base font-semibold text-slate-950">Share Feedback Link</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Share this link with customers after their trip/service to collect feedback and
              testimonials.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-feedback-link">Feedback link</Label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                id="settings-feedback-link"
                value={publicReviewLink || "Feedback link is not available yet."}
                readOnly
                className="h-12 rounded-lg border-slate-200 bg-white text-slate-500"
              />
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full rounded-lg px-4 sm:w-auto"
                onClick={onCopyLink}
                disabled={!publicReviewLink}
              >
                {copied ? (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                {copied ? "Copied" : "Copy Link"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-share-message">Greeting message</Label>
            <Textarea
              id="settings-share-message"
              value={shareMessage}
              onChange={(event) => onShareMessageChange(event.target.value)}
              placeholder="Add a greeting message to share with customers."
              className="min-h-[180px] rounded-lg border-slate-200"
              disabled={!publicReviewLink}
              maxLength={500}
            />
            <p className="text-sm leading-6 text-slate-500">
              Customers will see this message in WhatsApp before you choose who to send it to.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              className="h-11 rounded-lg bg-slate-950 px-4 text-white hover:bg-slate-800"
              onClick={onShareOnWhatsApp}
              disabled={!publicReviewLink}
            >
              <FaWhatsapp className="mr-2 h-4 w-4 text-[#25D366]" />
              Share on WhatsApp
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-lg px-4"
              onClick={onCopyMessage}
              disabled={!publicReviewLink}
            >
              {messageCopied ? (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              {messageCopied ? "Copied" : "Copy Message"}
            </Button>
          </div>

          {publicReviewLink ? (
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">QR code preview</p>
                  <p className="text-sm leading-6 text-slate-500">
                    Customers can scan this code to open your feedback form.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-lg px-4"
                  onClick={onDownloadQrCode}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download QR Code
                </Button>
              </div>

              <div className="mt-5 flex justify-center sm:justify-start">
                <div
                  ref={qrCodeContainerRef}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <QRCodeSVG
                    value={publicReviewLink}
                    size={180}
                    includeMargin
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                    title={`Feedback QR for ${slug}`}
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
