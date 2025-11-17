"use client";

import { Card } from "@/components/ui/card";
import { Sparkles, Shield, Zap } from "lucide-react";
import PricingSection4 from "@/components/ui/pricing-section-4";

export default function PricingPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      <PricingSection4 />

      <div className="mx-auto max-w-6xl px-4 pb-12 relative z-10">
        {/* Why choose FakeVerifier */}
        <section className="mt-16">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-[11px] tracking-wider uppercase" style={{ color: 'var(--muted-foreground)' }}>Why FakeVerifier</span>
            <h2 className="mt-1 text-2xl font-semibold">Built for trust, speed, and accuracy</h2>
            <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>Production‑ready verification with transparent reasoning and enterprise‑grade controls.</p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[{
              title: 'Real-time evidence',
              desc: 'Live news retrieval, source deduplication, and citation-rich output.',
              icon: <Zap className="h-5 w-5" style={{ color: 'var(--primary)' }} />
            },{
              title: 'AI you can steer',
              desc: 'Cross-check → judge → pack pipeline with transparent confidence scoring.',
              icon: <Sparkles className="h-5 w-5" style={{ color: 'var(--primary)' }} />
            },{
              title: 'Privacy-first',
              desc: 'Stateless requests by default, no caching, and data export controls.',
              icon: <Shield className="h-5 w-5" style={{ color: 'var(--primary)' }} />
            }].map((f) => (
              <Card key={f.title} className="p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                  {f.icon}
                  <h3 className="text-base font-semibold">{f.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-6" style={{ color: 'var(--muted-foreground)' }}>{f.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="mt-16">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-[11px] tracking-wider uppercase" style={{ color: 'var(--muted-foreground)' }}>FAQ</span>
            <h2 className="mt-1 text-2xl font-semibold">Frequently asked questions</h2>
          </div>
          <div className="mx-auto mt-6 max-w-3xl divide-y rounded-xl" style={{ border: '1px solid var(--border)' }}>
            {[{
              q: 'How are tokens counted?',
              a: 'One verification token is consumed per verification job per claim block.'
            },{
              q: 'Do you store my data?',
              a: 'Requests are processed statelessly with no-cache semantics. You can export or clear history anytime.'
            },{
              q: 'Which AI models are used?',
              a: 'Free plan includes FakeVerifier (Web Search) for fact-checking with live web search and Llama 3.3 70B for conversational AI. Pro and Enterprise plans add GPT-OSS-20B, providing access to all three models: FakeVerifier (Web Search), Llama 3.3 70B, and GPT-OSS-20B.'
            },{
              q: 'Can I cancel anytime?',
              a: 'Yes. Plans are month-to-month; you can cancel or change tiers at any time.'
            }].map((item) => (
              <details key={item.q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-4">
                  <span className="text-sm font-medium">{item.q}</span>
                  <span className="transition group-open:rotate-180">▾</span>
                </summary>
                <div className="px-4 pb-4 text-sm leading-6" style={{ color: 'var(--muted-foreground)' }}>{item.a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* Compare table */}
        <section className="mt-16">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-[11px] tracking-wider uppercase" style={{ color: 'var(--muted-foreground)' }}>Compare</span>
            <h2 className="mt-1 text-2xl font-semibold">Choose the plan that fits</h2>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm overflow-hidden rounded-2xl" style={{ border: '1px solid var(--border)' }}>
              <thead>
                <tr className="text-left" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                  <th className="py-3 pr-4">Feature</th>
                  <th className="py-3 pr-4">Free</th>
                  <th className="py-3 pr-4">Pro</th>
                  <th className="py-3">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { k: 'Monthly tokens', free: '100', pro: '2,000', ent: 'Unlimited' },
                  { k: 'Daily verifications', free: '20', pro: '200', ent: 'Unlimited' },
                  { k: 'Images per verification', free: '1', pro: '3', ent: '10' },
                  { k: 'Live news integration', free: 'Basic', pro: 'Full', ent: 'Full + SLA' },
                  { k: 'AI Models', free: 'FakeVerifier (Web Search) + Llama 3.3 70B', pro: 'FakeVerifier (Web Search) + Llama 3.3 70B + GPT-OSS-20B', ent: 'FakeVerifier (Web Search) + Llama 3.3 70B + GPT-OSS-20B' },
                  { k: 'Response time', free: 'Standard', pro: 'Fast', ent: 'Instant' },
                  { k: 'Support', free: 'Community', pro: 'Priority', ent: 'Dedicated + phone' },
                  { k: 'Analytics', free: 'Basic', pro: 'Advanced', ent: 'Advanced + team' },
                  { k: 'Branding', free: '—', pro: '—', ent: 'White‑label' },
                ].map((row) => (
                  <tr key={row.k} className="border-t hover:bg-[color:var(--muted)]/40" style={{ borderColor: 'var(--border)' }}>
                    <td className="py-3 pr-4 font-medium">{row.k}</td>
                    <td className="py-3 pr-4">{row.free}</td>
                    <td className="py-3 pr-4">{row.pro}</td>
                    <td className="py-3">{row.ent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-12 text-center text-xs" style={{ color: "var(--muted-foreground)" }}>
          Prices in GBP. Taxes may apply.
        </div>
      </div>
    </div>
  );
}


