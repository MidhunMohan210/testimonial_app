import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, MessageSquareQuote } from "lucide-react";
import { toast } from "sonner";
import { register as registerRequest } from "../api/authApi";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      password: "",
      confirmPassword: "",
      businessName: "",
    },
  });

  const mutation = useMutation({
    mutationFn: registerRequest,
    onSuccess: (data) => {
      login(data);
      toast.success("Your Woice workspace is ready");
      navigate("/dashboard");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Registration failed");
    },
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const passwordValue = watch("password");

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-lg border-white/80 bg-white/95">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-primary-foreground">
            <MessageSquareQuote className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <CardTitle>Create your Woice account</CardTitle>
            <CardDescription>Launch a testimonial pipeline in a few minutes.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={handleSubmit((data) =>
              mutation.mutate({
                name: data.name,
                email: data.email,
                mobile: data.mobile,
                password: data.password,
                businessName: data.businessName,
              })
            )}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  {...register("name", {
                    required: "Full name is required",
                    validate: (value) =>
                      value.trim().length >= 2 || "Name must be at least 2 characters",
                  })}
                />
                {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  {...register("businessName", {
                    required: "Business name is required",
                    validate: (value) =>
                      value.trim().length >= 2 || "Business name must be at least 2 characters",
                  })}
                />
                {errors.businessName && (
                  <p className="text-sm text-red-600">{errors.businessName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    validate: (value) =>
                      /\S+@\S+\.\S+/.test(value.trim()) || "Enter a valid email address",
                  })}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-mobile">Mobile</Label>
                <Input
                  id="register-mobile"
                  {...register("mobile", {
                    required: "Mobile number is required",
                    validate: (value) =>
                      /^\+?[1-9]\d{7,14}$/.test(value.trim()) ||
                      "Enter a valid mobile number with country code",
                  })}
                />
                {errors.mobile && (
                  <p className="text-sm text-red-600">{errors.mobile.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <div className="relative">
                  <Input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    className="pr-12"
                    {...register("password", {
                      required: "Password is required",
                      validate: (value) =>
                        value.trim().length >= 6 || "Password must be at least 6 characters",
                    })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-500 transition hover:text-slate-700"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className="pr-12"
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (value) =>
                        value === passwordValue || "Passwords do not match",
                    })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-500 transition hover:text-slate-700"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
            <Button className="w-full" type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link className="font-semibold text-foreground underline-offset-4 hover:underline" to="/login">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
