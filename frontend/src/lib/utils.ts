/**
 * Tiny className combiner — joins truthy class fragments.
 * Keeps components dependency-light while staying readable.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Easing curve used across all entrance motion. */
export const EASE_CINEMATIC = [0.22, 1, 0.36, 1] as const;

/** Shared whileInView reveal preset. */
export const reveal = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.8, ease: EASE_CINEMATIC },
};
