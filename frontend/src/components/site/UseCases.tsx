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

export function UseCases() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".uc-left > *", {
        y: 30, opacity: 0, stagger: 0.1, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 75%" },
      });
      gsap.from(".uc-image", {
        y: 40, opacity: 0, duration: 0.8, ease: "power3.out",
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
          <img
            src="/Images/The cards.webp"
            alt="Hiring workflow cards"
            className="uc-image w-full max-w-[560px] h-auto object-contain drop-shadow-2xl"
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
}
