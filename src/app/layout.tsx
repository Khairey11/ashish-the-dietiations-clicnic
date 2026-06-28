import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

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
  metadataBase: new URL("https://nutriaplus.health"),
  title: {
    default: "Nutria+ | Premium Dietitian & Nutrition Consultancy",
    template: "%s | Nutria+",
  },
  description:
    "Nutria+ is a premium healthcare platform for personalized nutrition. Book consultations, follow science-backed diet programs for weight loss, PCOS, diabetes, thyroid, pregnancy and sports nutrition. Track progress, receive meal plans, and meet certified dietitians — all in one place.",
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
  ],
  authors: [{ name: "Nutria+ Health" }],
  creator: "Nutria+ Health",
  publisher: "Nutria+ Health",
  applicationName: "Nutria+",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Nutria+ | Premium Dietitian & Nutrition Consultancy",
    description:
      "Personalized nutrition programs, certified dietitians, science-backed meal plans. Book your consultation today.",
    url: "https://nutriaplus.health",
    siteName: "Nutria+",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nutria+ | Premium Dietitian & Nutrition Consultancy",
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
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
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
              name: "Nutria+ Health",
              description:
                "Premium dietitian & nutrition consultancy offering personalized diet programs, online consultations, and continuous progress tracking.",
              url: "https://nutriaplus.health",
              logo: "https://nutriaplus.health/logo.svg",
              email: "care@nutriaplus.health",
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
          <Toaster />
          <Sonner />
        </ThemeProvider>
      </body>
    </html>
  );
}
