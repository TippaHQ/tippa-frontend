import { LegalLayout } from "@/components/shared/legal-layout"

export const metadata = {
  title: "Privacy Policy | Tippa",
  description: "Read Tippa's privacy policy. Learn how we handle your data in our non-custodial decentralized application.",
}

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="February 2026">
      <p>Your privacy is important to us. This Privacy Policy outlines the information we collect and how it is used when you interact with Tippa.</p>

      <h2 className="mt-8 text-xl font-semibold text-foreground">Non-Custodial Architecture</h2>
      <p>
        Tippa is a non-custodial set of tools and interfaces for interacting with the Stellar network.{" "}
        <strong>We do not store your private keys, seed phrases, or sensitive wallet data on our servers.</strong> All transaction signing takes place
        locally on your device within your chosen wallet.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-foreground">Information We Collect</h2>
      <p>When you use Tippa, we may collect the following:</p>
      <ul className="list-inside list-disc space-y-2">
        <li>
          <strong>On-chain Data:</strong> Since Stellar is a public blockchain network, your wallet address and transaction history are public. We
          query this data to display your dashboard and payment history.
        </li>
        <li>
          <strong>Account Information:</strong> If you sign up for a profile, we collect the username and email you provide to facilitate logging into
          the interface.
        </li>
        <li>
          <strong>Analytics:</strong> We may collect anonymized, non-personally identifiable metrics about how you use our website to improve user
          experience.
        </li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold text-foreground">How We Use Information</h2>
      <p>We use the limited data we collect solely to provide and improve the Tippa service. We do not sell your personal data to third parties.</p>

      <h2 className="mt-8 text-xl font-semibold text-foreground">Changes to This Policy</h2>
      <p>We may update our Privacy Policy from time to time. Any changes will be reflected on this page with an updated revision date.</p>

      <h2 className="mt-8 text-xl font-semibold text-foreground">Contact Us</h2>
      <p>
        If you have questions about this Privacy Policy, please contact us at{" "}
        <a href="mailto:support@trytippa.com" className="text-primary hover:underline">
          support@trytippa.com
        </a>
        .
      </p>
    </LegalLayout>
  )
}
