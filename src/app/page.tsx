import { Navigation } from "@/components/site/navigation";
import { Hero } from "@/components/sections/hero";
import { TrustBar } from "@/components/sections/trust-bar";
import { Services } from "@/components/sections/services";
import { Process } from "@/components/sections/process";
import { Programs } from "@/components/sections/programs";
import { BMICalculator } from "@/components/sections/bmi-calculator";
import { Testimonials } from "@/components/sections/testimonials";
import { Booking } from "@/components/sections/booking";
import { Blog } from "@/components/sections/blog";
import { About } from "@/components/sections/about";
import { FAQ } from "@/components/sections/faq";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/sections/footer";
import { FloatingWhatsApp } from "@/components/site/floating-whatsapp";
import { getDynamicConfig, type DynamicConfig } from "@/lib/site-config";

export default async function Home() {
  const config = await getDynamicConfig();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main id="main" className="flex-1">
        <Hero />
        <TrustBar />
        <Services />
        <Process />
        <Programs />
        <BMICalculator />
        <Testimonials />
        <Booking config={config} />
        <Blog />
        <About />
        <FAQ />
        <Contact config={config} />
      </main>
      <Footer config={config} />
      <FloatingWhatsApp config={config} />
    </div>
  );
}
