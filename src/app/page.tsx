import { Navigation } from "@/components/site/navigation";
import { Hero } from "@/components/sections/hero";
import { TrustBar } from "@/components/sections/trust-bar";
import { Services } from "@/components/sections/services";
import { Process } from "@/components/sections/process";
import { Programs } from "@/components/sections/programs";
import { Dietitians } from "@/components/sections/dietitians";
import { BMICalculator } from "@/components/sections/bmi-calculator";
import { Testimonials } from "@/components/sections/testimonials";
import { Booking } from "@/components/sections/booking";
import { ClientDashboard } from "@/components/sections/client-dashboard";
import { AdminPortal } from "@/components/sections/admin-portal";
import { Blog } from "@/components/sections/blog";
import { About } from "@/components/sections/about";
import { FAQ } from "@/components/sections/faq";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main id="main" className="flex-1">
        <Hero />
        <TrustBar />
        <Services />
        <Process />
        <Programs />
        <Dietitians />
        <BMICalculator />
        <Testimonials />
        <Booking />
        <ClientDashboard />
        <AdminPortal />
        <Blog />
        <About />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
