import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Dietitian's Clinic",
    short_name: "TDC",
    description: "Premium dietitian & nutrition consultancy. Book consultations, follow science-backed diet programs, and track your transformation.",
    start_url: "/",
    display: "standalone",
    background_color: "#F8FAFC",
    theme_color: "#16A34A",
    orientation: "portrait-primary",
    categories: ["health", "medical", "lifestyle"],
    icons: [
      {
        src: "/logo-transparent.png",
        sizes: "506x480",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo-transparent.png",
        sizes: "506x480",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Book Consultation",
        short_name: "Book",
        description: "Reserve a consultation slot",
        url: "/booking",
      },
      {
        name: "Programs & Pricing",
        short_name: "Programs",
        description: "Compare our nutrition programs",
        url: "/programs",
      },
      {
        name: "Client Dashboard",
        short_name: "Dashboard",
        description: "View your progress and meal plans",
        url: "/dashboard",
      },
    ],
  };
}
