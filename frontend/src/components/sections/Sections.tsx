import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  HeartPulse,
  FlaskConical,
  HandHeart,
  UserPlus,
  ShieldCheck,
  Activity,
  Infinity as InfinityIcon,
  Quote,
  ChevronDown,
} from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { reveal, EASE_CINEMATIC, cn } from "../../lib/utils";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { ORGANES_ICONS, URGENCE_LABEL, URGENCE_TONE } from "../../lib/domain";

/* ----------------------------------------------------------------------- */
/* Shared section heading                                                   */
/* ----------------------------------------------------------------------- */
function SectionHeading({
  eyebrow,
  title,
  highlight,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  subtitle?: string;
}) {
  return (
    <motion.div {...reveal} className="mx-auto max-w-2xl text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-glow">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-balance text-4xl font-semibold md:text-5xl">
        {title} {highlight && <span className="gradient-text">{highlight}</span>}
      </h2>
      {subtitle && (
        <p className="mt-4 text-pretty text-muted-foreground">{subtitle}</p>
      )}
    </motion.div>
  );
}

/* ----------------------------------------------------------------------- */
/* Mission                                                                  */
/* ----------------------------------------------------------------------- */
const pillars = [
  {
    icon: HandHeart,
    title: "Dignity",
    body: "Every donor is honored. Consent is sovereign, encrypted, and revocable — a final act of generosity treated with absolute respect.",
  },
  {
    icon: FlaskConical,
    title: "Science",
    body: "Real-time compatibility matching across blood type, tissue markers, and geography — engineered to lose not a single viable hour.",
  },
  {
    icon: HeartPulse,
    title: "Humanity",
    body: "Behind every match are two families. We hold both with care, connecting loss to renewal with warmth, never cold transaction.",
  },
];

export function MissionSection() {
  return (
    <section id="mission" className="relative mx-auto max-w-7xl px-5 py-28">
      <SectionHeading
        eyebrow="Our Mission"
        title="Built on three"
        highlight="unbreakable pillars"
        subtitle="LifeLink exists to make the most generous human decision effortless, secure, and profoundly dignified."
      />
      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {pillars.map((p, i) => (
          <motion.article
            key={p.title}
            {...reveal}
            transition={{ ...reveal.transition, delay: i * 0.12 }}
            className="group glass relative overflow-hidden rounded-2xl p-7 transition-shadow hover:shadow-glow"
          >
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-life/10 blur-2xl transition-opacity group-hover:opacity-100 opacity-0" />
            <span className="grid h-12 w-12 place-items-center rounded-xl glass text-emerald-life">
              <p.icon className="h-6 w-6" />
            </span>
            <h3 className="mt-5 text-xl font-semibold">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {p.body}
            </p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- */
/* Process — vertical timeline that draws on scroll                         */
/* ----------------------------------------------------------------------- */
const steps = [
  {
    icon: UserPlus,
    title: "Register",
    body: "Declare your consent in minutes with verified national identity. Choose exactly which organs and tissues to give.",
  },
  {
    icon: ShieldCheck,
    title: "Verify",
    body: "Your decision is cryptographically sealed and mirrored to authorized transplant networks — tamper-proof, always yours to revoke.",
  },
  {
    icon: Activity,
    title: "Match",
    body: "At the critical moment, our engine finds the most compatible recipients across the registry in real time.",
  },
  {
    icon: InfinityIcon,
    title: "Continue",
    body: "Your heartbeat continues in another. Families receive a dignified, anonymous thread of connection and gratitude.",
  },
];

export function ProcessSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 70%", "end 60%"],
  });
  const height = useSpring(useTransform(scrollYProgress, [0, 1], ["0%", "100%"]), {
    stiffness: 80,
    damping: 24,
  });

  return (
    <section id="process" className="relative mx-auto max-w-4xl px-5 py-28">
      <SectionHeading
        eyebrow="The Process"
        title="Four steps from"
        highlight="decision to legacy"
      />

      <div ref={ref} className="relative mt-16 pl-8 md:pl-0">
        {/* Track */}
        <div className="absolute left-[14px] top-2 h-full w-px bg-border md:left-1/2 md:-translate-x-1/2" />
        <motion.div
          style={{ height }}
          className="absolute left-[14px] top-2 w-px bg-gradient-to-b from-cyan-glow via-turquoise to-bio-purple md:left-1/2 md:-translate-x-1/2"
        />

        <div className="space-y-12">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: EASE_CINEMATIC }}
              className={cn(
                "relative md:grid md:grid-cols-2 md:items-center md:gap-10",
                i % 2 === 1 && "md:[direction:rtl]"
              )}
            >
              {/* Node */}
              <span className="absolute left-[-26px] top-1 grid h-8 w-8 place-items-center rounded-full glass-strong text-cyan-glow md:left-1/2 md:-translate-x-1/2">
                <s.icon className="h-4 w-4" />
              </span>

              <div
                className={cn(
                  "glass rounded-2xl p-6 [direction:ltr]",
                  i % 2 === 1 ? "md:col-start-2" : "md:col-start-1"
                )}
              >
                <p className="font-mono text-xs text-cyan-glow">
                  STEP {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-1 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- */
/* Impact — animated counters                                               */
/* ----------------------------------------------------------------------- */
function Counter({
  to,
  suffix = "",
  duration = 2,
}: {
  to: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    let start: number | null = null;
    const tick = (t: number) => {
      if (start === null) start = t;
      const p = Math.min((t - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  return (
    <span ref={ref}>
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}

const DEFAULT_STATS = [
  { to: 128450, suffix: "", label: "Vies sauvées" },
  { to: 2400000, suffix: "", label: "Donneurs inscrits" },
  { to: 380, suffix: "", label: "Hôpitaux partenaires" },
  { to: 42, suffix: "", label: "Pays" },
];

export function ImpactSection() {
  const [stats, setStats] = useState(DEFAULT_STATS);

  // Compteurs live depuis l'API publique ; valeurs par défaut sinon.
  useEffect(() => {
    api
      .statsPubliques()
      .then((s) =>
        setStats([
          { to: s.viesSauvees, suffix: "", label: "Vies sauvées" },
          { to: s.donneurs, suffix: "", label: "Donneurs inscrits" },
          { to: s.hopitaux, suffix: "", label: "Hôpitaux partenaires" },
          { to: s.pays, suffix: "", label: "Pays" },
        ])
      )
      .catch(() => {});
  }, []);

  return (
    <section id="impact" className="relative mx-auto max-w-7xl px-5 py-28">
      <SectionHeading
        eyebrow="Living Impact"
        title="Every number is a"
        highlight="second chance"
      />
      <div className="mt-16 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            {...reveal}
            transition={{ ...reveal.transition, delay: i * 0.1 }}
            className="glass relative overflow-hidden rounded-2xl p-7 text-center"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-glow" />
            <p className="font-display text-4xl font-semibold text-glow md:text-5xl">
              <Counter to={s.to} suffix={s.suffix} />
            </p>
            <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
              {s.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- */
/* Stories — testimonials                                                   */
/* ----------------------------------------------------------------------- */
const stories = [
  {
    quote:
      "They told us his heart was strong. Knowing it still beats — that someone wakes each morning because of him — turned our grief into something we can hold.",
    name: "Marcouane B.",
    role: "Donor's father",
    accent: "organic-red",
  },
  {
    quote:
      "I was 31, on the list for two years. The call came at 3 a.m. I will never know their name, only that I get to raise my daughter because of them.",
    name: "Elena V.",
    role: "Heart recipient",
    accent: "emerald-life",
  },
  {
    quote:
      "Registering took four minutes. It was the easiest important decision of my life — and the only one that outlives me.",
    name: "Dr. Karim A.",
    role: "Registered donor",
    accent: "cyan-glow",
  },
];

export function StoriesSection() {
  return (
    <section id="stories" className="relative mx-auto max-w-7xl px-5 py-28">
      <SectionHeading
        eyebrow="Real Stories"
        title="The thread between"
        highlight="loss and renewal"
        subtitle="Shared with permission and held with care. Identities of donors and recipients remain protected."
      />
      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {stories.map((s, i) => (
          <motion.figure
            key={s.name}
            {...reveal}
            transition={{ ...reveal.transition, delay: i * 0.12 }}
            className="glass relative flex flex-col rounded-2xl p-7"
          >
            <Quote
              className={`h-7 w-7 text-${s.accent} opacity-60`}
              aria-hidden
            />
            <blockquote className="mt-4 flex-1 text-pretty text-sm leading-relaxed text-foreground/90">
              “{s.quote}”
            </blockquote>
            <figcaption className="mt-6 border-t border-border pt-4">
              <p className="text-sm font-semibold">{s.name}</p>
              <p className="font-mono text-xs text-muted-foreground">
                {s.role}
              </p>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- */
/* Partners                                                                 */
/* ----------------------------------------------------------------------- */
const partners = [
  "NeuroVita",
  "Atlas Transplant",
  "BioContinuum",
  "Meridian Health",
  "HeliosCare",
  "Veritas Labs",
];

export function PartnersSection() {
  return (
    <section className="relative mx-auto max-w-7xl px-5 py-16">
      <motion.div
        {...reveal}
        className="glass flex flex-wrap items-center justify-center gap-x-10 gap-y-5 rounded-2xl px-8 py-6"
      >
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Trusted by
        </span>
        {partners.map((p) => (
          <span
            key={p}
            className="font-display text-lg font-medium text-muted-foreground/70 transition-colors hover:text-foreground"
          >
            {p}
          </span>
        ))}
      </motion.div>
    </section>
  );
}

/* ----------------------------------------------------------------------- */
/* CTA                                                                      */
/* ----------------------------------------------------------------------- */
export function CtaSection() {
  return (
    <section className="relative mx-auto max-w-7xl px-5 py-28">
      <motion.div
        {...reveal}
        className="relative overflow-hidden rounded-3xl px-8 py-20 text-center neon-border"
      >
        <div className="absolute inset-0 bg-gradient-glow opacity-20" />
        <div className="absolute inset-0 grid-mesh opacity-30" />
        <div className="relative">
          <h2 className="mx-auto max-w-3xl text-balance text-4xl font-semibold md:text-6xl">
            Continue a <span className="gradient-text">heartbeat</span> beyond
            your own.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-muted-foreground">
            One decision. Up to eight lives. A legacy that keeps moving long
            after you do.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="rounded-full bg-gradient-glow px-8 py-3.5 font-semibold text-primary-foreground shadow-neon transition-transform hover:scale-[1.03]"
            >
              Become a Donor
            </Link>
            <Link
              to="/login"
              className="glass rounded-full px-8 py-3.5 font-semibold transition-transform hover:scale-[1.03]"
            >
              Hospital Console
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ----------------------------------------------------------------------- */
/* Besoins — demandes d'organes en attente (espace visiteur)                */
/* ----------------------------------------------------------------------- */
interface BesoinPublic {
  _id: string;
  organe: string;
  groupeSanguinReceveur: string;
  urgence: string;
  ville?: string;
}

export function BesoinsSection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [besoins, setBesoins] = useState<BesoinPublic[]>([]);

  useEffect(() => {
    api.demandesPubliques().then((r) => setBesoins(r.demandes)).catch(() => {});
  }, []);

  // Postuler : si non connecté → inscription ; si donneur → son espace.
  const postuler = () => {
    if (!user) navigate({ to: "/register" });
    else navigate({ to: "/dashboard" });
  };

  return (
    <section id="besoins" className="relative mx-auto max-w-7xl px-5 py-28">
      <SectionHeading
        eyebrow="Besoins urgents"
        title="Des patients"
        highlight="attendent"
        subtitle="Des hôpitaux partenaires recherchent en ce moment des organes compatibles. Votre consentement peut tout changer."
      />

      {besoins.length === 0 ? (
        <motion.p {...reveal} className="mt-12 text-center text-sm text-muted-foreground">
          Aucun besoin public pour le moment. Les demandes des hôpitaux
          apparaîtront ici.
        </motion.p>
      ) : (
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {besoins.map((b, i) => {
            const o = ORGANES_ICONS.find((x) => x.name === b.organe);
            const Icon = o?.icon;
            return (
              <motion.div
                key={b._id}
                {...reveal}
                transition={{ ...reveal.transition, delay: i * 0.06 }}
                className="glass relative overflow-hidden rounded-2xl p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-xl glass text-cyan-glow">
                    {Icon ? <Icon className="h-5 w-5" /> : null}
                  </span>
                  <span className={cn("rounded-full border px-2.5 py-1 text-[10px] uppercase", URGENCE_TONE[b.urgence])}>
                    {URGENCE_LABEL[b.urgence] || b.urgence}
                  </span>
                </div>
                <p className="mt-4 font-display text-lg font-semibold">{o?.label || b.organe}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  Receveur <span className="text-organic-red">{b.groupeSanguinReceveur}</span> · {b.ville || "—"}
                </p>
              </motion.div>
            );
          })}
        </div>
      )}

      <motion.div {...reveal} className="mt-12 text-center">
        <button
          onClick={postuler}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-glow px-8 py-3.5 font-semibold text-primary-foreground shadow-neon transition-transform hover:scale-[1.03]"
        >
          Je veux faire un don d'organe
        </button>
        <p className="mt-3 text-xs text-muted-foreground">
          Connexion ou inscription requise pour postuler.
        </p>
      </motion.div>
    </section>
  );
}

/* ----------------------------------------------------------------------- */
/* FAQ — visitor information & legal conditions                             */
/* ----------------------------------------------------------------------- */
const faqs = [
  {
    q: "Who can register as an organ donor?",
    a: "Any willing adult can create an account and record their consent. Donation only ever takes place post-mortem, and your decision can be modified or revoked at any time from your console.",
  },
  {
    q: "Is my consent legally binding and explicit?",
    a: "LifeLink records an explicit, traceable consent. Every change to your dossier is timestamped and logged, ensuring full transparency for you and authorized medical teams.",
  },
  {
    q: "Which organs and tissues can I choose to donate?",
    a: "You select precisely what to give — heart, lungs, liver, kidneys, pancreas, intestine, corneas or tissue — and you can update that selection whenever you wish.",
  },
  {
    q: "How is my medical data protected?",
    a: "Data is encrypted, access is role-based, and only approved hospitals can consult the consenting registry. Passwords are hashed and never stored in clear text.",
  },
  {
    q: "How do hospitals access the registry?",
    a: "Hospitals register and are verified by an administrator before being granted access. They can then search consenting donors by blood type, organ and city to act quickly in an emergency.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative mx-auto max-w-3xl px-5 py-28">
      <SectionHeading
        eyebrow="Questions"
        title="What you should"
        highlight="know"
        subtitle="The essentials on consent, data protection and how donation works."
      />
      <div className="mt-12 space-y-3">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <motion.div
              key={f.q}
              {...reveal}
              transition={{ ...reveal.transition, delay: i * 0.05 }}
              className="glass overflow-hidden rounded-2xl"
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                aria-expanded={isOpen}
              >
                <span className="font-medium">{f.q}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-cyan-glow transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              </button>
              <motion.div
                initial={false}
                animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.3, ease: EASE_CINEMATIC }}
                className="overflow-hidden"
              >
                <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </p>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- */
/* Footer                                                                   */
/* ----------------------------------------------------------------------- */
export function Footer() {
  return (
    <footer className="relative border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-5 py-12 md:flex-row">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg glass">
            <Activity className="h-4 w-4 text-cyan-glow" />
          </span>
          <span className="font-display font-semibold">
            Life<span className="gradient-text">Link</span>
          </span>
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          // continuing heartbeats since 2030 — encrypted &amp; sovereign
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          © 2030 LifeLink Registry
        </p>
      </div>
    </footer>
  );
}
