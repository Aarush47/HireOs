import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Database, Brain, Send, TrendingUp } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const architectureSteps = [
  {
    icon: Database,
    title: "Persistent Profile Storage",
    description: "Encrypted, versioned profile data. User story, tone, experience, project portfolio, role preferences, application history, response patterns—everything stays in sync.",
  },
  {
    icon: Brain,
    title: "Agentic Intelligence Layer",
    description: "Claude-powered agents that understand context. Resume tuning agent, cover letter generation agent, matching agent, follow-up timing agent. Each learns from user feedback.",
  },
  {
    icon: Send,
    title: "Unified Application Workflow",
    description: "Single source of truth for all applications. Track status, manage responses, trigger automated follow-ups. No context switching between tools.",
  },
  {
    icon: TrendingUp,
    title: "Analytics & Memory Loop",
    description: "Track response rates by industry, role type, and message style. System gets smarter with each application. Users see ROI immediately.",
  },
];

export function ProductionArchitecture() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".pa-header", {
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 75%" },
      });
      gsap.from(".pa-card", {
        y: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 70%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="py-28 md:py-36" id="features">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="pa-header mb-16 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black tracking-tightest text-balance">
            How It Works: Production Architecture
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            The system that learns, remembers, and improves with every application.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {architectureSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className="pa-card p-6 rounded-xl border border-border bg-linear-to-b from-foreground/3 to-transparent hover:border-accent/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-lg bg-accent/10 border border-accent/30 grid place-items-center mb-4 group-hover:bg-accent/20 transition">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
