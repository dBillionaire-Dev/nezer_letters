import confetti from "canvas-confetti";

const GOLD = ["#e7c27d", "#f3d9a4", "#c9a0ff", "#ffb3c7", "#ffffff"];

/** Celebration burst used after a letter is delivered. Respects reduced motion. */
export function celebrate() {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const defaults = { colors: GOLD, disableForReducedMotion: true, zIndex: 100 };

  confetti({ ...defaults, particleCount: 70, spread: 70, origin: { y: 0.62 } });
  window.setTimeout(
    () => confetti({ ...defaults, particleCount: 45, angle: 60, spread: 60, origin: { x: 0, y: 0.7 } }),
    140,
  );
  window.setTimeout(
    () => confetti({ ...defaults, particleCount: 45, angle: 120, spread: 60, origin: { x: 1, y: 0.7 } }),
    260,
  );
}
