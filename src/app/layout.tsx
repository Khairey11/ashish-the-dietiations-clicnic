import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { FloatingWhatsApp } from "@/components/site/floating-whatsapp";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thedietitiansclinic.health"),
  title: {
    default: "The Dietitian's Clinic | Premium Nutrition Consultancy",
    template: "%s | The Dietitian's Clinic",
  },
  description:
    "The Dietitian's Clinic is a premium healthcare platform for personalized nutrition. Book consultations, follow science-backed diet programs for weight loss, PCOS, diabetes, thyroid, pregnancy and sports nutrition. Track progress, receive meal plans, and meet certified dietitians — all in one place.",
  keywords: [
    "dietitian",
    "nutritionist",
    "diet plan",
    "weight loss",
    "PCOS diet",
    "diabetes diet",
    "thyroid diet",
    "pregnancy nutrition",
    "sports nutrition",
    "online nutrition consultation",
    "meal plan",
    "body composition analysis",
    "The Dietitian's Clinic",
  ],
  authors: [{ name: "The Dietitian's Clinic" }],
  creator: "The Dietitian's Clinic",
  publisher: "The Dietitian's Clinic",
  applicationName: "The Dietitian's Clinic",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "The Dietitian's Clinic | Premium Nutrition Consultancy",
    description:
      "Personalized nutrition programs, certified dietitians, science-backed meal plans. Book your consultation today.",
    url: "https://thedietitiansclinic.health",
    siteName: "The Dietitian's Clinic",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Dietitian's Clinic | Premium Nutrition Consultancy",
    description:
      "Personalized nutrition programs, certified dietitians, science-backed meal plans.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  category: "health",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "MedicalOrganization",
              name: "The Dietitian's Clinic",
              description:
                "Premium dietitian & nutrition consultancy offering personalized diet programs, online consultations, and continuous progress tracking.",
              url: "https://thedietitiansclinic.health",
              logo: "https://thedietitiansclinic.health/logo.svg",
              email: "care@thedietitiansclinic.health",
              telephone: "+977-1-4445566",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Banasthali, Baluwatar-4",
                addressLocality: "Kathmandu",
                postalCode: "44600",
                addressCountry: "NP",
              },
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: [
                    "Sunday",
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                  ],
                  opens: "07:00",
                  closes: "20:00",
                },
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: "Saturday",
                  opens: "08:00",
                  closes: "18:00",
                },
              ],
              medicalSpecialty: ["Dietetics", "Nutrition"],
            }),
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <FloatingWhatsApp />
          <Toaster />
          <Sonner />
        </ThemeProvider>
      </body>
    </html>
  );
}
