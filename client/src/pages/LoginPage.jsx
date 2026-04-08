import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import logo from "../assets/logo2.svg";
import { login as loginRequest } from "../api/authApi";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      emailOrMobile: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      login(data);
      toast.success("Welcome back to Woice");
      navigate("/dashboard");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Login failed",
      );
    },
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(65,90,119,0.14),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)] px-4 py-6 sm:px-6 sm:py-10">
      <Card className="w-full max-w-md border-white/80 bg-white/92 shadow-[0_32px_80px_-40px_rgba(15,23,42,0.3)] backdrop-blur">
        <CardContent className="p-5 sm:p-8">
          <div className="mb-7 text-center">
            <img src={logo} alt="Woice" className="mx-auto h-12 w-auto sm:h-14" />
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
              Sign in
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">Welcome back</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Access your Woice workspace and continue collecting testimonials.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit((data) => mutation.mutate(data))}>
            <div className="space-y-2">
              <Label htmlFor="emailOrMobile">Email or Mobile</Label>
              <Input
                id="emailOrMobile"
                className="h-12 rounded-2xl border-slate-200 bg-slate-50/70"
                {...register("emailOrMobile", {
                  required: "Email or mobile is required",
                  validate: (value) =>
                    value.trim().length >= 3 || "Enter a valid email or mobile",
                })}
              />
              {errors.emailOrMobile ? (
                <p className="text-sm text-red-600">{errors.emailOrMobile.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50/70 pr-12"
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
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password ? (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              ) : null}
            </div>

            <Button
              className="h-12 w-full rounded-2xl bg-slate-950 text-base font-semibold text-white shadow-[0_18px_36px_-22px_rgba(15,23,42,0.7)] hover:bg-slate-800"
              type="submit"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Signing in..." : "Sign In"}
              {!mutation.isPending ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link className="font-semibold text-slate-950 underline-offset-4 hover:underline" to="/register">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
