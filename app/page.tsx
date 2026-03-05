"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import EmberParticles from "@/components/EmberParticles";

// Set NEXT_PUBLIC_HERO_IMAGE_URL in .env.local to your chosen photo URL from R2.
// If not set, a beautiful pure dark animated hero is shown instead.
const HERO_URL = process.env.NEXT_PUBLIC_HERO_IMAGE_URL ?? "";

export default function HomePage() {
  const [revealed, setRevealed] = useState(false);

  // Slow Ken Burns zoom on the hero photo
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Trigger text animations after a tiny delay so they feel intentional
    const t = setTimeout(() => setRevealed(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <main
      className="relative min-h-dvh flex flex-col overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      {/* ── Full-bleed hero photo ──────────────────────────────────────── */}
      {HERO_URL ? (
        <div
          ref={imgRef}
          className="absolute inset-0 z-0"
          style={{ willChange: "transform" }}
        >
          <Image
            src={HERO_URL}
            alt="Aña & François"
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{
              animation: "kenBurns 20s ease-in-out infinite alternate",
              transformOrigin: "center center",
            }}
          />
          {/* Multi-layer light/dark-adaptive gradient so text stays legible */}
          <div
            className="absolute inset-0"
            style={{
              background: "var(--hero-gradient)",
            }}
          />
          {/* Vignette edges */}
          <div
            className="absolute inset-0"
            style={{
              background: "var(--hero-vignette)",
            }}
          />
        </div>
      ) : (
        /* No photo yet — pure light/dark with adaptive glow */
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0"
            style={{
              background: "var(--empty-glow)",
            }}
          />
        </div>
      )}

      {/* Ember particles float above photo */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <EmberParticles count={HERO_URL ? 16 : 28} />
      </div>

      {/* ── Centered content ──────────────────────────────────────────── */}
      <section
        className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 py-20 text-center"
        style={{ minHeight: "100dvh" }}
      >
        {/* Date label */}
        <p
          className="label mb-8 transition-all duration-700"
          style={{
            color: HERO_URL ? "var(--hero-text-light)" : "var(--muted)",
            opacity: revealed ? 1 : 0,
            transform: revealed ? "translateY(0)" : "translateY(16px)",
            transitionDelay: "0ms",
          }}
        >
          5 mars 2026 · 2026ko martxoaren 5a
        </p>

        {/* Names */}
        <div>
          <h1
            className="display shimmer-text transition-all duration-900"
            style={{
              fontSize: "clamp(3.8rem, 16vw, 8.5rem)",
              opacity: revealed ? 1 : 0,
              transform: revealed ? "translateY(0)" : "translateY(32px)",
              transition: "opacity 1s cubic-bezier(0.22,1,0.36,1), transform 1s cubic-bezier(0.22,1,0.36,1)",
              transitionDelay: "120ms",
            }}
          >
            Aña
          </h1>

          <div
            className="display-italic transition-all"
            style={{
              fontSize: "clamp(1.4rem, 5vw, 2.8rem)",
              color: HERO_URL ? "var(--hero-text-lighter)" : "var(--soft)",
              margin: "4px 0",
              opacity: revealed ? 1 : 0,
              transform: revealed ? "translateY(0)" : "translateY(24px)",
              transition: "opacity 0.9s cubic-bezier(0.22,1,0.36,1), transform 0.9s cubic-bezier(0.22,1,0.36,1)",
              transitionDelay: "220ms",
            }}
          >
            &amp;
          </div>

          <h1
            className="display shimmer-text"
            style={{
              fontSize: "clamp(3.8rem, 16vw, 8.5rem)",
              opacity: revealed ? 1 : 0,
              transform: revealed ? "translateY(0)" : "translateY(32px)",
              transition: "opacity 1s cubic-bezier(0.22,1,0.36,1), transform 1s cubic-bezier(0.22,1,0.36,1)",
              transitionDelay: "300ms",
            }}
          >
            François
          </h1>
        </div>

        {/* Gold line */}
        <div
          className="ember-line my-8"
          style={{
            width: revealed ? "180px" : "0px",
            transition: "width 1.2s cubic-bezier(0.22,1,0.36,1)",
            transitionDelay: "480ms",
          }}
        />

        {/* Children */}
        <p
          className="display-italic"
          style={{
            color: HERO_URL ? "rgba(247,237,216,0.55)" : "var(--muted)",
            fontSize: "clamp(0.95rem, 2.5vw, 1.3rem)",
            letterSpacing: "0.06em",
            marginBottom: "2.5rem",
            opacity: revealed ? 1 : 0,
            transform: revealed ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.9s cubic-bezier(0.22,1,0.36,1), transform 0.9s cubic-bezier(0.22,1,0.36,1)",
            transitionDelay: "560ms",
          }}
        >
          Elena &amp; Bixente
        </p>

        {/* CTA button */}
        <div
          style={{
            opacity: revealed ? 1 : 0,
            transform: revealed ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.9s cubic-bezier(0.22,1,0.36,1), transform 0.9s cubic-bezier(0.22,1,0.36,1)",
            transitionDelay: "700ms",
          }}
        >
          <Link
            href="/gallery"
            className="label px-10 py-4 block transition-all duration-300"
            style={{
              background: "transparent",
              border: "1px solid var(--gold)",
              color: "var(--amber)",
              borderRadius: "2px",
              backdropFilter: HERO_URL ? "blur(8px)" : "none",
              WebkitBackdropFilter: HERO_URL ? "blur(8px)" : "none",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--gold)";
              (e.currentTarget as HTMLElement).style.color = "var(--deep)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "var(--amber)";
            }}
          >
            Galerie · Galeria
          </Link>
        </div>
      </section>

      {/* Scroll caret */}
      <div
        className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-2 z-20"
        style={{
          opacity: revealed ? 1 : 0,
          transition: "opacity 1s ease",
          transitionDelay: "1.1s",
        }}
      >
        <div
          className="w-px h-10"
          style={{
            background: "linear-gradient(to bottom, transparent, var(--gold))",
            animation: "breathe 2.5s ease-in-out infinite",
          }}
        />
      </div>

      {/* Ken Burns keyframe injected inline */}
      <style>{`
        @keyframes kenBurns {
          0%   { transform: scale(1.0)  translate(0%, 0%); }
          33%  { transform: scale(1.06) translate(-1%, 0.5%); }
          66%  { transform: scale(1.04) translate(0.5%, -1%); }
          100% { transform: scale(1.08) translate(-0.5%, 0.5%); }
        }
      `}</style>
    </main>
  );
}
