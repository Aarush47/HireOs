import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ValueProp() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".vp-left", {
        x: -50, opacity: 0, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 75%" },
      });
      gsap.from(".vp-key", {
        scale: 0.85, opacity: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 70%" },
      });
      gsap.from(".vp-right > *", {
        x: 40, opacity: 0, stagger: 0.15, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 70%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="py-28 md:py-36 valueprop" id="how">
      <div className="max-w-7xl mx-auto px-6 md:px-10 grid lg:grid-cols-12 gap-10 items-center">
        <div className="vp-left lg:col-span-5">
          <h2 className="text-3xl md:text-5xl font-black tracking-tightest text-balance">
            Tell HIREOS who you are. The assistant handles the search.
          </h2>
          <p className="eyebrow mt-6">
            built for job seekers who want a faster, more organized way to apply.
          </p>
        </div>

        <div className="vp-key lg:col-span-3 grid place-items-center">
          <KeyholeArt />
        </div>

        <div className="vp-right lg:col-span-4 space-y-10 lg:text-right">
          <div>
            <h3 className="text-xl font-bold">Share your full profile</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Add skills, education, experience, projects, role preferences, and any detail the agent needs.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold">Get a resume and outreach kit</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              The assistant creates a resume tailored to the role and drafts personalized emails in your voice.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function KeyholeArt() {
  return (
    <svg width="160" height="220" viewBox="0 0 160 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M80 8 C36 8 8 40 8 84 C8 116 28 142 56 156 L40 212 L120 212 L104 156 C132 142 152 116 152 84 C152 40 124 8 80 8 Z M80 60 a26 26 0 1 1 -0.001 0 Z M68 100 L92 100 L100 150 L60 150 Z"
        fill="#111"
      />
    </svg>
  );
}
