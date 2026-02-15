import {
  BookOpen,
  MessageCircle,
  ExternalLink,
  GitFork,
  Shield,
  Zap,
  HelpCircle,
} from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    q: "What is a cascade?",
    a: "A cascade is an automatic payment split. When someone pays you through your Tippa link, a percentage of that payment is forwarded to your configured dependencies -- all in a single atomic Stellar transaction.",
  },
  {
    q: "Is Tippa custodial?",
    a: "No. Tippa is fully non-custodial. Your private keys never touch our servers. All transaction signing happens client-side through your Freighter wallet extension.",
  },
  {
    q: "What is the platform fee?",
    a: "Tippa takes a flat 0.5% fee per transaction to sustain the platform. This is deducted automatically as part of the multi-op transaction.",
  },
  {
    q: "What happens if a cascade amount is too small?",
    a: "You can set a minimum hop threshold in your cascade rules. If a forwarded amount falls below this threshold, it stays with you instead of failing the transaction.",
  },
  {
    q: "Can I have more than 5 dependencies?",
    a: "Currently the MVP supports up to 5 dependencies per cascade. We plan to increase this limit and support multi-level cascading (A to B to C to D) in a future release.",
  },
  {
    q: "Which assets are supported?",
    a: "Tippa supports native XLM and major stablecoins including USDC and ARS on the Stellar network.",
  },
]

const resources = [
  {
    icon: BookOpen,
    title: "Documentation",
    description: "Detailed guides on setting up cascades, managing dependencies, and more.",
    link: "#",
  },
  {
    icon: MessageCircle,
    title: "Community",
    description: "Join our Discord to connect with other Tippa users and get support.",
    link: "#",
  },
  {
    icon: GitFork,
    title: "GitHub",
    description: "View the source, report bugs, or contribute to the Tippa project.",
    link: "#",
  },
]

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Help & Resources
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything you need to get started with Tippa
        </p>
      </div>

      {/* Quick Start */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
        <h3 className="text-sm font-semibold text-foreground">Quick Start Guide</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Get up and running in 3 simple steps
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            {
              icon: Shield,
              step: "1",
              title: "Connect Wallet",
              desc: "Use Freighter to sign in securely",
            },
            {
              icon: GitFork,
              step: "2",
              title: "Configure Cascade",
              desc: "Add your dependencies and set split percentages",
            },
            {
              icon: Zap,
              step: "3",
              title: "Share & Earn",
              desc: "Share your tippa.io link and watch the ecosystem grow",
            },
          ].map((s) => (
            <div
              key={s.step}
              className="flex items-start gap-3 rounded-lg border border-border bg-card p-3"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 font-mono text-xs font-bold text-primary">
                {s.step}
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">{s.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        {/* FAQ */}
        <div className="xl:col-span-3">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Frequently Asked Questions
              </h3>
            </div>
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, idx) => (
                <AccordionItem
                  key={idx}
                  value={`faq-${idx}`}
                  className="rounded-lg border border-border bg-secondary/20 px-4"
                >
                  <AccordionTrigger className="py-3 text-sm font-medium text-foreground hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-3 text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Resources */}
        <div className="space-y-3 xl:col-span-2">
          {resources.map((r) => (
            <a
              key={r.title}
              href={r.link}
              className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <r.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-semibold text-foreground">{r.title}</h4>
                  <ExternalLink className="h-3 w-3 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{r.description}</p>
              </div>
            </a>
          ))}

          {/* Contact */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h4 className="text-sm font-semibold text-foreground">Need more help?</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              Reach out to our team for personalized support.
            </p>
            <a
              href="mailto:support@tippa.io"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary/80"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              support@tippa.io
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
