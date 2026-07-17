"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, ArrowLeft, ArrowRight, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Navigation } from "@/components/site/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <ResetPasswordForm />
    </React.Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const validatePassword = (val: string) => {
    if (!val) return "Password is required";
    if (val.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(val)) return "Password must contain at least one uppercase letter";
    if (!/[0-9]/.test(val)) return "Password must contain at least one number";
    return null;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Invalid reset link. Please request a new one.");
      return;
    }

    const pwError = validatePassword(password);
    if (pwError) {
      setError(pwError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        toast.success("Password reset!", {
          description: "You can now log in with your new password.",
        });
        setTimeout(() => router.push("/login"), 3000);
      } else {
        setError(data.error || "Failed to reset password");
        toast.error("Reset failed", { description: data.error });
      }
    } catch {
      setError("Network error. Please try again.");
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main id="main" className="flex-1 pt-20 flex items-center justify-center px-4">
          <div className="w-full max-w-md text-center">
            <h1 className="text-2xl font-bold mb-2">Invalid Reset Link</h1>
            <p className="text-sm text-muted-foreground mb-6">
              This password reset link is invalid or missing. Please request a new one.
            </p>
            <Link href="/forgot-password">
              <Button className="bg-gradient-to-r from-primary to-secondary">
                Request new link
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main id="main" className="flex-1 pt-20 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Password Reset!</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Your password has been changed. Redirecting to login...
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold tracking-tight mb-2">Reset your password</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Choose a strong password for your account.
              </p>

              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs">New password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(null); }}
                      placeholder="••••••••"
                      className={`h-11 pl-9 pr-9 ${error ? "border-rose-500" : ""}`}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirm" className="text-xs">Confirm password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirm"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                      placeholder="••••••••"
                      className={`h-11 pl-9 ${error ? "border-rose-500" : ""}`}
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
                )}

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Password requirements:</p>
                  <ul className="space-y-0.5 ml-4">
                    <li className={password.length >= 8 ? "text-emerald-600" : ""}>• At least 8 characters</li>
                    <li className={/[A-Z]/.test(password) ? "text-emerald-600" : ""}>• One uppercase letter</li>
                    <li className={/[0-9]/.test(password) ? "text-emerald-600" : ""}>• One number</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !password || !confirmPassword}
                  className="w-full h-11 bg-gradient-to-r from-primary to-secondary"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Reset password
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/login" className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3" />
                  Back to login
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
