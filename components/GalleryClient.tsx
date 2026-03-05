"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import VideoPlugin from "yet-another-react-lightbox/plugins/video";
import Download from "yet-another-react-lightbox/plugins/download";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import type { MediaItem } from "@/lib/r2";
import { useReveal } from "@/lib/useReveal";

// ─── Live Photo card ──────────────────────────────────────────────────────────
function PhotoCard({
  item,
  onClick,
  className = "",
  style = {},
}: {
  item: MediaItem;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [liveActive, setLiveActive] = useState(false);

  const activateLive = useCallback(() => {
    if (!item.livePhotoUrl) return;
    setLiveActive(true);
    const v = videoRef.current;
    if (v) { v.currentTime = 0; v.play().catch(() => {}); }
  }, [item.livePhotoUrl]);

  const deactivateLive = useCallback(() => {
    setLiveActive(false);
    const v = videoRef.current;
    if (v) { v.pause(); v.currentTime = 0; }
  }, []);

  if (item.type === "video") {
    return (
      <div
        className={`photo-card reveal ${className}`}
        style={style}
        onClick={onClick}
      >
        <video
          src={item.url}
          className="w-full h-full object-cover opacity-70"
          muted playsInline
          style={{ height: "100%", width: "100%" }}
        />
        <div className="play-btn">
          <div className="play-circle">
            <svg width="16" height="16" viewBox="0 0 24 24" style={{ marginLeft: 2 }}>
              <path d="M8 5v14l11-7z" fill="var(--deep)" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`photo-card reveal ${className}`}
      style={style}
      onClick={onClick}
      onMouseEnter={activateLive}
      onMouseLeave={deactivateLive}
      onTouchStart={activateLive}
      onTouchEnd={deactivateLive}
    >
      <Image
        src={item.url}
        alt=""
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover"
        loading="lazy"
      />
      {item.livePhotoUrl && (
        <>
          <video
            ref={videoRef}
            src={item.livePhotoUrl}
            className="live-video"
            muted playsInline loop
            preload="none"
          />
          <span className="live-badge">
            ◉ Live
          </span>
        </>
      )}
    </div>
  );
}

// ─── Aspect ratios for mixed layout ───────────────────────────────────────────
const RATIOS = [
  { paddingBottom: "125%" }, // 4:5
  { paddingBottom: "100%" }, // square
  { paddingBottom: "133%" }, // 3:4
  { paddingBottom: "75%"  }, // 4:3 landscape
  { paddingBottom: "133%" }, // 3:4
  { paddingBottom: "100%" }, // square
];

type Layout = "masonry" | "mixed" | "grid";

// ─── Main gallery ─────────────────────────────────────────────────────────────
export default function GalleryClient() {
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);
  const [albums, setAlbums] = useState<string[]>(["all"]);
  const [activeAlbum, setActiveAlbum] = useState("all");
  const [layout, setLayout] = useState<Layout>("mixed");
  const [lightboxIdx, setLightboxIdx] = useState(-1);
  const [loading, setLoading] = useState(true);
  const revealRef = useReveal();

  useEffect(() => {
    fetch("/api/media")
      .then((r) => r.json())
      .then(({ media }: { media: MediaItem[] }) => {
        setAllMedia(media);
        const unique = ["all", ...new Set(media.map((m) => m.album))];
        setAlbums(unique);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const filtered = activeAlbum === "all"
    ? allMedia
    : allMedia.filter((m) => m.album === activeAlbum);

  // Re-trigger reveal when filtered changes
  useEffect(() => {
    const el = revealRef.current;
    if (!el) return;
    // Small timeout to let DOM update
    const t = setTimeout(() => {
      const io = new IntersectionObserver(
        (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } }),
        { threshold: 0.05 }
      );
      el.querySelectorAll(".reveal:not(.visible)").forEach((c) => io.observe(c));
      return () => io.disconnect();
    }, 50);
    return () => clearTimeout(t);
  }, [filtered]);

  const slides = filtered.map((item) =>
    item.type === "video"
      ? { type: "video" as const, sources: [{ src: item.url, type: "video/mp4" }] }
      : { src: item.url, download: item.url }
  );

  // ─── Masonry ────────────────────────────────────────────────────────────────
  function Masonry() {
    const cols: MediaItem[][] = [[], [], []];
    filtered.forEach((item, i) => cols[i % 3].push(item));
    const baseIdx = [0, 0, 0];

    return (
      <div className="masonry">
        {cols.map((col, ci) => (
          <div key={ci} className="masonry-col">
            {col.map((item, ri) => {
              const gi = ci + ri * 3;
              const ratio = RATIOS[gi % RATIOS.length];
              return (
                <div key={item.key} className="relative" style={{ paddingBottom: ratio.paddingBottom }}>
                  <PhotoCard
                    item={item}
                    onClick={() => setLightboxIdx(gi)}
                    className="absolute inset-0"
                    style={{ transitionDelay: `${(ri % 4) * 60}ms` }}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  // ─── Mixed: masonry top, uniform grid bottom ────────────────────────────────
  function Mixed() {
    const masonry = filtered.slice(0, 9);
    const grid = filtered.slice(9);
    const mCols: MediaItem[][] = [[], [], []];
    masonry.forEach((item, i) => mCols[i % 3].push(item));

    return (
      <div className="space-y-2">
        <div className="masonry">
          {mCols.map((col, ci) => (
            <div key={ci} className="masonry-col">
              {col.map((item, ri) => {
                const gi = ci + ri * 3;
                const ratio = RATIOS[gi % RATIOS.length];
                return (
                  <div key={item.key} className="relative" style={{ paddingBottom: ratio.paddingBottom }}>
                    <PhotoCard
                      item={item}
                      onClick={() => setLightboxIdx(gi)}
                      className="absolute inset-0"
                      style={{ transitionDelay: `${ri * 80}ms` }}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {grid.length > 0 && (
          <>
            <div className="ember-line my-6" />
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {grid.map((item, i) => (
                <div key={item.key} className="relative" style={{ paddingBottom: "100%" }}>
                  <PhotoCard
                    item={item}
                    onClick={() => setLightboxIdx(9 + i)}
                    className="absolute inset-0"
                    style={{ transitionDelay: `${(i % 5) * 50}ms` }}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // ─── Uniform grid ───────────────────────────────────────────────────────────
  function Grid() {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {filtered.map((item, i) => (
          <div key={item.key} className="relative" style={{ paddingBottom: "100%" }}>
            <PhotoCard
              item={item}
              onClick={() => setLightboxIdx(i)}
              className="absolute inset-0"
              style={{ transitionDelay: `${(i % 4) * 50}ms` }}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100dvh" }}>
      {/* ─── Sticky header ──────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 safe-top"
        style={{
          background: "rgba(19,15,10,0.88)",
          borderBottom: "1px solid var(--soft)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <a href="/" className="display shimmer-text flex-shrink-0"
             style={{ fontSize: "clamp(1.1rem, 3vw, 1.5rem)" }}>
            Aña <span style={{ fontStyle: "italic", color: "var(--soft)" }}>&</span> François
          </a>

          {/* Layout toggle */}
          <div className="flex gap-0 rounded-sm overflow-hidden"
               style={{ border: "1px solid var(--soft)" }}>
            {(["masonry", "mixed", "grid"] as Layout[]).map((m) => (
              <button key={m} onClick={() => setLayout(m)} className={`layout-btn ${layout === m ? "active" : ""}`}>
                {m === "masonry" ? "≋" : m === "mixed" ? "⊞" : "⊡"}
              </button>
            ))}
          </div>
        </div>

        {/* Album tabs */}
        {albums.length > 2 && (
          <div className="max-w-screen-xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto"
               style={{ scrollbarWidth: "none" }}>
            {albums.map((a) => (
              <button key={a} onClick={() => setActiveAlbum(a)}
                      className={`album-tab ${activeAlbum === a ? "active" : ""}`}>
                {a === "all" ? "Tout · Dena" : a}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ─── Gallery ────────────────────────────────────────────────────────── */}
      <main className="max-w-screen-xl mx-auto px-3 py-6" ref={revealRef}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-5">
            <div className="w-8 h-8 rounded-full border-t-2 border-r-2 animate-spin"
                 style={{ borderColor: "var(--gold)" }} />
            <p className="label" style={{ color: "var(--muted)" }}>
              Chargement… · Kargatzen…
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 gap-3">
            <p className="display-italic text-2xl" style={{ color: "var(--muted)" }}>
              Aucune photo encore
            </p>
            <p className="label" style={{ color: "var(--soft)" }}>
              Argazkirik oraindik ez
            </p>
          </div>
        ) : (
          <>
            {/* Count */}
            <div className="flex items-center gap-4 mb-4">
              <p className="label" style={{ color: "var(--muted)" }}>
                {filtered.length} {filtered.length === 1 ? "moment · une" : "moments · uneak"}
                {activeAlbum !== "all" && ` · ${activeAlbum}`}
              </p>
              {filtered.some((m) => m.livePhotoUrl) && (
                <span className="label" style={{ color: "var(--gold)", fontSize: "0.55rem" }}>
                  ◉ Live Photos
                </span>
              )}
            </div>

            {layout === "mixed"   && <Mixed />}
            {layout === "masonry" && <Masonry />}
            {layout === "grid"    && <Grid />}
          </>
        )}
      </main>

      {/* ─── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="py-12 text-center safe-bottom"
              style={{ borderTop: "1px solid var(--soft)" }}>
        <p className="display-italic" style={{ color: "var(--muted)", fontSize: "1.1rem" }}>
          Aña &amp; François
        </p>
        <p className="label mt-2" style={{ color: "var(--soft)", fontSize: "0.55rem" }}>
          Elena &amp; Bixente · 5 mars 2026
        </p>
      </footer>

      {/* ─── Lightbox ───────────────────────────────────────────────────────── */}
      <Lightbox
        open={lightboxIdx >= 0}
        close={() => setLightboxIdx(-1)}
        index={lightboxIdx}
        slides={slides}
        plugins={[VideoPlugin, Download, Zoom, Counter, Thumbnails]}
        styles={{
          container: { background: "rgba(10,8,5,0.97)" },
          thumbnailsContainer: { background: "rgba(13,10,7,0.9)" },
          root: {
            "--yarl__color_button": "var(--amber)",
            "--yarl__color_button_active": "var(--ember)",
          } as any,
        }}
      />
    </div>
  );
}
