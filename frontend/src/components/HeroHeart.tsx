import { motion } from "framer-motion";
import holoHeart from "../assets/holo-heart.svg";

/**
 * Cinematic holographic heart. The image pulses with the cardiac `heartbeat`
 * keyframe (it never stops), concentric rings expand outward, and live
 * biometric tags float around it in mono-font glass pills.
 */

const dataTags = [
  { label: "BPM", value: "72", pos: "top-6 -left-4 md:-left-10", accent: "text-cyan-glow" },
  { label: "O₂", value: "98%", pos: "top-1/3 -right-4 md:-right-12", accent: "text-emerald-life" },
  { label: "STATUS", value: "LIVE", pos: "bottom-10 -left-2 md:-left-8", accent: "text-neon-pink" },
];

export function HeroHeart() {
  return (
    <div className="relative mx-auto flex aspect-square w-full max-w-[460px] items-center justify-center">
      {/* Expanding pulse rings */}
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute rounded-full border border-cyan-glow/30"
          style={{ width: "62%", height: "62%" }}
          initial={{ scale: 0.7, opacity: 0.5 }}
          animate={{ scale: 1.7, opacity: 0 }}
          transition={{
            duration: 3,
            delay: i * 1,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Glow base */}
      <div
        className="absolute h-[70%] w-[70%] rounded-full blur-3xl"
        style={{ background: "var(--gradient-pulse)" }}
      />

      {/* The heart image — continuous heartbeat, never stops */}
      <div className="scanline relative h-[78%] w-[78%] overflow-hidden rounded-full">
        <img
          src={holoHeart}
          alt="Holographic anatomical heart pulsing with a live cardiac rhythm"
          className="h-full w-full object-contain"
          style={{ animation: "var(--animate-heartbeat)" }}
        />
      </div>

      {/* Floating biometric tags */}
      {dataTags.map((tag, i) => (
        <motion.div
          key={tag.label}
          className={`glass absolute ${tag.pos} flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-xs`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: [0, -6, 0] }}
          transition={{
            opacity: { delay: 0.6 + i * 0.2, duration: 0.6 },
            y: { duration: 4 + i, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <span className="text-muted-foreground">{tag.label}</span>
          <span className={`font-semibold ${tag.accent}`}>{tag.value}</span>
        </motion.div>
      ))}
    </div>
  );
}
