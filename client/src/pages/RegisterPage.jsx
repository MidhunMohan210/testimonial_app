import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import logo from "../assets/two.svg";
import { register as registerRequest } from "../api/authApi";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
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
      fullName: "",
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
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Registration failed",
      );
    },
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const passwordValue = watch("password");

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.1),transparent_28%),linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)] px-4 py-6 sm:px-6 sm:py-10">
      <Card className="w-full max-w-lg border-white/80 bg-white/92 shadow-[0_32px_80px_-40px_rgba(15,23,42,0.3)] backdrop-blur">
        <CardContent className="p-5 sm:p-8">
          <div className="mb-7 text-center">
            <img src={logo} alt="Woice" className="mx-auto h-6 w-auto sm:h-7" />
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
              Create account
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">Start your Woice workspace</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Set up your business profile and begin collecting reviews in a few minutes.
            </p>
          </div>

          <form
            className="space-y-5"
            onSubmit={handleSubmit((data) =>
              mutation.mutate({
                fullName: data.fullName,
                email: data.email,
                mobile: data.mobile,
                password: data.password,
                confirmPassword: data.confirmPassword,
                businessName: data.businessName,
              })
            )}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50/70"
                  {...register("fullName", {
                    required: "Full name is required",
                    validate: (value) =>
                      value.trim().length >= 2 || "Name must be at least 2 characters",
                  })}
                />
                {errors.fullName ? (
                  <p className="text-sm text-red-600">{errors.fullName.message}</p>
                ) : null}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50/70"
                  {...register("businessName", {
                    required: "Business name is required",
                    validate: (value) =>
                      value.trim().length >= 2 || "Business name must be at least 2 characters",
                  })}
                />
                {errors.businessName ? (
                  <p className="text-sm text-red-600">{errors.businessName.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50/70"
                  {...register("email", {
                    required: "Email is required",
                    validate: (value) =>
                      /\S+@\S+\.\S+/.test(value.trim()) || "Enter a valid email address",
                  })}
                />
                {errors.email ? (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-mobile">Mobile</Label>
                <Input
                  id="register-mobile"
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50/70"
                  {...register("mobile", {
                    required: "Mobile number is required",
                    validate: (value) =>
                      /^\+?[1-9]\d{7,14}$/.test(value.trim()) ||
                      "Enter a valid mobile number with country code",
                  })}
                />
                {errors.mobile ? (
                  <p className="text-sm text-red-600">{errors.mobile.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <div className="relative">
                  <Input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50/70 pr-12"
                    {...register("password", {
                      required: "Password is required",
                      validate: (value) =>
                        value.trim().length >= 8 || "Password must be at least 8 characters",
                    })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-500 transition hover:text-slate-700"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password ? (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50/70 pr-12"
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
                {errors.confirmPassword ? (
                  <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                ) : null}
              </div>
            </div>

            <Button
              className="h-12 w-full rounded-2xl bg-slate-950 text-base font-semibold text-white shadow-[0_18px_36px_-22px_rgba(15,23,42,0.7)] hover:bg-slate-800"
              type="submit"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Creating account..." : "Create Account"}
              {!mutation.isPending ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link className="font-semibold text-slate-950 underline-offset-4 hover:underline" to="/login">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
