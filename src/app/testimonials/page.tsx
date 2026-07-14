import { getDbTestimonials } from "@/lib/queries";
import { TestimonialsPageClient } from "./testimonials-client";

export const metadata = {
  title: "Client Success Stories",
  description: "Real transformations from The Dietitian's Clinic — weight loss, PCOS, diabetes, pregnancy and sports nutrition success stories.",
};

export default async function TestimonialsPage() {
  const testimonials = await getDbTestimonials();
  return <TestimonialsPageClient testimonials={testimonials} />;
}
