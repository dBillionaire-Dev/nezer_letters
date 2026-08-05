import { useMemo } from "react";

const PARTICLES = 18;

/** Soft ambient particles drifting over the aurora background. */
export function Particles() {
  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLES }, (_, index) => ({
        left: `${(index * 37) % 100}%`,
        delay: `${(index % 9) * 1.7}s`,
        duration: `${12 + (index % 6) * 3}s`,
        size: 2 + (index % 4),
      })),
    [],
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((particle, index) => (
        <span
          key={index}
          className="absolute bottom-0 rounded-full bg-primary/50 blur-[1px]"
          style={{
            left: particle.left,
            width: particle.size,
            height: particle.size,
            animation: `drift ${particle.duration} linear ${particle.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}
