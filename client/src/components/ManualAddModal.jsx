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
            className={`text-[1.65rem] transition sm:text-2xl ${rating <= value ? "text-amber-500" : "text-slate-300"}`}
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
      rating: 5,
      testimonialText: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        customerName: "",
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
      // Show backend validation errors if present
      const details = error.response?.data?.details;
      if (details?.length) {
        toast.error(details[0].message);
      } else {
        toast.error(error.response?.data?.message || "Failed to add testimonial");
      }
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

        <form className="space-y-3.5 sm:space-y-4" onSubmit={handleSubmit((data) => mutation.mutate(data))}>
          <div className="space-y-2">
            <Label htmlFor="manual-name">Customer Name</Label>
            <Input
              id="manual-name"
              placeholder="Priya Patel"
              {...register("customerName", {
                required: "Customer name is required",
                validate: (value) =>
                  value.trim().length <= 100 || "Name must be under 100 characters",
              })}
            />
            {errors.customerName && (
              <p className="text-sm text-red-600">{errors.customerName.message}</p>
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
            {errors.rating && (
              <p className="text-sm text-red-600">{errors.rating.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="manual-text">Review Text</Label>
            <Textarea
              id="manual-text"
              placeholder="They loved the quick service and smooth onboarding."
              {...register("testimonialText", {
                required: "Review text is required",
                validate: (value) => {
                  const trimmed = value.trim();

                  if (trimmed.length < 10) {
                    return "Review should be at least 10 characters";
                  }

                  if (trimmed.length > 1000) {
                    return "Review must be 1000 characters or fewer";
                  }

                  return true;
                },
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
