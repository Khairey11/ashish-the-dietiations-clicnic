"use client";

import * as React from "react";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ShareButton({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = React.useState(false);

  const share = async () => {
    const fullUrl = typeof window !== "undefined" ? window.location.href : url;
    // Try native share API (mobile browsers)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url: fullUrl });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success("Link copied!", { description: "Share it anywhere." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy link", { description: "Copy it manually from the address bar." });
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={share}>
      {copied ? (
        <Check className="w-3.5 h-3.5 mr-1.5" />
      ) : (
        <Share2 className="w-3.5 h-3.5 mr-1.5" />
      )}
      {copied ? "Copied!" : "Share"}
    </Button>
  );
}
