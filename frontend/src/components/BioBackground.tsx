import { motion } from "framer-motion";

/**
 * Living animated background, present on every page.
 * Aurora orbs drift, a faint mesh grid sits behind, and ~20 biological
 * particles float with randomized timing. Pure CSS + Framer Motion.
 */

// Deterministic pseudo-random so the layout is stable across renders.
const particles = Array.from({ length: 20 }, (_, i) => {
  const seed = (n: number) => ((i + 1) * 9301 + n * 49297) % 233280;
  return {
    id: i,
    left: (seed(7) / 233280) * 100,
    top: (seed(13) / 233280) * 100,
    delay: (seed(3) / 233280) * 8,
    duration: 7 + (seed(5) / 233280) * 8,
    size: 2 + (seed(11) / 233280) * 3,
  };
});

const orbs = [
  { color: "oklch(0.82 0.18 200 / 0.5)", size: 520, top: "-8%", left: "-6%", dur: 22 },
  { color: "oklch(0.78 0.15 180 / 0.4)", size: 440, top: "55%", left: "70%", dur: 26 },
  { color: "oklch(0.62 0.22 295 / 0.45)", size: 600, top: "30%", left: "30%", dur: 30 },
  { color: "oklch(0.72 0.25 350 / 0.28)", size: 360, top: "75%", left: "12%", dur: 24 },
];

export function BioBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Aurora orbs */}
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            top: orb.top,
            left: orb.left,
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color}, transparent 68%)`,
            filter: "blur(60px)",
          }}
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -36, 24, 0],
            scale: [1, 1.12, 0.95, 1],
            opacity: [0.7, 1, 0.8, 0.7],
          }}
          transition={{
            duration: orb.dur,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Mesh grid overlay */}
      <div className="absolute inset-0 grid-mesh opacity-60" />

      {/* Vignette to keep edges deep */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,oklch(0.08_0.03_250_/_0.7))]" />

      {/* Floating biological particles */}
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-cyan-glow"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            boxShadow: "0 0 8px oklch(0.82 0.18 200 / 0.9)",
          }}
          animate={{
            y: [0, -28, 14, 0],
            x: [0, 14, -10, 0],
            opacity: [0.2, 0.9, 0.5, 0.2],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
