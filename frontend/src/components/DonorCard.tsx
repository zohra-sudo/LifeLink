import { motion } from "framer-motion";
import { Heart, ShieldCheck } from "lucide-react";
import { cn } from "../lib/utils";

/**
 * Futuristic 2030 donor identity card. A glass-strong slab with a slowly
 * rotating holographic conic sheen, a heartbeat seal, an encrypted QR
 * placeholder, and biometric identity fields.
 */

interface DonorCardProps {
  name?: string;
  donorId?: string;
  bloodType?: string;
  organs?: string;
  validUntil?: string;
  /** Real QR code data URL from the backend; falls back to a decorative grid. */
  qr?: string;
  className?: string;
}

function EncryptedQR({ qr }: { qr?: string }) {
  if (qr) {
    return (
      <div className="rounded-md bg-background/60 p-1.5 neon-border">
        <img src={qr} alt="Donor verification QR code" className="h-16 w-16" />
      </div>
    );
  }
  // Deterministic pseudo-QR grid (7x7) — decorative fallback.
  const cells = Array.from({ length: 49 }, (_, i) => ((i * 73 + 17) % 5) > 1);
  return (
    <div className="grid grid-cols-7 gap-[2px] rounded-md bg-background/60 p-1.5 neon-border">
      {cells.map((on, i) => (
        <span
          key={i}
          className={cn(
            "aspect-square rounded-[1px]",
            on ? "bg-cyan-glow" : "bg-transparent"
          )}
        />
      ))}
    </div>
  );
}

export function DonorCard({
  name = "Amelia R. Voss",
  donorId = "LL-2030-0042-AX",
  bloodType = "O−",
  organs = "Heart · Lungs · Liver · Corneas",
  validUntil = "12 / 2031",
  qr,
  className,
}: DonorCardProps) {
  return (
    <motion.div
      whileHover={{ rotateX: -4, rotateY: 6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      style={{ transformPerspective: 1000 }}
      className={cn(
        "scanline glass-strong relative aspect-[5/7] w-full max-w-[320px] overflow-hidden rounded-2xl p-5",
        className
      )}
    >
      {/* Rotating holographic sheen */}
      <motion.div
        aria-hidden
        className="absolute -inset-1/2 opacity-40"
        style={{
          background:
            "conic-gradient(from 0deg, transparent, oklch(0.82 0.18 200 / 0.45), transparent 30%, oklch(0.62 0.22 295 / 0.4), transparent 60%)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative flex h-full flex-col">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              LifeLink Registry
            </p>
            <p className="mt-1 font-display text-lg font-semibold text-glow">
              Donor Pass
            </p>
          </div>
          {/* Heartbeat seal */}
          <div className="relative grid h-11 w-11 place-items-center rounded-full glass">
            <Heart
              className="h-5 w-5 fill-organic-red/30 text-organic-red"
              style={{ animation: "var(--animate-heartbeat)" }}
            />
          </div>
        </div>

        {/* Biometric fields */}
        <dl className="mt-6 space-y-3 text-sm">
          <Field label="Name" value={name} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Donor ID" value={donorId} mono />
            <Field label="Blood" value={bloodType} mono accent />
          </div>
          <Field label="Organs consented" value={organs} small />
        </dl>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <EncryptedQR qr={qr} />
          <div className="text-right">
            <p className="flex items-center justify-end gap-1 font-mono text-[10px] text-emerald-life">
              <ShieldCheck className="h-3 w-3" /> ENCRYPTED
            </p>
            <p className="mt-1 font-mono text-[10px] text-muted-foreground">
              VALID {validUntil}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Field({
  label,
  value,
  mono,
  accent,
  small,
}: {
  label: string;
  value: string;
  mono?: boolean;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-0.5 font-medium",
          mono && "font-mono",
          small ? "text-xs" : "text-sm",
          accent ? "text-cyan-glow" : "text-foreground"
        )}
      >
        {value}
      </dd>
    </div>
  );
}
