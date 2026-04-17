import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { ValueProp } from "@/components/site/ValueProp";
import { PrivacyStatement } from "@/components/site/PrivacyStatement";
import { WalletDemo } from "@/components/site/WalletDemo";
import { UseCases } from "@/components/site/UseCases";
import { Manifesto } from "@/components/site/Manifesto";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "HIREOS — AI Job Search Copilot" },
      {
        name: "description",
        content:
          "HIREOS helps job seekers build resumes, draft outreach emails, discover matching roles, and manage follow-ups with an AI assistant.",
      },
      { property: "og:title", content: "HIREOS — AI Job Search Copilot" },
      {
        property: "og:description",
        content: "An AI assistant that prepares your resume, finds matching jobs, and manages outreach on your behalf.",
      },
    ],
  }),
});

function Index() {
  const sectionReveal = {
    whileInView: { opacity: [0.65, 1], y: [12, 0] },
    viewport: { once: true, amount: 0.24 },
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const },
  };

  return (
    <motion.main className="bg-bg-light text-foreground overflow-x-hidden">
      <Navbar />
      <Hero />
      <motion.div {...sectionReveal}>
        <ValueProp />
      </motion.div>
      <motion.div {...sectionReveal}>
        <PrivacyStatement />
      </motion.div>
      <motion.div {...sectionReveal}>
        <WalletDemo />
      </motion.div>
      <motion.div {...sectionReveal}>
        <UseCases />
      </motion.div>
      <motion.div {...sectionReveal}>
        <Manifesto />
      </motion.div>
      <Footer />
    </motion.main>
  );
}
