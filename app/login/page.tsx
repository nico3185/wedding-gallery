"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EmberParticles from "@/components/EmberParticles";

function LoginForm() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const rawFrom = params.get("from") ?? "/";
  // ensure the redirect stays within the app
  const from = rawFrom.startsWith("/") && !rawFrom.startsWith("//") ? rawFrom : "/";

  async function submit() {
    if (!pw) return;
    setLoading(true); setErr(false);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    setLoading(false);
    if (res.ok) router.push(from);
    else setErr(true);
  }

  return (
    <main className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "var(--bg)" }}>
      <EmberParticles />
      <div className="glow-halo" />
      <div className="absolute top-0 left-0 right-0 h-px"
           style={{ background: "linear-gradient(to right, transparent, var(--gold), transparent)" }} />
      <div className="relative z-10 text-center px-6 w-full max-w-xs">
        <p className="anim-fade label mb-6" style={{ color: "var(--muted)" }}>
          Galerie privée · Galeria pribatua
        </p>
        <h1 className="anim-rise d1 display shimmer-text" style={{ fontSize: "clamp(3.2rem, 14vw, 5rem)" }}>Aña</h1>
        <p className="anim-rise d1 display-italic" style={{ fontSize: "clamp(1.2rem, 5vw, 1.8rem)", color: "var(--soft)", margin: "2px 0" }}>&amp;</p>
        <h1 className="anim-rise d2 display shimmer-text" style={{ fontSize: "clamp(3.2rem, 14vw, 5rem)" }}>François</h1>
        <p className="anim-rise d3 display-italic mt-3" style={{ color: "var(--muted)", fontSize: "0.9rem", letterSpacing: "0.08em" }}>
          5 mars 2026 · 2026ko martxoaren 5a
        </p>
        <div className="anim-fade d4 ember-line my-8" />
        <div className="anim-rise d4 space-y-3">
          <input
            type="password"
            autoComplete="current-password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Mot de passe · Pasahitza"
            className="w-full px-5 py-4 text-center text-sm outline-none transition-all"
            style={{ background: "var(--surface)", border: `1px solid ${err ? "#C07040" : "var(--soft)"}`, color: "var(--warm)", borderRadius: "2px", fontFamily: "var(--r)", letterSpacing: "0.1em" }}
            onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
            onBlur={(e) => (e.target.style.borderColor = err ? "#C07040" : "var(--soft)")}
          />
          {err && <p className="label text-center" style={{ color: "#D07040" }}>Mot de passe incorrect · Pasahitz okerra</p>}
          <button onClick={submit} disabled={loading || !pw}
            className="w-full py-4 label transition-all disabled:opacity-30"
            style={{ background: "var(--gold)", color: "var(--deep)", borderRadius: "2px" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ember)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--gold)")}>
            {loading ? "···" : "Entrer · Sartu"}
          </button>
        </div>
        <p className="anim-fade d5 mt-10 display-italic" style={{ color: "var(--soft)", fontSize: "0.85rem" }}>Elena &amp; Bixente</p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
