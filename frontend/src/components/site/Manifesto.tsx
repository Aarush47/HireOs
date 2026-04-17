import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Eye, EyeOff, ScanEye } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function Manifesto() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".mf-icon", {
        y: 30, opacity: 0, stagger: 0.15, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 80%" },
      });
      const words = root.current?.querySelectorAll(".mf-word");
      if (words) {
        gsap.from(words, {
          y: 20, opacity: 0, stagger: 0.04, duration: 0.6, ease: "power2.out",
          scrollTrigger: { trigger: root.current, start: "top 75%" },
        });
      }
      gsap.from(".mf-cta", {
        y: 20, opacity: 0, stagger: 0.1, duration: 0.6, delay: 0.2, ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 75%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const headline = "Freedom isn't freedom if someone's always watching.";

  return (
    <section
      ref={root}
      id="vision"
      className="dark bg-bg-dark text-white py-28 md:py-36"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-4 flex items-center gap-6 lg:flex-col lg:items-start">
          {[Eye, ScanEye, EyeOff].map((Icon, i) => (
            <div
              key={i}
              className="mf-icon w-20 h-20 rounded-full border border-white/15 grid place-items-center relative"
            >
              <Icon className="w-9 h-9" strokeWidth={1.3} />
              <span
                className="absolute inset-0 rounded-full pulse-glow"
                style={{
                  background:
                    "radial-gradient(circle at center, color-mix(in oklab, var(--accent) 30%, transparent), transparent 70%)",
                }}
              />
            </div>
          ))}
        </div>

        <div className="lg:col-span-8">
          <h2 className="text-3xl md:text-5xl font-black tracking-tightest leading-[1.05] text-balance">
            {"Everyone deserves a fair shot at work.".split(" ").map((w, i) => (
              <span key={i} className="mf-word inline-block mr-[0.25em]">
                {w}
              </span>
            ))}
          </h2>
          <p className="mt-8 text-sm md:text-base font-light leading-[1.7] text-white/80 max-w-2xl">
            HIREOS is built to remove repetitive job-search work. It helps candidates present themselves better, find relevant openings faster, and stay consistent with outreach until opportunities respond.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a href="#how" className="mf-cta btn-outline-light text-sm font-semibold">
              See the workflow
            </a>
            <a href="#features" className="mf-cta btn-outline-light text-sm font-semibold">
              Explore features
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
