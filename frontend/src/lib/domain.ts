import {
  Heart,
  Wind,
  Droplets,
  Bean,
  Activity,
  Eye,
  Layers,
  CircleDot,
} from "lucide-react";

/** Miroir des énumérations backend (français). */
export const GROUPES_SANGUINS = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"] as const;

export const ORGANES = [
  "Coeur",
  "Poumons",
  "Foie",
  "Reins",
  "Pancreas",
  "Intestin",
  "Cornees",
  "Tissus",
] as const;

export const ORGANES_ICONS: { name: string; label: string; icon: typeof Heart }[] = [
  { name: "Coeur", label: "Cœur", icon: Heart },
  { name: "Poumons", label: "Poumons", icon: Wind },
  { name: "Foie", label: "Foie", icon: Droplets },
  { name: "Reins", label: "Reins", icon: Bean },
  { name: "Pancreas", label: "Pancréas", icon: Activity },
  { name: "Intestin", label: "Intestin", icon: Layers },
  { name: "Cornees", label: "Cornées", icon: Eye },
  { name: "Tissus", label: "Tissus", icon: CircleDot },
];

export const URGENCES = ["faible", "moyenne", "elevee", "critique"] as const;

export const URGENCE_LABEL: Record<string, string> = {
  faible: "Faible",
  moyenne: "Moyenne",
  elevee: "Élevée",
  critique: "Critique",
};

export const URGENCE_TONE: Record<string, string> = {
  faible: "text-muted-foreground border-border",
  moyenne: "text-cyan-glow border-cyan-glow/40",
  elevee: "text-neon-pink border-neon-pink/40",
  critique: "text-organic-red border-organic-red/50",
};
