"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import EmberParticles from "@/components/EmberParticles";
import Lauburu from "@/components/Lauburu";

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
        {/* Date label with Basque prominence */}
        <div
          className="flex flex-col items-center gap-1 mb-10 transition-all duration-700"
          style={{
            opacity: revealed ? 1 : 0,
            transform: revealed ? "translateY(0)" : "translateY(16px)",
            transitionDelay: "0ms",
          }}
        >
          <p
            className="label"
            style={{
              color: HERO_URL ? "var(--hero-text-light)" : "var(--muted)",
            }}
          >
            2026ko martxoaren 5a
          </p>
          <p
            style={{
              fontSize: "0.75rem",
              color: HERO_URL ? "var(--hero-text-lighter)" : "var(--soft)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            5 mars 2026
          </p>
        </div>

        {/* Names with Lauburu accent */}
        <div
          className="relative"
          style={{
            opacity: revealed ? 1 : 0,
            transform: revealed ? "scale(1)" : "scale(0.92)",
            transition: "opacity 1.2s cubic-bezier(0.22,1,0.36,1), transform 1.2s cubic-bezier(0.22,1,0.36,1)",
            transitionDelay: "60ms",
          }}
        >
          {/* Subtle corner ornaments */}
          <div
            className="corner-ornament"
            style={{
              top: "-28px",
              left: "-28px",
              opacity: "0.08",
            }}
          />
          <div
            className="corner-ornament"
            style={{
              top: "-28px",
              right: "-28px",
              opacity: "0.08",
              transform: "scaleX(-1)",
            }}
          />

          <div className="display" style={{ marginBottom: "8px" }}>
            <h1
              className="shimmer-text inline-block transition-all duration-900"
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
              style={{
                display: "inline-flex",
                alignItems: "center",
                margin: "0 8px",
                opacity: revealed ? 0.3 : 0,
                transition: "opacity 1s cubic-bezier(0.22,1,0.36,1)",
                transitionDelay: "220ms",
              }}
            >
              <Lauburu size={48} />
            </div>
            <h1
              className="shimmer-text inline-block transition-all"
              style={{
                fontSize: "clamp(3.8rem, 16vw, 8.5rem)",
                opacity: revealed ? 1 : 0,
                transform: revealed ? "translateY(0)" : "translateY(32px)",
                transition: "opacity 1s cubic-bezier(0.22,1,0.36,1), transform 1s cubic-bezier(0.22,1,0.36,1)",
                transitionDelay: "280ms",
              }}
            >
              François
            </h1>
          </div>

          <div
            className="display-italic transition-all"
            style={{
              fontSize: "clamp(0.95rem, 2.5vw, 1.3rem)",
              color: HERO_URL ? "var(--hero-text-lighter)" : "var(--soft)",
              letterSpacing: "0.06em",
              marginBottom: "1.5rem",
              opacity: revealed ? 1 : 0,
              transform: revealed ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.9s cubic-bezier(0.22,1,0.36,1), transform 0.9s cubic-bezier(0.22,1,0.36,1)",
              transitionDelay: "360ms",
            }}
          >
            Elena &amp; Bixente
          </div>

          <div
            className="corner-ornament"
            style={{
              bottom: "-28px",
              left: "-28px",
              opacity: "0.08",
              transform: "scaleY(-1)",
            }}
          />
          <div
            className="corner-ornament"
            style={{
              bottom: "-28px",
              right: "-28px",
              opacity: "0.08",
              transform: "scale(-1)",
            }}
          />
        </div>

        {/* Gold line with Txuleta pattern */}
        <div
          style={{
            opacity: revealed ? 1 : 0,
            transform: revealed ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.9s cubic-bezier(0.22,1,0.36,1), transform 0.9s cubic-bezier(0.22,1,0.36,1)",
            transitionDelay: "480ms",
            margin: "2rem 0",
            width: revealed ? "240px" : "0px",
          }}
        >
          <div className="txuleta-stripe" />
        </div>



        {/* CTA button */}
        <div
          style={{
            opacity: revealed ? 1 : 0,
            transform: revealed ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.9s cubic-bezier(0.22,1,0.36,1), transform 0.9s cubic-bezier(0.22,1,0.36,1)",
            transitionDelay: "640ms",
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

      {/* Made with love footer */}
      <div
        className="absolute bottom-4 left-0 right-0 z-20 flex items-center justify-center gap-2"
        style={{
          opacity: revealed ? 0.5 : 0,
          transition: "opacity 1.2s ease",
          transitionDelay: "1.4s",
        }}
      >
        <span style={{ color: "var(--accent-red)", fontSize: "0.9rem" }}>♥</span>
        <p
          className="label"
          style={{
            color: "var(--gold)",
            fontSize: "0.5rem",
            letterSpacing: "0.12em",
          }}
        >
          MADE WITH LOVE · MAITASUNEZ EGINA
        </p>
        <span style={{ color: "var(--accent-red)", fontSize: "0.9rem" }}>♥</span>
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
