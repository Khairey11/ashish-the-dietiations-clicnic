import Link from "next/link";
import { SiteLayout, PageHero } from "@/components/site/site-layout";
import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: "Privacy Policy",
  description: "How The Dietitian's Clinic collects, uses, and protects your personal and health data.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "July 2026";
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Legal"
        title={<>Privacy <span className="gradient-text">Policy</span></>}
        description="Your privacy is sacred. This policy explains what data we collect, why, and how to control it."
        accent="from-primary/15 to-secondary/10"
      />

      <article className="py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>

            <h2>1. Who we are</h2>
            <p>
              The Dietitian&apos;s Clinic (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is a clinical nutrition practice based at {siteConfig.address}. We provide personalised nutrition coaching, medical nutrition therapy, and related wellness services through our website at {siteConfig.domain} (the &ldquo;Service&rdquo;).
            </p>
            <p>
              For any privacy questions, contact us at <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a> or {siteConfig.phoneDisplay}.
            </p>

            <h2>2. What data we collect</h2>
            <p>We collect only the data necessary to provide our services:</p>
            <ul>
              <li><strong>Account data:</strong> name, email, phone number, password (stored as a scrypt hash — never in plain text).</li>
              <li><strong>Profile data:</strong> date of birth, gender, height, weight, body composition, medical history, allergies, medications, dietary preferences, emergency contact.</li>
              <li><strong>Appointment data:</strong> service booked, dietitian assigned, scheduled time, mode (video/in-clinic), notes you provide.</li>
              <li><strong>Payment data:</strong> program purchased, amount, payment method (Khalti/eSewa/bank), transaction reference. We do <strong>not</strong> store card numbers — payments are processed by the gateway.</li>
              <li><strong>Communication data:</strong> messages between you and your dietitian, notifications we send you.</li>
              <li><strong>Health reports:</strong> lab reports and other documents you upload (e.g. blood panel, thyroid function, HbA1c).</li>
              <li><strong>Usage data:</strong> IP address, browser type, pages visited — collected via server logs. We do not use third-party advertising trackers.</li>
            </ul>

            <h2>3. Legal basis for processing</h2>
            <p>We process your data under the following lawful bases:</p>
            <ul>
              <li><strong>Contract:</strong> to deliver the nutrition services you booked and to manage your client relationship.</li>
              <li><strong>Consent:</strong> for sending marketing emails (newsletter) — you can opt out at any time.</li>
              <li><strong>Legal obligation:</strong> to maintain financial records as required by Nepal tax law.</li>
              <li><strong>Legitimate interest:</strong> to secure our systems, prevent fraud, and improve our services.</li>
            </ul>

            <h2>4. How we use your data</h2>
            <ul>
              <li>To create and manage your client account.</li>
              <li>To schedule and conduct consultations with your assigned dietitian.</li>
              <li>To design personalised meal plans and track your progress.</li>
              <li>To process payments and issue receipts.</li>
              <li>To send you service-related notifications (appointment reminders, messages from your dietitian).</li>
              <li>To send marketing emails — only if you have explicitly opted in. You can unsubscribe from any email.</li>
              <li>To comply with legal obligations.</li>
            </ul>
            <p>We <strong>never</strong> sell your data to third parties.</p>

            <h2>5. Who we share data with</h2>
            <ul>
              <li><strong>Your assigned dietitian:</strong> they need access to your profile, medical history, and reports to provide care.</li>
              <li><strong>Payment processors:</strong> Khalti and eSewa process your payments. They receive only the transaction amount and a reference — not your health data.</li>
              <li><strong>Email provider (Resend):</strong> sends transactional emails (booking confirmations, password resets) on our behalf. Resend receives the email content but does not store it beyond delivery.</li>
              <li><strong>Hosting provider:</strong> our server infrastructure provider has access to encrypted database backups but not to the contents (data is encrypted at rest in the database).</li>
              <li><strong>Legal authorities:</strong> only if compelled by a valid court order or as required by law.</li>
            </ul>

            <h2>6. International data transfers</h2>
            <p>
              Our servers are hosted in Nepal. Email delivery (Resend) and error monitoring (Sentry) may process data in the EU or US. We only transfer the minimum data necessary (email address, error messages — never health records) and rely on standard contractual clauses for protection.
            </p>

            <h2>7. Data retention</h2>
            <ul>
              <li><strong>Active client records:</strong> retained for the duration of your program plus 7 years (medical records retention standard).</li>
              <li><strong>Inactive accounts:</strong> if you don&apos;t log in for 3 years, we will email you to confirm you want to keep the account. If no response within 30 days, we will delete your data.</li>
              <li><strong>Audit logs:</strong> retained for 1 year, then automatically deleted.</li>
              <li><strong>Payment records:</strong> retained for 7 years as required by Nepal tax law.</li>
              <li><strong>Newsletter subscribers:</strong> retained until you unsubscribe. Unsubscribe links are in every email.</li>
            </ul>

            <h2>8. Your rights</h2>
            <p>Under the GDPR and Nepal&apos;s Privacy Act 2075, you have the right to:</p>
            <ul>
              <li><strong>Access:</strong> request a copy of all data we hold about you. Use the &ldquo;Export my data&rdquo; button in your dashboard settings.</li>
              <li><strong>Rectification:</strong> correct inaccurate data. You can edit your profile in the dashboard, or contact us.</li>
              <li><strong>Erasure:</strong> request deletion of your account and all associated data. Use the &ldquo;Delete my account&rdquo; button in your dashboard settings. Note: payment records required by tax law will be retained for the statutory period but anonymised.</li>
              <li><strong>Restriction:</strong> ask us to limit processing (e.g. while a dispute is resolved).</li>
              <li><strong>Portability:</strong> receive your data in a machine-readable JSON format.</li>
              <li><strong>Objection:</strong> object to processing based on legitimate interests.</li>
              <li><strong>Withdraw consent:</strong> for marketing emails — at any time, via the unsubscribe link.</li>
            </ul>
            <p>
              To exercise any of these rights, visit your <Link href="/dashboard/settings">dashboard settings</Link> or email us at <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>. We respond within 30 days.
            </p>

            <h2>9. Security</h2>
            <p>
              We take security seriously. Passwords are hashed with scrypt (never stored in plain text). The database is encrypted at rest. Session cookies are httpOnly, secure, and signed with HMAC. All traffic is served over HTTPS. File uploads are validated by magic bytes (not just extension). Rate limiting protects authentication endpoints from brute force.
            </p>
            <p>
              Despite our efforts, no system is 100% secure. If a breach occurs that is likely to result in a risk to your rights, we will notify you and the relevant authority within 72 hours, as required by the GDPR.
            </p>

            <h2>10. Cookies</h2>
            <p>We use only essential cookies:</p>
            <ul>
              <li><strong>admin_session:</strong> keeps you logged in. HttpOnly, secure, expires after 7 days.</li>
              <li><strong>theme:</strong> remembers your light/dark mode preference. Set by next-themes.</li>
            </ul>
            <p>
              We do <strong>not</strong> use advertising cookies, third-party tracking cookies, or social media pixels. A cookie consent banner appears on your first visit to acknowledge this.
            </p>

            <h2>11. Children&apos;s privacy</h2>
            <p>
              Our services are intended for adults (18+). If you are booking for a child (e.g. paediatric nutrition), the parent or guardian must create the account and provide consent. We do not knowingly collect data from unaccompanied minors. If you believe a child has provided us with personal data, please contact us so we can delete it.
            </p>

            <h2>12. Changes to this policy</h2>
            <p>
              We may update this policy from time to time. We will notify you by email of any material changes at least 30 days before they take effect. The &ldquo;Last updated&rdquo; date at the top of this page reflects the most recent revision.
            </p>

            <h2>13. Contact</h2>
            <p>
              Questions about this policy or your data? Contact our Data Protection Officer at <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a> or {siteConfig.phoneDisplay}, or write to us at {siteConfig.address}.
            </p>
            <p>
              If you are unsatisfied with our response, you have the right to lodge a complaint with your local data protection authority.
            </p>
          </div>
        </div>
      </article>
    </SiteLayout>
  );
}
