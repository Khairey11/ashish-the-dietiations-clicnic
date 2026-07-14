"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, User, ShieldCheck, Sparkles } from "lucide-react";
import { Navigation } from "@/components/site/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function LoginPage() {
  return (
    <React.Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </React.Suspense>
  );
}

function LoginFallback() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main id="main" className="flex-1 pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </main>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [mode, setMode] = React.useState<"login" | "register">("login");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: { email?: string; password?: string } = {};
    if (!email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Please enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Welcome back!", {
          description: "Redirecting to your dashboard...",
        });
        router.push(next);
        router.refresh();
      } else {
        toast.error("Sign-in failed", {
          description: data.error || "Invalid credentials.",
        });
      }
    } catch {
      toast.error("Sign-in failed", {
        description: "Network error. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main id="main" className="flex-1 pt-20 grid lg:grid-cols-2">
        {/* Left: form */}
        <div className="flex items-center justify-center p-6 sm:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <div className="lg:hidden mb-8 flex justify-center">
              <img src="/logo-transparent.png" alt="" className="w-12 h-12 object-contain" />
            </div>

            <h1 className="text-3xl font-bold tracking-tight">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {mode === "login"
                ? "Sign in to access your dashboard, meal plans and appointments."
                : "Start your transformation journey in under 2 minutes."}
            </p>

            <form onSubmit={submit} className="mt-8 space-y-4">
              {mode === "register" && (
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs">Full name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Sneha Karki"
                      className="h-11 pl-9"
                      required
                    />
                  </div>
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors({}); }}
                    placeholder="you@email.com"
                    className={`h-11 pl-9 ${errors.email ? "border-rose-500" : ""}`}
                    autoComplete="email"
                    required
                  />
                </div>
                {errors.email && <p className="text-xs text-rose-600 dark:text-rose-400">{errors.email}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors({}); }}
                    placeholder="••••••••"
                    className={`h-11 pl-9 ${errors.password ? "border-rose-500" : ""}`}
                    autoComplete="current-password"
                    minLength={6}
                    required
                  />
                </div>
                {errors.password && <p className="text-xs text-rose-600 dark:text-rose-400">{errors.password}</p>}
              </div>

              {mode === "login" && (
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span className="text-muted-foreground">Remember me</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-primary font-medium hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-primary to-secondary"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === "login" ? "Sign in" : "Create account"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">or continue with</span>
              <Separator className="flex-1" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-11"
                disabled
                title="Coming soon"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/></svg>
                Google
              </Button>
              <Button
                variant="outline"
                className="h-11"
                disabled
                title="Coming soon"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                Apple
              </Button>
            </div>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="text-primary font-semibold hover:underline"
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Are you a clinician or admin?{" "}
              <Link href="/admin" className="text-primary font-medium hover:underline">
                Go to admin portal
              </Link>
            </p>
          </motion.div>
        </div>

        {/* Right: marketing panel */}
        <div className="hidden lg:flex relative bg-gradient-to-br from-primary to-secondary p-12 items-center justify-center overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/30 rounded-full blur-3xl" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative max-w-md text-white"
          >
            <Sparkles className="w-10 h-10 mb-6" />
            <h2 className="text-3xl font-bold leading-tight mb-4">
              Your health journey, beautifully tracked.
            </h2>
            <p className="text-white/85 leading-relaxed mb-8">
              Sign in to access your personalised meal plans, track progress, message your dietitian, and review your reports — all in one elegant dashboard.
            </p>

            <div className="space-y-3">
              {[
                "Personalised meal plans that adapt weekly",
                "Real-time progress tracking with charts",
                "Direct messaging with your dietitian",
                "Secure lab report storage & review",
              ].map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm text-white/90">{f}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 p-5 rounded-2xl bg-white/10 backdrop-blur border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl font-bold">SK</div>
                <div>
                  <p className="font-semibold">Sneha K.</p>
                  <p className="text-xs text-white/80">Premium member · 16 weeks</p>
                </div>
              </div>
              <p className="mt-3 text-sm italic text-white/90">
                &ldquo;The dashboard keeps me accountable. Seeing my progress chart every morning is the motivation I need.&rdquo;
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
