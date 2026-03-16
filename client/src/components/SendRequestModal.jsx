import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { sendRequest, sendTestRequest } from "../api/whatsappApi";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function SendRequestModal({ open, onOpenChange }) {
  const [channel, setChannel] = useState("whatsapp");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      customerName: "",
      customerPhone: "+91",
    },
  });

  useEffect(() => {
    if (open) {
      reset({ customerName: "", customerPhone: "+91" });
      setChannel("whatsapp");
    }
  }, [open, reset]);

  const mutation = useMutation({
    mutationFn: ({ channel: selectedChannel, ...payload }) =>
      selectedChannel === "telegram" ? sendTestRequest(payload) : sendRequest(payload),
    onSuccess: (response, variables) => {
      toast.success(
        channel === "telegram"
          ? response.message || "Telegram test request created successfully"
          : `WhatsApp message sent to ${variables.customerName || "customer"}!`
      );
      reset({ customerName: "", customerPhone: "+91" });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          (channel === "telegram"
            ? "Failed to create Telegram test request"
            : "Failed to send WhatsApp request")
      );
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Testimonial Request</DialogTitle>
          <DialogDescription>
            Choose WhatsApp for the real flow or Telegram for local testing without Meta setup.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={handleSubmit((data) => mutation.mutate({ ...data, channel }))}
        >
          <div className="space-y-2">
            <Label>Channel</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                  channel === "whatsapp"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
                onClick={() => setChannel("whatsapp")}
              >
                WhatsApp
              </button>
              <button
                type="button"
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                  channel === "telegram"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
                onClick={() => setChannel("telegram")}
              >
                Telegram Test
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {channel === "telegram"
                ? "This creates a test request in TestiFlow. Complete the conversation in your Telegram bot."
                : "This sends the actual WhatsApp message using your Twilio sandbox or WhatsApp sender."}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="request-name">Customer Name</Label>
            <Input
              id="request-name"
              placeholder="Aarav Sharma"
              {...register("customerName", {
                validate: (value) =>
                  !value || value.trim().length <= 80 || "Customer name must be under 80 characters",
              })}
            />
            {errors.customerName && (
              <p className="text-sm text-red-600">{errors.customerName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="request-phone">Customer Phone</Label>
            <Input
              id="request-phone"
              placeholder="+919999999999"
              {...register("customerPhone", {
                required: "Customer phone is required",
                pattern: {
                  value: /^\+?[1-9]\d{7,14}$/,
                  message: "Enter a valid phone number with country code",
                },
              })}
            />
            {errors.customerPhone && (
              <p className="text-sm text-red-600">{errors.customerPhone.message}</p>
            )}
          </div>

          <Button className="w-full" type="submit" disabled={mutation.isPending}>
            {mutation.isPending
              ? channel === "telegram"
                ? "Creating..."
                : "Sending..."
              : channel === "telegram"
                ? "Create Telegram Test Request"
                : "Send WhatsApp Request"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
