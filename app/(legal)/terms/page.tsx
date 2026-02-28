import { LegalLayout } from "@/components/shared/legal-layout"

export const metadata = {
  title: "Terms of Service | Tippa",
  description: "Read Tippa's terms of service covering our non-custodial interfaces to the Stellar network.",
}

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="February 2026">
      <p>
        By accessing or using Tippa, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our
        services.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-foreground">1. Description of Service</h2>
      <p>
        Tippa provides a non-custodial web interface that interacts with the public Stellar blockchain network and Soroban smart contracts. We allow
        you to set up rules for cascading payments to automatically forward incoming payments to multiple recipients.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-foreground">2. Assumption of Risk</h2>
      <p>
        <strong>Blockchain Networks.</strong> You understand that blockchain networks are decentralized and public. Transactions pushed to the Stellar
        network are irreversible. Tippa cannot cancel or refund any transaction once it has been broadcast.
      </p>
      <p>
        <strong>Self-Custody.</strong> You are solely responsible for keeping your wallet's private keys secure. We cannot help you recover lost funds
        or reverse transactions.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-foreground">3. Platform Fees</h2>
      <p>
        Tippa currently deducts a nominal 0.5% fee on cascading transactions structured through our smart contract interfaces to support platform
        maintenance. This fee is automatically applied on-chain and transparently recorded.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-foreground">4. Disclaimers</h2>
      <p>
        The services are provided "AS IS", without warranty of any kind. We do not guarantee continuous, uninterrupted access to the site or services,
        and operation of the site may be interfered with by numerous factors outside of our control.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-foreground">5. Changes to Terms</h2>
      <p>
        We reserve the right to modify these terms at any time. We will indicate that changes have been made by updating the "Last updated" date at
        the top of these terms.
      </p>
    </LegalLayout>
  )
}
