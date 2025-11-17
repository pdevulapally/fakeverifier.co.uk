"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Sparkles as SparklesComp } from "@/components/ui/sparkles";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  yearlyPrice: number;
  buttonText: string;
  buttonVariant: "outline" | "default";
  popular?: boolean;
  includes: string[];
}

const PricingSwitch = ({ onSwitch }: { onSwitch: (value: string) => void }) => {
  const [selected, setSelected] = useState("0");
  const handleSwitch = (value: string) => {
    setSelected(value);
    onSwitch(value);
  };

  return (
    <div className="flex justify-center">
      <div className="relative z-10 mx-auto flex w-fit rounded-full bg-neutral-900 border border-gray-700 p-1" style={{ borderColor: "var(--border)", background: "var(--muted)" }}>
        <button
          onClick={() => handleSwitch("0")}
          className={cn(
            "relative z-10 w-fit h-10 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors",
            selected === "0" ? "text-white" : "text-gray-200",
          )}
          style={{ color: selected === "0" ? "var(--primary-foreground)" : "var(--muted-foreground)" }}
        >
          {selected === "0" && (
            <motion.span
              layoutId={"switch"}
              className="absolute top-0 left-0 h-10 w-full rounded-full border-4 shadow-sm"
              style={{ 
                borderColor: "var(--primary)", 
                background: "var(--primary)",
                boxShadow: "0 0 20px var(--primary)"
              }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative">Monthly</span>
        </button>
        <button
          onClick={() => handleSwitch("1")}
          className={cn(
            "relative z-10 w-fit h-10 flex-shrink-0 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors",
            selected === "1" ? "text-white" : "text-gray-200",
          )}
          style={{ color: selected === "1" ? "var(--primary-foreground)" : "var(--muted-foreground)" }}
        >
          {selected === "1" && (
            <motion.span
              layoutId={"switch"}
              className="absolute top-0 left-0 h-10 w-full rounded-full border-4 shadow-sm"
              style={{ 
                borderColor: "var(--primary)", 
                background: "var(--primary)",
                boxShadow: "0 0 20px var(--primary)"
              }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative flex items-center gap-2">Yearly</span>
        </button>
      </div>
    </div>
  );
};

interface PricingSection4Props {
  onPlanSelect?: (planId: string, isYearly: boolean) => void;
}

export default function PricingSection4({ onPlanSelect }: PricingSection4Props) {
  const [isYearly, setIsYearly] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user } = useAuth();
  const clientToken = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? (crypto as any).randomUUID() : `${Date.now()}-token`;

  const plans: Plan[] = [
    {
      id: "free",
      name: "Free",
      description: "Perfect for getting started with AI-powered fact-checking",
      price: 0,
      yearlyPrice: 0,
      buttonText: "Get started",
      buttonVariant: "outline",
      includes: [
        "Free includes:",
        "100 monthly credits",
        "20 verifications per day",
        "Up to 1 image per verification",
        "FakeVerifier (Web Search) + Llama 3.3 70B",
        "Basic sources",
        "Markdown report",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      description: "Great for power users who need advanced features",
      price: 9.99,
      yearlyPrice: 99.99,
      buttonText: "Upgrade to Pro",
      buttonVariant: "default",
      popular: true,
      includes: [
        "Everything in Free, plus:",
        "2,000 verification tokens per month",
        "200 verifications per day",
        "Up to 3 images per verification",
        "FakeVerifier (Web Search) + Llama 3.3 70B + GPT-OSS-20B",
        "Faster response time",
        "Priority support",
        "Custom source verification",
        "Real-time news integration",
        "Advanced bias detection",
        "Email & chat support",
        "No rate limits",
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "Advanced plan for teams and organizations",
      price: 49.99,
      yearlyPrice: 499.99,
      buttonText: "Contact sales",
      buttonVariant: "outline",
      includes: [
        "Everything in Pro, plus:",
        "Unlimited verification tokens",
        "Unlimited daily verifications",
        "Up to 10 images per verification",
        "FakeVerifier (Web Search) + Llama 3.3 70B + GPT-OSS-20B",
        "Instant response time",
        "Dedicated support",
        "Custom integrations",
        "Team management",
        "Advanced analytics",
        "White-label options",
        "Phone & priority support",
      ],
    },
  ];

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.4,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  const togglePricingPeriod = (value: string) => setIsYearly(Number.parseInt(value) === 1);

  const handlePlanClick = async (plan: Plan) => {
    if (onPlanSelect) {
      onPlanSelect(plan.id, isYearly);
      return;
    }

    if (plan.id === "enterprise") {
      router.push('/contact');
      return;
    }

    try {
      const r = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-client-token': clientToken },
        body: JSON.stringify({ 
          plan: plan.id, 
          uid: user?.uid || 'anonymous', 
          success_url: window.location.origin + '/pricing?success=true', 
          cancel_url: window.location.href 
        })
      });
      const j = await r.json();
      if (r.ok && j.url) window.location.href = j.url;
    } catch {}
  };

  return (
    <div
      className="min-h-screen mx-auto relative overflow-x-hidden"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
      ref={pricingRef}
    >
      <TimelineContent
        animationNum={4}
        timelineRef={pricingRef}
        customVariants={revealVariants}
        className="absolute top-0 h-96 w-screen overflow-hidden [mask-image:radial-gradient(50%_50%,white,transparent)]"
      >
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#ffffff2c_1px,transparent_1px),linear-gradient(to_bottom,#3a3a3a01_1px,transparent_1px)] bg-[size:70px_80px]"></div>
        <SparklesComp
          density={1800}
          speed={1}
          color="var(--primary)"
          className="absolute inset-x-0 bottom-0 h-full w-full [mask-image:radial-gradient(50%_50%,white,transparent_85%)]"
        />
      </TimelineContent>

      <TimelineContent
        animationNum={5}
        timelineRef={pricingRef}
        customVariants={revealVariants}
        className="absolute left-0 top-[-114px] w-full h-[113.625vh] flex flex-col items-start justify-start content-start flex-none flex-nowrap gap-2.5 overflow-hidden p-0 z-0"
      >
        <div className="framer-1i5axl2">
          <div
            className="absolute left-[-568px] right-[-568px] top-0 h-[2053px] flex-none rounded-full"
            style={{
              border: "200px solid var(--primary)",
              filter: "blur(92px)",
              WebkitFilter: "blur(92px)",
              opacity: 0.3,
            }}
          ></div>
        </div>
      </TimelineContent>

      <article className="text-center mb-6 pt-32 max-w-3xl mx-auto space-y-2 relative z-50 px-4">
        <h2 className="text-4xl font-medium" style={{ color: "var(--foreground)" }}>
          <VerticalCutReveal
            splitBy="words"
            staggerDuration={0.15}
            staggerFrom="first"
            reverse={true}
            containerClassName="justify-center"
            transition={{
              type: "spring",
              stiffness: 250,
              damping: 40,
              delay: 0,
            }}
          >
            Plans that work best for you
          </VerticalCutReveal>
        </h2>
        <TimelineContent
          as="p"
          animationNum={0}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          style={{ color: "var(--muted-foreground)" }}
        >
          Trusted by millions. We help teams all around the world. Explore which option is right for you.
        </TimelineContent>
        <TimelineContent
          as="div"
          animationNum={1}
          timelineRef={pricingRef}
          customVariants={revealVariants}
        >
          <PricingSwitch onSwitch={togglePricingPeriod} />
        </TimelineContent>
      </article>

      <div
        className="absolute top-0 left-[10%] right-[10%] w-[80%] h-full z-0"
        style={{
          backgroundImage: `radial-gradient(circle at center, var(--primary) 0%, transparent 70%)`,
          opacity: 0.1,
          mixBlendMode: "multiply",
        }}
      />

      <div className="grid md:grid-cols-3 max-w-5xl gap-4 py-6 mx-auto px-4 relative z-10">
        {plans.map((plan, index) => (
          <TimelineContent
            key={plan.name}
            as="div"
            animationNum={2 + index}
            timelineRef={pricingRef}
            customVariants={revealVariants}
          >
            <Card
              className={cn(
                "relative border",
                plan.popular
                  ? "shadow-lg z-20"
                  : "z-10"
              )}
              style={{
                background: plan.popular 
                  ? "linear-gradient(180deg, var(--card), var(--muted))" 
                  : "var(--card)",
                borderColor: plan.popular ? "var(--primary)" : "var(--border)",
                boxShadow: plan.popular ? `0px -13px 300px 0px var(--primary)` : undefined,
              }}
            >
              {plan.popular && (
                <div className="absolute -top-3 right-4 rounded-full px-3 py-1 text-[11px] font-semibold shadow" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                  Most Popular
                </div>
              )}
              {user?.plan === plan.id && (
                <div className="absolute -top-3 left-4 rounded-full px-3 py-1 text-[11px] font-semibold" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                  Current plan
                </div>
              )}
              <CardHeader className="text-left">
                <div className="flex justify-between">
                  <h3 className="text-3xl mb-2" style={{ color: "var(--foreground)" }}>{plan.name}</h3>
                </div>
                <div className="flex items-baseline">
                  <span className="text-4xl font-semibold" style={{ color: "var(--foreground)" }}>
                    £
                    <NumberFlow
                      format={{
                        currency: "GBP",
                      }}
                      value={isYearly ? plan.yearlyPrice : plan.price}
                      className="text-4xl font-semibold"
                    />
                  </span>
                  <span className="ml-1" style={{ color: "var(--muted-foreground)" }}>
                    /{isYearly ? "year" : "month"}
                  </span>
                </div>
                <p className="text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>{plan.description}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <button
                  onClick={() => handlePlanClick(plan)}
                  className={cn(
                    "w-full mb-6 p-4 text-xl rounded-xl transition-all",
                    plan.popular
                      ? "shadow-lg border text-white hover:opacity-90"
                      : plan.buttonVariant === "outline"
                        ? "border hover:bg-[var(--muted)]"
                        : ""
                  )}
                  style={{
                    background: plan.popular 
                      ? "var(--primary)" 
                      : plan.buttonVariant === "outline"
                        ? "transparent"
                        : "var(--primary)",
                    color: plan.popular || plan.buttonVariant === "default"
                      ? "var(--primary-foreground)"
                      : "var(--foreground)",
                    borderColor: plan.popular 
                      ? "var(--primary)" 
                      : "var(--border)",
                    boxShadow: plan.popular ? `0 0 20px var(--primary)` : undefined,
                  }}
                >
                  {plan.buttonText}
                </button>
                <div className="space-y-3 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                  <h4 className="font-medium text-base mb-3" style={{ color: "var(--foreground)" }}>
                    {plan.includes[0]}
                  </h4>
                  <ul className="space-y-2">
                    {plan.includes.slice(1).map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center gap-2"
                      >
                        <span 
                          className="h-2.5 w-2.5 rounded-full grid place-content-center flex-shrink-0"
                          style={{ background: "var(--primary)" }}
                        ></span>
                        <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TimelineContent>
        ))}
      </div>
    </div>
  );
}

