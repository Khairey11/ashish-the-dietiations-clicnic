import { SiteLayout, PageHero } from "@/components/site/site-layout";
import { Booking } from "@/components/sections/booking";

export const metadata = {
  title: "Book a Consultation",
  description: "Book your nutrition consultation in under 2 minutes. Free 15-minute discovery calls available. Choose your service, dietitian, schedule, and program.",
};

export default function BookingPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Book your consultation"
        title={<>Your transformation starts in <span className="gradient-text">5 simple steps</span></>}
        description="Reserve your slot in under 2 minutes. Free 15-minute discovery calls available — no payment required."
        accent="from-primary/15 to-secondary/10"
      />
      <Booking />
    </SiteLayout>
  );
}
