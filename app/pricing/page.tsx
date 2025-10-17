"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Sparkles, Shield, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function PricingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const clientToken = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? (crypto as any).randomUUID() : `${Date.now()}-token`;
  const plans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      period: "/mo",
      cta: "Get started",
      features: ["50 monthly credits", "10 verifications/day", "Up to 1 image per verification", "Basic sources", "Markdown report"],
      style: { borderColor: "var(--border)", background: "linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.3))" },
      buttonStyle: { background: "var(--muted)", color: "var(--foreground)" },
    },
    {
      id: "pro",
      name: "Pro",
      price: "$9.99",
      period: "/mo",
      cta: "Upgrade to Pro",
      blurb: "Great for power users",
      tokens: "500 tokens per month",
      features: [
        "500 verification tokens per month",
        "50 verifications per day",
        "Up to 3 images per verification",
        "Premium AI models (GPT-4o, GPT-4 Turbo, GPT-4)",
        "Faster response time",
        "Priority support",
        "Custom source verification",
        "Real-time news integration",
        "Advanced bias detection",
        "Email & chat support",
        "No rate limits",
        "Premium AI performance"
      ],
      highlighted: true,
      style: { borderColor: "var(--primary)", background: "linear-gradient(180deg, rgba(59,130,246,0.12), rgba(59,130,246,0.02))" },
      buttonStyle: { background: "var(--primary)", color: "var(--primary-foreground)" },
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "$49.99",
      period: "/month",
      cta: "Contact sales",
      blurb: "For teams and organizations",
      tokens: "5,000 tokens per month",
      features: [
        "5000 verification tokens per month",
        "500 verifications per day",
        "Up to 10 images per verification",
        "Unlimited AI analysis with Claude-3.5-Sonnet & GPT-4o",
        "Instant response time",
        "Dedicated support",
        "Custom integrations",
        "Team management",
        "Advanced analytics",
        "White-label options",
        "Phone & priority support",
        "No rate limits",
        "Highest AI performance for the enterprise"
      ],
      style: { borderColor: "var(--border)", background: "linear-gradient(180deg, rgba(168,85,247,0.12), rgba(168,85,247,0.02))" },
      buttonStyle: { background: "var(--accent)", color: "var(--accent-foreground)" },
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: "radial-gradient(1200px 600px at 50% -200px, rgba(59,130,246,0.12), transparent), var(--background)", color: "var(--foreground)" }}>
      <div className="mx-auto max-w-6xl px-4 pt-32 pb-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold">Pricing</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
            Upgrade whenever you need. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <Card
              key={p.id}
              className={`relative p-6 transition-transform duration-300 hover:-translate-y-1 ${p.highlighted ? "ring-2" : "ring-1"} flex flex-col`}
              style={{ ...p.style, borderColor: p.highlighted ? "var(--primary)" : "var(--border)" }}
            >
              {p.highlighted && (
                <div className="absolute -top-3 right-4 rounded-full px-3 py-1 text-[11px] font-semibold shadow" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                  Most Popular
                </div>
              )}
              <div className="mb-4">
                <h2 className="text-lg font-semibold">{p.name}</h2>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{p.price}</span>
                  <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{p.period}</span>
                </div>
                {p.blurb && <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>{p.blurb}</p>}
                {p.tokens && <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{p.tokens}</p>}
                {user?.plan === p.id && (
                  <div className="mt-2 inline-flex rounded-full px-2.5 py-0.5 text-[11px]" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>Current plan</div>
                )}
              </div>
              <ul className="mb-6 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4" style={{ color: 'var(--primary)' }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto" />
              {p.id === "enterprise" ? (
                <Button
                  style={p.buttonStyle}
                  className="w-full shadow-md hover:shadow-lg"
                  onClick={() => router.push('/contact')}
                >
                  {p.cta}
                </Button>
              ) : (
                <Button
                  style={p.buttonStyle}
                  className="w-full shadow-md hover:shadow-lg"
                  onClick={async () => {
                    try {
                      const r = await fetch('/api/stripe/checkout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'x-client-token': clientToken },
                        body: JSON.stringify({ plan: p.id, uid: user?.uid || 'anonymous', success_url: window.location.origin + '/pricing?success=true', cancel_url: window.location.href })
                      });
                      const j = await r.json();
                      if (r.ok && j.url) window.location.href = j.url;
                    } catch {}
                  }}
                >
                  {p.cta}
                </Button>
              )}
            </Card>
          ))}
        </div>

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
              <Card key={f.title} className="p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))', borderColor: 'var(--border)' }}>
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
              a: 'Free uses GPT-4o, GPT-4 Turbo, GPT-4, and GPT-3.5-turbo. Pro uses GPT-4o family. Enterprise uses Claude-3.5-Sonnet with GPT-4o fallback.'
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
                <tr className="text-left" style={{ background: 'linear-gradient(180deg, rgba(59,130,246,0.08), transparent)', color: 'var(--muted-foreground)' }}>
                  <th className="py-3 pr-4">Feature</th>
                  <th className="py-3 pr-4">Free</th>
                  <th className="py-3 pr-4">Pro</th>
                  <th className="py-3">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { k: 'Monthly tokens', free: '50', pro: '500', ent: '5,000' },
                  { k: 'Daily verifications', free: '10', pro: '50', ent: '500' },
                  { k: 'Images per verification', free: '1', pro: '3', ent: '10' },
                  { k: 'Live news integration', free: 'Basic', pro: 'Full', ent: 'Full + SLA' },
                  { k: 'Model quality', free: 'GPT-4o family', pro: 'GPT-4o family', ent: 'Claude-3.5-Sonnet + GPT-4o' },
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
          Prices in USD. Taxes may apply.
        </div>
      </div>
    </div>
  );
}


