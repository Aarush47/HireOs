import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Wallet, Lock } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function WalletDemo() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".wd-phone", {
        x: -80,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 75%" },
      });
      gsap.from(".wd-text > *", {
        x: 50,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 75%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="py-28 md:py-36">
      <div className="max-w-7xl mx-auto px-6 md:px-10 grid lg:grid-cols-2 gap-16 items-center">
        <div className="wd-phone grid place-items-center">
          <div className="float-y" style={{ transform: "rotate(-5deg)" }}>
            <PhoneMock />
          </div>
        </div>
        <div className="wd-text">
          <p className="eyebrow mb-4">Personalized. Automated. Trackable.</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tightest text-balance">
            Your profile becomes a job search engine.
          </h2>
          <p className="text-2xl md:text-3xl font-light mt-4 text-muted-foreground">
            HIREOS monitors openings, matches your fit, and keeps outreach moving until the right
            response arrives.
          </p>
        </div>
      </div>
    </section>
  );
}

function PhoneMock() {
  return (
    <div
      className="relative w-[280px] h-[560px] rounded-[44px] bg-bg-dark p-3 shadow-2xl"
      style={{ boxShadow: "0 40px 80px -20px rgba(0,0,0,0.3)" }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10" />
      <div className="w-full h-full rounded-[34px] bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] overflow-hidden flex flex-col items-center justify-center p-6 text-white">
        <div className="w-20 h-20 rounded-2xl bg-accent grid place-items-center mb-6">
          <Lock className="w-10 h-10 text-black" strokeWidth={2.5} />
        </div>
        <h4 className="font-display font-bold text-xl tracking-tight">Create your profile</h4>
        <p className="text-xs text-white/60 mt-2 text-center px-4">
          Add every relevant detail once and let the agent do the rest.
        </p>
        <div className="mt-8 w-full space-y-3">
          {["Skills", "Education", "Experience", "Projects"].map((w) => (
            <div
              key={w}
              className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/5"
            >
              <Wallet className="w-5 h-5 text-accent" />
              <span className="text-sm font-medium">{w}</span>
            </div>
          ))}
        </div>
        <button className="mt-8 w-full bg-accent text-black font-bold py-3 rounded-md text-sm">
          Start Matching
        </button>
      </div>
    </div>
  );
}
