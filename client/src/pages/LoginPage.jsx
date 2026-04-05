import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, MessageSquareQuote } from "lucide-react";
import { toast } from "sonner";
import { login as loginRequest } from "../api/authApi";
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
      toast.error(error.response?.data?.message || "Login failed");
    },
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md border-white/80 bg-white/95">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-primary-foreground">
            <MessageSquareQuote className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <CardTitle>Welcome to Woice</CardTitle>
            <CardDescription>Collect customer love directly from WhatsApp.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit((data) => mutation.mutate(data))}>
            <div className="space-y-2">
              <Label htmlFor="emailOrMobile">Email or Mobile</Label>
              <Input
                id="emailOrMobile"
                {...register("emailOrMobile", {
                  required: "Email or mobile is required",
                  validate: (value) =>
                    value.trim().length >= 3 || "Enter a valid email or mobile",
                })}
              />
              {errors.emailOrMobile && (
                <p className="text-sm text-red-600">{errors.emailOrMobile.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
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
            <Button className="w-full" type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link className="font-semibold text-foreground underline-offset-4 hover:underline" to="/register">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
