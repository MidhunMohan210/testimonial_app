import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { sendRequest } from "../api/whatsappApi";
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
    }
  }, [open, reset]);

  const mutation = useMutation({
    mutationFn: sendRequest,
    onSuccess: (_, variables) => {
      toast.success(`WhatsApp message sent to ${variables.customerName || "customer"}!`);
      reset({ customerName: "", customerPhone: "+91" });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to send WhatsApp request");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send WhatsApp Request</DialogTitle>
          <DialogDescription>
            Ask a customer for a quick rating and testimonial directly in WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit((data) => mutation.mutate(data))}>
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
            {mutation.isPending ? "Sending..." : "Send WhatsApp Request"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
