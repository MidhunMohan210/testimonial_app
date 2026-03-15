import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { addManual } from "../api/testimonialApi";
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
import { Textarea } from "./ui/textarea";

function RatingSelector({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: 5 }).map((_, index) => {
        const rating = index + 1;
        return (
          <button
            key={rating}
            type="button"
            className={`text-2xl transition ${rating <= value ? "text-amber-500" : "text-slate-300"}`}
            onClick={() => onChange(rating)}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

export default function ManualAddModal({ open, onOpenChange, activeStatus }) {
  const queryClient = useQueryClient();
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      customerName: "",
      customerPhone: "",
      rating: 5,
      testimonialText: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        customerName: "",
        customerPhone: "",
        rating: 5,
        testimonialText: "",
      });
    }
  }, [open, reset]);

  const mutation = useMutation({
    mutationFn: addManual,
    onSuccess: async () => {
      toast.success("Testimonial added successfully");
      reset({
        customerName: "",
        customerPhone: "",
        rating: 5,
        testimonialText: "",
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["testimonials"] }),
        queryClient.invalidateQueries({ queryKey: ["testimonials", activeStatus] }),
      ]);
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add testimonial");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Testimonial Manually</DialogTitle>
          <DialogDescription>
            Capture offline feedback and publish it straight to your dashboard.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit((data) => mutation.mutate(data))}>
          <div className="space-y-2">
            <Label htmlFor="manual-name">Customer Name</Label>
            <Input
              id="manual-name"
              placeholder="Priya Patel"
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
            <Label htmlFor="manual-phone">Customer Phone</Label>
            <Input
              id="manual-phone"
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

          <div className="space-y-2">
            <Label>Rating</Label>
            <Controller
              control={control}
              name="rating"
              rules={{
                required: "Rating is required",
                min: { value: 1, message: "Rating must be at least 1" },
                max: { value: 5, message: "Rating cannot exceed 5" },
              }}
              render={({ field }) => (
                <RatingSelector value={field.value} onChange={field.onChange} />
              )}
            />
            {errors.rating && <p className="text-sm text-red-600">{errors.rating.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="manual-text">Review Text</Label>
            <Textarea
              id="manual-text"
              placeholder="They loved the quick service and smooth onboarding."
              {...register("testimonialText", {
                required: "Review text is required",
                validate: (value) =>
                  value.trim().length >= 10 || "Review should be at least 10 characters",
              })}
            />
            {errors.testimonialText && (
              <p className="text-sm text-red-600">{errors.testimonialText.message}</p>
            )}
          </div>

          <Button className="w-full" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save Testimonial"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
