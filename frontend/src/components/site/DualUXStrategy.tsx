import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Code2, MessageCircle } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function DualUXStrategy() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".dus-header", {
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 75%" },
      });
      gsap.from(".dus-card", {
        y: 40,
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
    <section ref={root} className="py-28 md:py-36">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="dus-header mb-16 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black tracking-tightest text-balance">
            Same Backend, Different Experiences
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            One powerful system. Two interfaces. Built for how people actually think.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* SDE (20yr old) */}
          <div className="dus-card p-8 rounded-xl border border-border bg-linear-to-b from-foreground/3 to-transparent">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 border border-blue-500/50 grid place-items-center">
                <Code2 className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">The Technical Founder</h3>
                <p className="text-xs text-muted-foreground">(20yr SDE, Control-oriented)</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Experience:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Full dashboard with application funnel analytics</li>
                  <li>• A/B testing resume variations</li>
                  <li>• Custom rules engine for follow-up triggers</li>
                  <li>• API access to export/analyze data</li>
                  <li>• Integration with ATS tools and LinkedIn</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Profile View:</h4>
                <div className="p-3 rounded-lg bg-foreground/5 border border-foreground/10 font-mono text-xs">
                  <p>response_rate: 18.2%</p>
                  <p>avg_interview_rate: 11.4%</p>
                  <p>best_performing_industry: \"SaaS\"</p>
                  <p>follow_up_conversion: 0.23</p>
                </div>
              </div>

              <div>
                <h4 className=\"font-semibold text-sm mb-2\">Goal:</h4>
                <p className=\"text-sm text-muted-foreground\">
                  Maximize ROI on time. See exactly what's working. Optimize the entire funnel.
                </p>
              </div>
            </div>
          </div>

          {/* Sales Professional (50yr old) */}
          <div className="dus-card p-8 rounded-xl border border-border bg-linear-to-b from-foreground/3 to-transparent">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 border border-green-500/50 grid place-items-center">
                <MessageCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">The Career Professional</h3>
                <p className="text-xs text-muted-foreground\">(50yr Sales, Simplicity-focused)</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Experience:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• WhatsApp-like chat interface</li>
                  <li>• \"You applied to TechCorp. Follow up tomorrow?\"</li>
                  <li>• Simple yes/no decision making</li>
                  <li>• Weekly summary: \"3 new responses, 1 interview scheduled\"</li>
                  <li>• No dashboards, just clear next steps</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Interface:</h4>
                <div className="p-3 rounded-lg bg-foreground/5 border border-foreground/10 text-sm">
                  <p className="mb-2 text-muted-foreground italic\">\"Hi Ramesh! 👋</p>
                  <p className="mb-2\">You applied to Sr. Sales Manager at\">
                    <span className="font-semibold\">Acme Corp</span> on Tuesday.
                  </p>
                  <p className=\"text-muted-foreground\">Want me to send a follow-up on Thursday?\"</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2\">Goal:</h4>
                <p className="text-sm text-muted-foreground\">\n                  Get the job. Don't overwhelm me with data. Just tell me what to do next.\n                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 p-8 rounded-xl border border-accent/30 bg-accent/5">
          <h3 className="font-bold text-lg mb-4 text-center\">Unified Backend Powers Both</h3>
          <div className="grid md:grid-cols-3 gap-6 text-center\">
            <div>
              <p className="text-sm font-semibold mb-2\">Single Database</p>
              <p className="text-xs text-muted-foreground\">Persistent profile, application history, response patterns</p>
            </div>
            <div>
              <p className="text-sm font-semibold mb-2\">Unified Agents</p>
              <p className="text-xs text-muted-foreground\">Same matching, resume, and follow-up logic for both</p>
            </div>
            <div>
              <p className="text-sm font-semibold mb-2\">Different Surfaces</p>
              <p className="text-xs text-muted-foreground\">Dashboard UI for power users, chat UI for simplicity</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
