"use client";
import { useEffect, useRef } from "react";

type Particle = {
  left: string;
  dur: string;
  delay: string;
  drift: string;
  size: string;
  color: string;
};

const COLORS = ["#D4922A", "#E8B366", "#F5C878", "#C07820", "#FFDD88"];
const COUNT = 24;

function makeParticles(): Particle[] {
  return Array.from({ length: COUNT }, () => ({
    left:  `${Math.random() * 100}%`,
    dur:   `${5 + Math.random() * 8}s`,
    delay: `${Math.random() * 6}s`,
    drift: `${(Math.random() - 0.5) * 100}px`,
    size:  `${1.5 + Math.random() * 3}px`,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }));
}

export default function EmberParticles({ count = COUNT }: { count?: number }) {
  const particles = useRef<Particle[]>(makeParticles());

  return (
    <div className="embers" aria-hidden>
      {particles.current.map((p, i) => (
        <span
          key={i}
          className="ember-particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 6px 2px ${p.color}`,
            ["--dur" as string]: p.dur,
            ["--delay" as string]: p.delay,
            ["--drift" as string]: p.drift,
          }}
        />
      ))}
    </div>
  );
}
