import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function PrivacyStatement() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".ps-head > *", {
        y: 40, opacity: 0, stagger: 0.15, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 75%" },
      });
      gsap.from(".orchestration-image", {
        y: 32, opacity: 0, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: ".pipeline-grid", start: "top 74%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="features"
      className="dark py-28 md:py-36 bg-bg-dark text-white"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="ps-head max-w-4xl">
          <h2 className="text-4xl md:text-6xl font-black tracking-tightest leading-[0.95]">
            End-to-end automation flow.
          </h2>
          <h2 className="text-4xl md:text-6xl font-black tracking-tightest leading-[0.95] mt-2">
            <span className="font-mono text-accent">{">>>"}</span>{" "}
            <span className="text-accent">n8n-style orchestration for hiring.</span>
          </h2>
        </div>

        <div className="pipeline-grid mt-14 rounded-2xl border border-white/14 bg-gradient-to-b from-white/10 to-white/4 p-4 md:p-6 overflow-x-auto">
          <img
            src="/n8n-workflow.png"
            alt="n8n-style automation orchestration"
            className="orchestration-image w-full h-auto rounded-lg border border-white/12"
            loading="eager"
          />

          <p className="mt-4 text-xs text-white/62">
            Pipeline: collect profile data → generate resume/email assets → scrape jobs → auto match & apply → follow up until response.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-lg border border-white/12 bg-white/6 p-4 text-sm text-white/85">
            Collects complete candidate context once and reuses it across every application.
          </div>
          <div className="rounded-lg border border-white/12 bg-white/6 p-4 text-sm text-white/85">
            Automatically drafts tailored resumes and outreach for each target role.
          </div>
          <div className="rounded-lg border border-white/12 bg-white/6 p-4 text-sm text-white/85">
            Tracks replies and sends timed follow-ups so opportunities do not go cold.
          </div>
        </div>
      </div>
    </section>
  );
}
