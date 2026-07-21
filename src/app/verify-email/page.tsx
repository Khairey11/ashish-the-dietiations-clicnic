"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MailCheck, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { Navigation } from "@/components/site/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Status = "loading" | "success" | "error" | "expired";

export default function VerifyEmailPage() {
  return (
    <React.Suspense fallback={<LoadingState />}>
      <VerifyEmailContent />
    </React.Suspense>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main id="main" className="flex-1 pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    </div>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = React.useState<Status>("loading");
  const [errorMsg, setErrorMsg] = React.useState("");

  React.useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMsg("No verification token was provided. Please check the link in your email.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
          // Use a GET so the verify-email link works from any email client.
          method: "GET",
        });
        const data = await res.json();
        if (cancelled) return;
        if (data.success) {
          setStatus("success");
          toast.success("Email verified!", {
            description: "Welcome to Ashish Nutrition Clinic.",
          });
          // Redirect to the dashboard after a short delay so the user can
          // see the success state.
          setTimeout(() => {
            router.push("/dashboard");
            router.refresh();
          }, 1800);
        } else {
          const msg = data.error || "Verification failed.";
          if (msg.toLowerCase().includes("expired")) {
            setStatus("expired");
          } else {
            setStatus("error");
          }
          setErrorMsg(msg);
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
          setErrorMsg("Network error. Please try again.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, router]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main id="main" className="flex-1 pt-20 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md text-center"
        >
          {status === "loading" && (
            <>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Verifying your email…</h1>
              <p className="text-sm text-muted-foreground">
                Hang tight — we&apos;re confirming your account.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-6">
                <MailCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Email verified!</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Your account is now active. Redirecting you to your dashboard…
              </p>
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-primary to-secondary">
                  Go to dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-full bg-rose-500/15 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-400" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Verification failed</h1>
              <p className="text-sm text-muted-foreground mb-6">{errorMsg}</p>
              <Link href="/login">
                <Button variant="outline">Back to login</Button>
              </Link>
            </>
          )}

          {status === "expired" && (
            <>
              <div className="w-16 h-16 rounded-full bg-amber-500/15 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Link expired</h1>
              <p className="text-sm text-muted-foreground mb-6">
                This verification link has expired. You can request a new one from your dashboard.
              </p>
              <Link href="/login">
                <Button className="bg-gradient-to-r from-primary to-secondary">
                  Go to login
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
