import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Lock, Activity, ArrowRight } from "lucide-react";
import { HeroHeart } from "../components/HeroHeart";
import { DonorCard } from "../components/DonorCard";
import {
  MissionSection,
  ProcessSection,
  ImpactSection,
  BesoinsSection,
  StoriesSection,
  PartnersSection,
  FaqSection,
  CtaSection,
  Footer,
} from "../components/sections/Sections";
import { EASE_CINEMATIC, reveal } from "../lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LifeLink — A heartbeat beyond your own" },
      {
        name: "description",
        content:
          "Register your post-mortem organ donation consent on LifeLink. Secure, dignified, and humane — continue a heartbeat beyond your own.",
      },
      { property: "og:title", content: "LifeLink — A heartbeat beyond your own" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main>
      <Hero />
      <MissionSection />
      <ProcessSection />
      <ImpactSection />
      <BesoinsSection />
      <DonorShowcase />
      <StoriesSection />
      <PartnersSection />
      <FaqSection />
      <CtaSection />
      <Footer />
    </main>
  );
}

/* ----------------------------------------------------------------------- */
/* Hero                                                                     */
/* ----------------------------------------------------------------------- */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE_CINEMATIC } },
};

function Hero() {
  return (
    <section className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-5 pb-16 pt-32 lg:grid-cols-2 lg:pt-20">
      <motion.div variants={container} initial="hidden" animate="show">
        <motion.div
          variants={item}
          className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 font-mono text-xs text-cyan-glow"
        >
          <span
            className="h-2 w-2 rounded-full bg-emerald-life"
            style={{ animation: "var(--animate-pulse-glow)" }}
          />
          REGISTRY ONLINE · 2,400,000 DONORS
        </motion.div>

        <motion.h1
          variants={item}
          className="mt-6 text-balance text-5xl font-semibold leading-[1.05] md:text-7xl"
        >
          A <span className="gradient-text">heartbeat</span> beyond your own.
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 max-w-md text-pretty text-lg text-muted-foreground"
        >
          LifeLink is the dignified, encrypted registry for post-mortem organ
          donation. One decision today can continue up to eight lives tomorrow.
        </motion.p>

        <motion.div variants={item} className="mt-9 flex flex-wrap gap-4">
          <Link
            to="/register"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-glow px-7 py-3.5 font-semibold text-primary-foreground shadow-neon transition-transform hover:scale-[1.03]"
          >
            Become a Donor
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/login"
            className="glass inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold transition-transform hover:scale-[1.03]"
          >
            Hospital Console
          </Link>
        </motion.div>

        {/* Trust row */}
        <motion.div
          variants={item}
          className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-muted-foreground"
        >
          <span className="inline-flex items-center gap-2">
            <Lock className="h-4 w-4 text-cyan-glow" /> End-to-end encrypted
          </span>
          <span className="inline-flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-life" /> Live registry
            sync
          </span>
        </motion.div>
      </motion.div>

      {/* Right: holographic heart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: EASE_CINEMATIC, delay: 0.2 }}
        className="relative"
      >
        <HeroHeart />
      </motion.div>
    </section>
  );
}

/* ----------------------------------------------------------------------- */
/* Donor card showcase split                                                */
/* ----------------------------------------------------------------------- */
function DonorShowcase() {
  return (
    <section className="relative mx-auto max-w-7xl px-5 py-28">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <motion.div {...reveal}>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-glow">
            Your Identity
          </p>
          <h2 className="mt-4 text-4xl font-semibold md:text-5xl">
            One card. A{" "}
            <span className="gradient-text">lifetime of intent</span>, sealed.
          </h2>
          <p className="mt-5 max-w-md text-muted-foreground">
            Your donor pass is a cryptographically signed, holographic identity —
            recognized instantly by every partner hospital, fully under your
            control, and revocable at any moment.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {[
              "Biometric + national ID verification",
              "Granular per-organ consent",
              "Tamper-proof, encrypted, and revocable",
            ].map((f) => (
              <li key={f} className="flex items-center gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-full glass text-emerald-life">
                  ✓
                </span>
                <span className="text-muted-foreground">{f}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          {...reveal}
          transition={{ ...reveal.transition, delay: 0.15 }}
          className="flex justify-center"
        >
          <DonorCard />
        </motion.div>
      </div>
    </section>
  );
}
