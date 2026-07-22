import Link from "next/link";
import { SiteLayout, PageHero } from "@/components/site/site-layout";
import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for using the services and website of Ashish Nutrition Clinic.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Legal"
        title={<>Terms & <span className="gradient-text">Conditions</span></>}
        description="The terms under which you may use our services and website."
        accent="from-primary/15 to-secondary/10"
      />

      <article className="py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <p className="text-sm text-muted-foreground">Last updated: July 2026</p>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using the website at {siteConfig.domain} (the &ldquo;Service&rdquo;), you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the Service.
            </p>

            <h2>2. Services Provided</h2>
            <p>
              {siteConfig.name} provides personalized nutrition counseling, diet planning, and related wellness services. Our services are intended to complement, not replace, professional medical advice. Always consult your physician before making significant changes to your diet or lifestyle.
            </p>

            <h2>3. Client Responsibilities</h2>
            <ul>
              <li>Provide accurate and complete health information during assessment.</li>
              <li>Follow the nutrition plan as prescribed, and communicate any difficulties.</li>
              <li>Attend scheduled consultations and provide advance notice for cancellations.</li>
              <li>Understand that results vary based on individual adherence and biology.</li>
            </ul>

            <h2>4. Appointments & Cancellations</h2>
            <p>
              Appointments must be rescheduled or cancelled at least 24 hours in advance. Late cancellations may be subject to a fee. No-shows forfeit the consultation fee.
            </p>

            <h2>5. Refund Policy</h2>
            <p>
              Cancellations within the first 14 days of a program are fully refundable minus the consultation fee. After 14 days, unused sessions remain valid for 12 months. No refunds are issued for partially completed programs.
            </p>

            <h2>6. Intellectual Property</h2>
            <p>
              All content on this website — including meal plans, articles, graphics, and logos — is the property of {siteConfig.name} and may not be reproduced without written permission.
            </p>

            <h2>7. Privacy</h2>
            <p>
              Your use of the Service is also governed by our <Link href="/privacy">Privacy Policy</Link>. Please review it to understand how we collect, use, and protect your data.
            </p>

            <h2>8. Limitation of Liability</h2>
            <p>
              {siteConfig.name} is not liable for any health outcomes resulting from the client&apos;s failure to follow the prescribed plan, or from conditions not disclosed during assessment. Our maximum liability is limited to the fees paid for the current consultation cycle.
            </p>

            <h2>9. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the revised Terms.
            </p>

            <h2>10. Contact</h2>
            <p>
              Questions about these Terms? Contact us at <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a> or {siteConfig.phoneDisplay}.
            </p>
          </div>
        </div>
      </article>
    </SiteLayout>
  );
}
