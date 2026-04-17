import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const bullets = [
  {
    lead: "For students and fresh graduates:",
    body: "Build a professional profile, create a strong resume, and start applying faster.",
  },
  {
    lead: "For unemployed job seekers:",
    body: "Find openings that match your experience and automate the application workflow.",
  },
  {
    lead: "For hiring teams:",
    body: "Receive better-matched candidates and cleaner applications with less manual screening.",
  },
  {
    lead: "For long job searches:",
    body: "Trigger follow-up emails and keep every application organized in one place.",
  },
];

const phases = [
  { tag: "Step 3", title: "Follow Up", offset: 0 },
  { tag: "Step 2", title: "Match Roles", offset: 1 },
  { tag: "Step 1", title: "Build Profile", offset: 2 },
];

export function UseCases() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".uc-left > *", {
        y: 30, opacity: 0, stagger: 0.1, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 75%" },
      });
      gsap.from(".uc-phase", {
        y: 40, opacity: 0, stagger: 0.15, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: ".uc-diagram", start: "top 80%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="py-28 md:py-36">
      <div className="max-w-7xl mx-auto px-6 md:px-10 grid lg:grid-cols-2 gap-16 items-center">
        <div className="uc-left">
          <h2 className="text-3xl md:text-5xl font-black tracking-tightest uppercase leading-[1] text-balance">
            One assistant. <br />Two audiences.
          </h2>
          <ul className="mt-10 space-y-6">
            {bullets.map((b) => (
              <li key={b.lead} className="text-sm leading-relaxed">
                <span className="font-bold text-foreground">{b.lead}</span>{" "}
                <span className="text-muted-foreground">{b.body}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="uc-diagram relative h-[440px] grid place-items-center">
          <div
            className="relative"
            style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
          >
            {phases.map((p, i) => (
              <div
                key={p.tag}
                className="uc-phase absolute left-1/2 -translate-x-1/2"
                style={{
                  top: `${i * 90}px`,
                  transform: `rotateX(55deg) rotateZ(-25deg) translateZ(${(2 - i) * 30}px)`,
                }}
              >
                <div className="relative">
                  <div
                    className="w-[280px] h-[140px] rounded-2xl border border-foreground/15"
                    style={{
                      background:
                        i === 0
                          ? "linear-gradient(135deg, var(--accent), color-mix(in oklab, var(--accent) 60%, white))"
                          : "linear-gradient(135deg, #2a2a2a, #0e0e0e)",
                      boxShadow: "0 20px 40px -10px rgba(0,0,0,0.4)",
                    }}
                  />
                  <div
                    className="absolute -top-9 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-foreground text-background whitespace-nowrap"
                    style={{ transform: "rotateZ(25deg) rotateX(-55deg)" }}
                  >
                    {p.tag} · {p.title}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
