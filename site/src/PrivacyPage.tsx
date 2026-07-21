/* Privacy Policy — content for the legal-page template. A React island (the prose
   is JSX); the Astro route mounts it inside PageShell. Text ported verbatim from
   protocol-stack/privacy-policy.html, curly quotes and all. */
import { LegalPage, type LegalSection } from "@/components/web/LegalPage"

const MAIL = "mailto:support@onboardingloop.com"
const STRIPE_PRIVACY = "https://stripe.com/privacy"

const SECTIONS: LegalSection[] = [
  {
    id: "collect",
    title: "1. Information we collect",
    body: (
      <>
        <p>
          <strong>Information you give us.</strong> When you buy a Product, you provide your email address and billing
          details. Payment card details are entered directly with our payment processor, Stripe, and are not collected or
          stored by us. If you contact us or use the on-site chat, we collect whatever you choose to send, such as your
          name, email, and the content of your message.
        </p>
        <p>
          <strong>Information collected automatically.</strong> When you visit the Site, some technical data is collected
          automatically, such as your IP address, browser type, device information, pages viewed, and referring page. This
          may be collected by us and by the tools we use.
        </p>
        <p>
          <strong>Payment and fraud data via Stripe.</strong> We use Stripe to process payments. Stripe collects and
          processes information needed to complete your transaction and to prevent fraud, which can include device and
          browser details, IP address, and activity on the checkout page. Stripe handles this data as an independent
          controller under its own privacy policy, available at{" "}
          <a href={STRIPE_PRIVACY} target="_blank" rel="noopener noreferrer">
            {STRIPE_PRIVACY}
          </a>
          . Stripe may also use certain data to market its own services.
        </p>
        <p>
          <strong>Cookies.</strong> The Site uses only the cookies needed to keep it working and to process your payment
          through Stripe. We do not run our own analytics or advertising trackers. You can control cookies through your
          browser settings.
        </p>
      </>
    ),
  },
  {
    id: "use",
    title: "2. How we use your information",
    body: (
      <>
        <p>
          <strong>We use the information we collect to:</strong>
        </p>
        <ul>
          <li>process your purchase and deliver the Products you bought;</li>
          <li>send you your download access, receipts, and messages about your order;</li>
          <li>respond to your questions and provide support;</li>
          <li>prevent fraud, secure the Site, and meet legal and tax obligations;</li>
          <li>understand and improve how the Site and Products perform.</li>
        </ul>
        <p>We do not sell your personal information.</p>
      </>
    ),
  },
  {
    id: "legal-bases",
    title: "3. Legal bases (for visitors in the EU/UK)",
    body: (
      <p>
        If you are in the European Economic Area or the United Kingdom, we process your data on these bases: to perform our
        contract with you (delivering a Product you bought), to comply with legal obligations (such as tax records), and
        for our legitimate interests (securing and improving the Site), and with your consent where required (such as
        certain cookies).
      </p>
    ),
  },
  {
    id: "share",
    title: "4. How we share information",
    body: (
      <>
        <p>We share information only with service providers that help us run the business, and only as needed. These include:</p>
        <ul>
          <li>
            <strong>Stripe</strong>, for payment processing and fraud prevention (
            <a href={STRIPE_PRIVACY} target="_blank" rel="noopener noreferrer">
              {STRIPE_PRIVACY}
            </a>
            );
          </li>
          <li>
            <strong>Vercel</strong>, which hosts the Site;
          </li>
          <li>
            <strong>Google (Gmail)</strong>, which we use to send and receive order-related and support email.
          </li>
        </ul>
        <p>
          We may also disclose information if required by law or to protect our rights. We do not sell your personal
          information, and we do not share it with third parties for their own advertising.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "5. Data retention",
    body: (
      <p>
        We keep order and billing records for as long as needed to provide the Products, support you, and meet legal, tax,
        and accounting requirements. We keep other information only as long as it serves the purpose it was collected for.
      </p>
    ),
  },
  {
    id: "rights",
    title: "6. Your rights",
    body: (
      <p>
        Depending on where you live, you may have the right to access, correct, or delete your personal information, to
        object to or restrict certain processing, to receive a copy of your data, and to withdraw consent. Residents of
        California and certain other US states have rights to know what personal information is collected, to request
        deletion, and to not be discriminated against for exercising those rights. To exercise any of these, email us at{" "}
        <a href={MAIL}>support@onboardingloop.com</a> and we will respond as the law requires.
      </p>
    ),
  },
  {
    id: "transfers",
    title: "7. International transfers",
    body: (
      <p>
        We operate from the United States, and the founder is based in Mexico. If you access the Site from elsewhere, your
        information may be processed in countries with different data-protection laws than yours. Where required, we rely
        on appropriate safeguards for these transfers.
      </p>
    ),
  },
  {
    id: "security",
    title: "8. Security",
    body: (
      <p>
        We take reasonable measures to protect your information. No method of transmission or storage is completely
        secure, so we cannot guarantee absolute security.
      </p>
    ),
  },
  {
    id: "children",
    title: "9. Children",
    body: (
      <p>
        The Site and Products are meant for business users and are not directed to children under 16. We do not knowingly
        collect personal information from children.
      </p>
    ),
  },
  {
    id: "changes",
    title: "10. Changes to this policy",
    body: (
      <p>
        We may update this Privacy Policy from time to time. When we do, we will change the “Last updated” date above.
        Significant changes will be reflected on this page.
      </p>
    ),
  },
  {
    id: "contact",
    title: "11. Contact",
    body: (
      <p>
        For any privacy question or request, contact us at <a href={MAIL}>support@onboardingloop.com</a>.
      </p>
    ),
  },
]

export default function PrivacyPage() {
  return (
    <LegalPage
      badge="Privacy policy"
      title="Privacy Policy"
      updated="Last updated: July 2, 2026"
      lead={
        <>
          This Privacy Policy explains what personal information Onboarding Loop (registered in the State of Wyoming,
          United States) (“Onboarding Loop”, “we”, “us”) collects when you use onboardingloop.ai (the “Site”) or buy our
          digital products, how we use it, and the choices you have. If you have questions, contact us at{" "}
          <a href={MAIL}>support@onboardingloop.com</a>.
        </>
      }
      sections={SECTIONS}
    />
  )
}
