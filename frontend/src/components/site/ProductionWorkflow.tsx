import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CheckCircle2, Clock, Zap, LineChart } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const workflowPhases = [
  {
    icon: CheckCircle2,
    phase: "Week 1-2: Onboarding",
    details: [
      "User creates persistent profile: story, tone, skills, projects",
      "System generates baseline resume (3 versions for different roles)",
      "User reviews and fine-tunes tone preferences",
      "Profile stored with version control for updates",
    ],
  },
  {
    icon: Zap,
    phase: "Week 3-6: Active Searching",
    details: [
      "User finds/uploads job listings or integrates with API",
      "Matching agent scores roles (cultural fit, skill match, salary range)",
      "For each application: resume auto-tailored, cover letter auto-drafted",
      "User reviews (2-min) and sends. System logs metadata: company, role, industry",
    ],
  },
  {
    icon: Clock,
    phase: "Week 7+: Memory Loop",
    details: [
      "System tracks: responses, rejections, no-replies, interview rates",
      "Follow-up agent triggers emails based on timing (48h, 1w, 2w rules)",
      "User gets weekly digest: response rate by role type, what's working, what isn't",
      "Profile automatically improves: resume tweaks, tone adjustments, messaging refinement",
    ],
  },
  {
    icon: LineChart,
    phase: "Outcome Tracking",
    details: [
      "Full funnel analytics: applications → responses → interviews → offers",
      "Conversion rate by industry, company size, application method",
      "ROI on time invested vs traditional job search",
      "Export insights for future roles or sharing with mentors",
    ],
  },
];

export function ProductionWorkflow() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".pw-header", {
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 75%" },
      });
      gsap.from(".pw-phase", {
        x: -40,
        opacity: 0,
        stagger: 0.2,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 70%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="py-28 md:py-36 bg-linear-to-b from-foreground/2 to-transparent">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="pw-header mb-16 max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-black tracking-tightest text-balance">
            The Production Workflow
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            From onboarding to landing the role. This is how the memory system compounds over time.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowPhases.map((phase, i) => {
            const Icon = phase.icon;
            return (
              <div key={i} className="pw-phase">
                <div className="p-6 rounded-xl border border-accent/30 bg-accent/5 hover:bg-accent/10 transition-all h-full">
                  <div className="flex items-start gap-3 mb-4">
                    <Icon className="w-6 h-6 text-accent shrink-0 mt-1" />
                    <h3 className="font-bold text-base">{phase.phase}</h3>
                  </div>
                  <ul className="space-y-2">
                    {phase.details.map((detail, j) => (
                      <li key={j} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                        <span className="text-accent font-bold shrink-0">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 p-8 rounded-xl border border-accent/30 bg-accent/5">
          <h3 className="font-bold text-lg mb-3">Key Differentiators</h3>
          <ul className="grid md:grid-cols-2 gap-4">
            {[
              "No manual context-switching between tools",
              "Memory compounds across multiple applications",
              "System learns what works for you specifically",
              "Automated follow-ups save 5+ hours per month",
              "Full audit trail of your job search journey",
              "Data portability: export everything anytime",
            ].map((item, i) => (
              <li key={i} className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
