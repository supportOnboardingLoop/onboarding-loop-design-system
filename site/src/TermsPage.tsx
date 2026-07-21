/* Terms of Service — content for the legal-page template. A React island (the
   prose is JSX, so it can't cross the Astro island boundary as props); the Astro
   route mounts it inside PageShell. Text ported verbatim from
   protocol-stack/terms-of-service.html, curly quotes and all. */
import { LegalPage, type LegalSection } from "@/components/web/LegalPage"

const MAIL = "mailto:support@onboardingloop.com"

const SECTIONS: LegalSection[] = [
  {
    id: "who",
    title: "1. Who we are",
    body: (
      <p>
        Onboarding Loop is registered in the State of Wyoming, United States. You can reach us at{" "}
        <a href={MAIL}>support@onboardingloop.com</a>.
      </p>
    ),
  },
  {
    id: "buying",
    title: "2. What you are buying",
    body: (
      <>
        <p>
          The Products are digital documents (PDFs and related written materials) covering SaaS onboarding, activation,
          retention, and expansion. They are sold individually or as a bundle (“the Full Stack”). Prices are shown on the
          Site at the point of sale and are in US dollars (USD). We may change prices or the contents of a Product at any
          time, but changes do not affect purchases you have already completed.
        </p>
        <p>
          The Products are informational. They are not consulting, legal, financial, or professional advice, and buying
          them does not create a client relationship with Onboarding Loop. Results depend on your own product, market, and
          execution, and we do not promise any specific outcome.
        </p>
      </>
    ),
  },
  {
    id: "payment",
    title: "3. Payment",
    body: (
      <p>
        Payments are processed by Stripe. We do not receive or store your full card details; those are handled by Stripe
        under its own terms and privacy policy. By purchasing, you agree to Stripe’s terms as they apply to you. You
        represent that you are authorized to use the payment method you provide and that the information you give is
        accurate.
      </p>
    ),
  },
  {
    id: "delivery",
    title: "4. Delivery and access",
    body: (
      <p>
        Products are delivered digitally. After your payment is confirmed, you will receive access to download the
        Product(s), normally by a download link on the confirmation page and/or by email to the address you provide at
        checkout. It is your responsibility to enter a correct email address and to download and save your files. If you
        do not receive access within a reasonable time, contact us at <a href={MAIL}>support@onboardingloop.com</a> and we
        will help.
      </p>
    ),
  },
  {
    id: "refunds",
    title: "5. Refunds",
    body: (
      <>
        <p>
          Because the Products are digital goods delivered immediately, all sales are final and payments are
          non-refundable once access has been provided. By completing your purchase you acknowledge that you are getting
          immediate access to digital content and that you waive any right to a refund or cancellation period that might
          otherwise apply.
        </p>
        <p>
          If something goes wrong on our end, for example you are charged twice, cannot access a file you paid for, or
          received the wrong Product, contact us at <a href={MAIL}>support@onboardingloop.com</a> and we will make it
          right, which may include re-sending access or issuing a refund at our discretion.
        </p>
      </>
    ),
  },
  {
    id: "license",
    title: "6. License and permitted use",
    body: (
      <p>
        When you buy a Product, we grant you a personal, non-exclusive, non-transferable license to use it for your own
        business or professional purposes. You may not resell, redistribute, republish, sublicense, or share the Products,
        in whole or in part, and you may not post them publicly or use them to create a competing product. All content in
        the Products and on the Site, including text, design, and graphics, is owned by Onboarding Loop or its licensors
        and is protected by copyright and other laws. We reserve all rights not expressly granted.
      </p>
    ),
  },
  {
    id: "acceptable-use",
    title: "7. Acceptable use of the Site",
    body: (
      <p>
        You agree not to misuse the Site, including attempting to gain unauthorized access, interfering with its
        operation, scraping or copying it at scale, or using it in violation of any law.
      </p>
    ),
  },
  {
    id: "disclaimers",
    title: "8. Disclaimers",
    body: (
      <p>
        The Site and Products are provided “as is” and “as available” without warranties of any kind, whether express or
        implied, including implied warranties of merchantability, fitness for a particular purpose, and non-infringement,
        to the fullest extent permitted by law. We do not warrant that the Site will be uninterrupted or error-free.
      </p>
    ),
  },
  {
    id: "liability",
    title: "9. Limitation of liability",
    body: (
      <p>
        To the fullest extent permitted by law, Onboarding Loop and its owner will not be liable for any indirect,
        incidental, special, consequential, or exemplary damages, or for any loss of profits, revenue, data, or goodwill,
        arising out of or related to your use of the Site or Products. Our total liability for any claim relating to a
        Product will not exceed the amount you paid for that Product.
      </p>
    ),
  },
  {
    id: "indemnification",
    title: "10. Indemnification",
    body: (
      <p>
        You agree to indemnify and hold harmless Onboarding Loop and its owner from any claims, damages, or expenses
        arising out of your misuse of the Site or Products or your violation of these Terms.
      </p>
    ),
  },
  {
    id: "changes",
    title: "11. Changes to these Terms",
    body: (
      <p>
        We may update these Terms from time to time. The version in effect when you make a purchase applies to that
        purchase. Continued use of the Site after we post changes means you accept the updated Terms. The “Last updated”
        date at the top shows when they last changed.
      </p>
    ),
  },
  {
    id: "governing-law",
    title: "12. Governing law",
    body: (
      <p>
        These Terms are governed by the laws of the State of Wyoming, United States, without regard to conflict-of-law
        rules. Any dispute will be handled in the state or federal courts located in Wyoming, unless the law where you
        live requires otherwise.
      </p>
    ),
  },
  {
    id: "contact",
    title: "13. Contact",
    body: (
      <p>
        Questions about these Terms can be sent to <a href={MAIL}>support@onboardingloop.com</a>.
      </p>
    ),
  },
]

export default function TermsPage() {
  return (
    <LegalPage
      badge="Terms of service"
      title="Terms of Service"
      updated="Last updated: July 2, 2026"
      lead={
        <>
          These Terms of Service (“Terms”) govern your access to and use of onboardingloop.ai (the “Site”) and your
          purchase of the digital products sold on it (the “Products”). The Site and Products are operated by Onboarding
          Loop (“Onboarding Loop”, “we”, “us”), registered in the State of Wyoming, United States. By using the Site or
          buying a Product, you agree to these Terms. If you do not agree, do not use the Site or buy the Products.
        </>
      }
      sections={SECTIONS}
    />
  )
}
