import { getDbFaqs } from "@/lib/queries";
import { FAQPageClient } from "./faq-client";

export const metadata = {
  title: "Frequently Asked Questions",
  description: "Answers to common questions about booking, programs, payments, privacy and more at Ashish Nutrition Clinic.",
};

export default async function FAQPage() {
  const faqs = await getDbFaqs();
  return <FAQPageClient faqs={faqs} />;
}
