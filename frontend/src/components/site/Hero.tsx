import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import officeImage from "../../../THE OFFICE.webp";

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll({ target: root, offset: ["start start", "end start"] });
  const artY = useTransform(scrollYProgress, [0, 1], [0, -30]);

  return (
    <section
      ref={root}
      className="section-shell mesh-grid relative pt-36 md:pt-44 pb-24 md:pb-32 overflow-hidden"
      id="top"
    >
      <div
        className="absolute -right-20 top-28 w-105 h-105 rounded-full blur-3xl"
        style={{ background: "color-mix(in oklab, var(--accent) 26%, transparent)" }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-10 grid lg:grid-cols-2 gap-12 items-center relative">
        <div className="relative z-10">
          <motion.p
            className="hero-sub eyebrow mb-6"
            whileInView={{ opacity: [0.5, 1], y: [8, 0] }}
            viewport={{ once: true }}
          >
            AI assistant for students, fresh graduates, and active job seekers
          </motion.p>
          <h1 className="hero-title headline-mega text-balance">
            Your job search,
            <br />
            handled end to end.
          </h1>
          <p className="hero-sub mt-6 max-w-xl text-base text-muted-foreground leading-relaxed">
            HIREOS learns your skills, education, experience, and preferences, then builds your
            resume, drafts outreach emails, finds matching openings, and manages follow-ups on your
            behalf.
          </p>

          <div className="hero-cta mt-10 flex flex-wrap items-center gap-4">
            <motion.button
              onClick={() => navigate({ to: "/auth" })}
              className="btn-accent flex items-center gap-2"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
            >
              Get started <ArrowRight className="w-4 h-4" />
            </motion.button>
            <a
              href="#how"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition"
            >
              Learn how it works →
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {["Builds your resume", "Finds matching jobs", "Sends and follows up"].map((chip) => (
              <span
                key={chip}
                className="frost rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em]"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>

        <motion.div
          className="hero-illustration relative h-105 lg:h-130 grid place-items-center"
          style={{ y: artY }}
        >
          <div className="relative w-full max-w-[520px] px-4 md:px-0 h-full rounded-2xl border border-white/12 bg-gradient-to-b from-accent/8 to-transparent overflow-hidden">
            <img
              src={officeImage}
              alt="Office workspace"
              className="h-full w-full object-cover object-center"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/12 via-transparent to-transparent" />
            <div
              className="absolute -inset-x-10 -bottom-8 h-20 -z-10 blur-2xl"
              style={{
                background: "radial-gradient(ellipse at center, rgba(0,0,0,0.15), transparent 70%)",
              }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
