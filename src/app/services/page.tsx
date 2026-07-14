import { getDbServices } from "@/lib/queries";
import { ServicesPageClient } from "./services-client";

export const metadata = {
  title: "Our Services",
  description: "Evidence-based nutrition services — weight management, medical nutrition therapy, pregnancy, sports and corporate wellness.",
};

export default async function ServicesPage() {
  const services = await getDbServices();
  return <ServicesPageClient services={services} />;
}
