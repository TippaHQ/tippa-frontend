import { LegalLayout } from "@/components/shared/legal-layout"

export const metadata = {
  title: "Contact Us | Tippa",
  description: "Get in touch with the Tippa team for support, feature requests, or general inquiries.",
}

export default function ContactPage() {
  return (
    <LegalLayout title="Contact Us">
      <p>Have a question or need support? We're here to help.</p>

      <h2 className="mt-8 text-xl font-semibold text-foreground">Support</h2>
      <p>
        For general inquiries, support, or feedback, please email us directly at{" "}
        <strong>
          <a href="mailto:support@trytippa.com" className="text-primary hover:underline">
            support@trytippa.com
          </a>
        </strong>
        .
      </p>

      <h2 className="mt-8 text-xl font-semibold text-foreground">Community</h2>
      <p>Join our discussions and connect with other users in our community channels:</p>
      <ul className="list-inside list-disc">
        <li>
          <a href="https://x.com/trytippa" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            X (formerly Twitter)
          </a>
        </li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold text-foreground">Open Source</h2>
      <p>Tippa is built transparently. While some core components are private, our public interfaces can be explored and issues reported.</p>
    </LegalLayout>
  )
}
