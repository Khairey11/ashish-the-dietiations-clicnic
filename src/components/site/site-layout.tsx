"use client";

import * as React from "react";
import { Navigation } from "@/components/site/navigation";
import { Footer } from "@/components/sections/footer";

// Re-export PageHero for backwards compatibility with existing imports
export { PageHero } from "@/components/site/page-hero";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main id="main" className="flex-1 pt-20">{children}</main>
      <Footer />
    </div>
  );
}