import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { FloatingWhatsApp } from "@/components/site/floating-whatsapp";
import { CookieConsent } from "@/components/site/cookie-consent";
import { Analytics } from "@vercel/analytics/next";

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
  metadataBase: new URL("https://thedietitiansclinic.com"),
  title: {
    default: "Ashish Nutrition Clinic | Personalized Nutrition Care",
    template: "%s | Ashish Nutrition Clinic",
  },
  description:
    "Ashish Nutrition Clinic is a premium healthcare platform for personalized nutrition. Book consultations, follow science-backed diet programs for weight loss, PMOS, diabetes, thyroid, pregnancy and sports nutrition. Track progress, receive meal plans, and meet certified dietitians — all in one place.",
  keywords: [
    "dietitian",
    "nutritionist",
    "diet plan",
    "weight loss",
    "PMOS diet",
    "diabetes diet",
    "thyroid diet",
    "pregnancy nutrition",
    "sports nutrition",
    "online nutrition consultation",
    "meal plan",
    "body composition analysis",
    "Ashish Nutrition Clinic",
  ],
  authors: [{ name: "Ashish Nutrition Clinic" }],
  creator: "Ashish Nutrition Clinic",
  publisher: "Ashish Nutrition Clinic",
  applicationName: "Ashish Nutrition Clinic",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Ashish Nutrition Clinic | Personalized Nutrition Care",
    description:
      "Personalized nutrition programs, certified dietitians, science-backed meal plans. Book your consultation today.",
    url: "https://thedietitiansclinic.com",
    siteName: "Ashish Nutrition Clinic",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ashish Nutrition Clinic | Personalized Nutrition Care",
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
    icon: [{ url: "/logo-transparent.png", type: "image/png", sizes: "506x480" }],
    shortcut: "/logo-transparent.png",
    apple: "/logo-transparent.png",
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
              name: "Ashish Nutrition Clinic",
              description:
                "Premium dietitian & nutrition consultancy offering personalized diet programs, online consultations, and continuous progress tracking.",
              url: "https://thedietitiansclinic.com",
              logo: "https://thedietitiansclinic.com/logo-transparent.png",
              email: "ashish@thedietitiansclinic.com",
              telephone: "+977 9800000000",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Kathmandu",
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
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
          >
            Skip to main content
          </a>
          {children}
          <FloatingWhatsApp />
          <CookieConsent />
          <Sonner />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
