/**
 * Book Mode - Page-turning gallery with 3D book effect
 * Inspired by physical wedding albums with paper texture
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import type { MediaItem } from "@/lib/r2";

// Helper to check if a media item is a video
const isVideo = (item?: MediaItem) => item?.url.endsWith('.mov');

// Reorganize media to prevent consecutive videos on the same spread
const organizePagesLogically = (items: MediaItem[]) => {
  const pages: { left?: MediaItem; right?: MediaItem }[] = [];
  const used = new Set<number>();
  let videoCount = items.filter(item => isVideo(item)).length;
  
  let leftIdx = 0;
  while (leftIdx < items.length || used.size < items.length) {
    // Skip already used items
    while (leftIdx < items.length && used.has(leftIdx)) leftIdx++;
    
    const newPage: { left?: MediaItem; right?: MediaItem } = {};
    
    if (leftIdx < items.length) {
      newPage.left = items[leftIdx];
      used.add(leftIdx);
      
      // Find a right page that won't create two consecutive videos
      let rightIdx = leftIdx + 1;
      while (rightIdx < items.length) {
        if (!used.has(rightIdx)) {
          const leftIsVideo = isVideo(newPage.left);
          const rightIsVideo = isVideo(items[rightIdx]);
          
          // Avoid video+video on same spread
          if (!(leftIsVideo && rightIsVideo)) {
            newPage.right = items[rightIdx];
            used.add(rightIdx);
            break;
          }
        }
        rightIdx++;
      }
    }
    
    if (newPage.left || newPage.right) {
      pages.push(newPage);
    } else {
      break;
    }
  }
  
  return pages;
};

export function BookMode({
  media,
  onClose,
}: {
  media: MediaItem[];
  onClose: () => void;
}) {
  const [pages, setPages] = useState<{ left?: MediaItem; right?: MediaItem }[]>(() => 
    organizePagesLogically(media)
  );

  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  const goToNextPage = useCallback(() => {
    if (currentPage < pages.length - 1 && !isFlipping) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(cp => cp + 1);
        setIsFlipping(false);
      }, 400);
    }
  }, [currentPage, pages.length, isFlipping]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 0 && !isFlipping) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(cp => cp - 1);
        setIsFlipping(false);
      }, 400);
    }
  }, [currentPage, isFlipping]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") goToPrevPage();
      if (e.key === "ArrowRight" || e.key === "d") goToNextPage();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNextPage, goToPrevPage, onClose]);

  const page = pages[currentPage];

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center"
      style={{
        background: "linear-gradient(135deg, rgba(26,15,8,0.95) 0%, rgba(43,31,21,0.95) 100%)",
        backdropFilter: "blur(8px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Paper grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`,
          backgroundSize: "300px",
          opacity: 0.5,
          zIndex: 1,
        }}
      />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-6 z-50 label flex items-center gap-2 transition-all"
        style={{
          background: "rgba(26,15,8,0.75)",
          border: "1px solid var(--gold)",
          color: "var(--gold)",
          padding: "8px 16px",
          borderRadius: "2px",
          backdropFilter: "blur(8px)",
          cursor: "pointer",
          letterSpacing: "0.14em",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--gold)";
          e.currentTarget.style.color = "var(--deep)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(26,15,8,0.75)";
          e.currentTarget.style.color = "var(--gold)";
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
          <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        Fermer · Itxi
      </button>

      {/* Book container */}
      <div className="relative z-10 w-full max-w-5xl h-full max-h-screen flex items-center justify-center p-4">
        {/* Book spread */}
        <div
          className="relative"
          style={{
            perspective: "1200px",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Left page */}
          <div
            className="relative"
            style={{
              width: "45%",
              aspectRatio: "3/4",
              transformStyle: "preserve-3d",
              transform: `rotateY(${currentPage === 0 ? 0 : 15}deg)`,
              transition: isFlipping ? "transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)" : "none",
              transformOrigin: "right center",
              background: "linear-gradient(to right, #d9cfc0 0%, #e8ddd0 100%)",
              boxShadow: "-20px 20px 60px rgba(0,0,0,0.5)",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            {page?.left && (
              <>
                {isVideo(page.left) ? (
                  <video
                    src={page.left.url}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    src={page.left.url}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                )}
                {/* Video indicator for Live Photos */}
                {isVideo(page.left) && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "12px",
                      right: "12px",
                      background: "rgba(0,0,0,0.6)",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "500",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      zIndex: 10,
                    }}
                  >
                    <span style={{ fontSize: "14px" }}>▶</span> Animée
                  </div>
                )}
              </>
            )}
            {!page?.left && (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background:
                    "linear-gradient(135deg, rgba(212,146,42,0.1) 0%, transparent 100%)",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  padding: "2rem",
                  textAlign: "center",
                  color: "#8B7D6B",
                  fontStyle: "italic",
                }}
              >
                <p style={{ fontSize: "0.9rem" }}>Couverture · Azala</p>
              </div>
            )}
          </div>

          {/* Spine / Gutter */}
          <div
            style={{
              width: "8px",
              height: "100%",
              background: "linear-gradient(90deg, rgba(0,0,0,0.3), transparent, rgba(0,0,0,0.3))",
              flexShrink: 0,
            }}
          />

          {/* Right page */}
          <div
            className="relative"
            style={{
              width: "45%",
              aspectRatio: "3/4",
              transformStyle: "preserve-3d",
              transform: `rotateY(${currentPage === pages.length - 1 ? 0 : -15}deg)`,
              transition: isFlipping ? "transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)" : "none",
              transformOrigin: "left center",
              background: "linear-gradient(to right, #e8ddd0 0%, #d9cfc0 100%)",
              boxShadow: "20px 20px 60px rgba(0,0,0,0.5)",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            {page?.right && (
              <>
                {isVideo(page.right) ? (
                  <video
                    src={page.right.url}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    src={page.right.url}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                )}
                {/* Video indicator for Live Photos */}
                {isVideo(page.right) && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "12px",
                      right: "12px",
                      background: "rgba(0,0,0,0.6)",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "500",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      zIndex: 10,
                    }}
                  >
                    <span style={{ fontSize: "14px" }}>▶</span> Animée
                  </div>
                )}
              </>
            )}
            {!page?.right && (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background:
                    "linear-gradient(135deg, transparent 0%, rgba(212,146,42,0.1) 100%)",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  padding: "2rem",
                  textAlign: "center",
                  color: "#8B7D6B",
                  fontStyle: "italic",
                }}
              >
                <p style={{ fontSize: "0.9rem" }}>Fin · Amaiera</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex items-center justify-center gap-6">
        {/* Previous button */}
        <button
          onClick={goToPrevPage}
          disabled={currentPage === 0 || isFlipping}
          className="label px-6 py-2 transition-all"
          style={{
            border: "1px solid var(--gold)",
            color: currentPage === 0 ? "var(--soft)" : "var(--gold)",
            background: "transparent",
            opacity: currentPage === 0 ? 0.5 : 1,
            cursor: currentPage === 0 ? "not-allowed" : "pointer",
          }}
        >
          ← Retour · Atzera
        </button>

        {/* Page counter */}
        <div
          className="label"
          style={{ color: "var(--gold)", fontSize: "0.7rem", letterSpacing: "0.2em" }}
        >
          {currentPage + 1} / {pages.length}
        </div>

        {/* Next button */}
        <button
          onClick={goToNextPage}
          disabled={currentPage === pages.length - 1 || isFlipping}
          className="label px-6 py-2 transition-all"
          style={{
            border: "1px solid var(--gold)",
            color: currentPage === pages.length - 1 ? "var(--soft)" : "var(--gold)",
            background: "transparent",
            opacity: currentPage === pages.length - 1 ? 0.5 : 1,
            cursor: currentPage === pages.length - 1 ? "not-allowed" : "pointer",
          }}
        >
          Suivant · Hurrena →
        </button>
      </div>

      {/* Keyboard navigation */}
      <style>{`
        @media (max-width: 768px) {
          .book-spread { width: 90vw; }
        }
      `}</style>
    </div>
  );
}
