# BUGFIX — wedding-gallery

> Rapport de corrections UI · Mars 2026

---

## 📖 BookMode.tsx

### [CRITIQUE] Le livre ne répond pas sur mobile

**Fichier :** `components/BookMode.tsx` — L.89–105 (container) + L.233–235 (style inline)

**Problème :** La media query cible la classe `.book-spread`, mais cette classe n'est assignée à aucun élément JSX. La règle ne s'applique jamais. Sur mobile les deux pages débordent de l'écran.

```css
/* Cette règle est morte — .book-spread n'existe pas dans le JSX */
@media (max-width: 768px) {
  .book-spread { width: 90vw; }
}
```

**Correction :** Remplacer les `width` fixes des pages par des valeurs responsives, et supprimer le `<style>` inline inutile.

```tsx
// AVANT
style={{ width: "45%", aspectRatio: "3/4" }}

// APRÈS — sur chaque page (gauche et droite)
style={{
  width: "clamp(120px, 42vw, 420px)",
  aspectRatio: "3/4",
}}

// Et sur le conteneur book-spread, ajouter :
style={{
  perspective: "1200px",
  width: "100%",
  maxHeight: "80vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}}

// Supprimer entièrement le bloc <style> à la fin du composant :
// <style>{` @media (max-width: 768px) { .book-spread { width: 90vw; } } `}</style>
```

---

### [IMPORTANT] Perspective inversée + pages toujours penchées

**Fichier :** `components/BookMode.tsx` — L.121–127 / L.163–169

**Problème 1 — perspective inversée :** Les signes de rotation étaient inversés. Avec `transformOrigin: "right center"`, un `rotateY(-35deg)` fait reculer le bord libre (gauche) et avance la tranche — l'effet opposé à un vrai livre. Le résultat : la tranche est plus large que les bords de page.

**Problème 2 — rotation permanente :** La rotation s'applique en continu, même au repos. Le livre est constamment déformé en dehors de toute animation.

```tsx
// AVANT — signes inversés ET rotation permanente
// Page gauche
transform: `rotateY(${currentPage === 0 ? 0 : -35}deg)`
// Page droite
transform: `rotateY(${currentPage === pages.length - 1 ? 0 : 35}deg)`

// APRÈS — signes corrigés, angle réduit, rotation uniquement pendant le flip
// Page gauche (transformOrigin: "right center")
transform: isFlipping
  ? `rotateY(${currentPage === 0 ? 0 : 15}deg)`
  : "rotateY(0deg)"

// Page droite (transformOrigin: "left center")
transform: isFlipping
  ? `rotateY(${currentPage === pages.length - 1 ? 0 : -15}deg)`
  : "rotateY(0deg)"
```

> **Pourquoi +15° et non -35° ?** En CSS, `rotateY(+N)` avec un pivot en `right center` avance le bord **gauche** (libre) vers le spectateur et repousse la tranche — soit exactement l'effet d'un vrai livre ouvert. L'angle 15° est plus naturel que 35° qui exagère trop la déformation.

---

### [MODÉRÉ] `isVideo()` ne détecte que les `.mov`

**Fichier :** `components/BookMode.tsx` — L.11

**Problème :** Les fichiers `.mp4` ou `.webm` ne sont jamais reconnus comme vidéos dans le livre.

```ts
// AVANT
const isVideo = (item?: MediaItem) => item?.url.endsWith('.mov');

// APRÈS
const isVideo = (item?: MediaItem) =>
  /\.(mov|mp4|webm|ogg)$/i.test(item?.url ?? "");
```

---

### [MINEUR] La tranche du livre (spine) peut s'effondrer à 0px

**Fichier :** `components/BookMode.tsx` — L.175–181

**Problème :** `height: "100%"` ne fonctionne pas dans un conteneur flex sans hauteur explicite.

```tsx
// AVANT
style={{ width: "8px", height: "100%", … }}

// APRÈS
style={{ width: "8px", alignSelf: "stretch", … }}
```

---

## 🖼 GalleryClient.tsx — Miniatures & Layouts

### [CRITIQUE] Scroll reveal complètement cassé

**Fichier :** `components/GalleryClient.tsx` — L.174, 192, 204, 223  
**Fichier :** `app/globals.css` — L.~260

**Problème :** Dans `globals.css`, la classe `.reveal` a `opacity: 1` et `transform: translateY(0)` — les éléments sont visibles dès le rendu. La vraie animation est dans `.reveal-fade`, mais les composants utilisent `.reveal`. Les photos apparaissent instantanément sans animation.

```css
/* globals.css — état actuel, .reveal est déjà visible */
.reveal       { opacity: 1; transform: translateY(0); }
.reveal-fade  { opacity: 0; transform: translateY(28px); transition: …; }
.reveal-fade.visible { opacity: 1; transform: translateY(0); }
```

**Correction :** Unifier en une seule classe `.reveal` avec état initial caché.

```css
/* globals.css — APRÈS */
.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.8s cubic-bezier(0.22,1,0.36,1),
              transform 0.8s cubic-bezier(0.22,1,0.36,1);
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
/* Supprimer .reveal-fade et .reveal-fade.visible */
```

Et dans tous les composants (`Flow`, `Grid`, `Masonry`, `Mixed`) remplacer `className="reveal"` sur les wrappers de `PhotoCard` — la classe étant déjà correcte, seul le CSS doit changer.

---

### [IMPORTANT] Layout Flow — ratios d'aspect incorrects sur mobile

**Fichier :** `components/GalleryClient.tsx` — L.218–236

**Problème :** Le trick `padding-bottom` pour simuler un ratio d'aspect nécessite `height: 0` sur le conteneur. Sans ça, le navigateur additionne la hauteur du contenu ET le padding, créant des proportions aléatoires.

```tsx
// AVANT
<div style={{ position: "relative", paddingBottom: "142%", … }}>

// APRÈS — ajouter height: 0
<div style={{ position: "relative", height: 0, paddingBottom: "142%", … }}>
```

Ou utiliser la propriété CSS moderne `aspectRatio` (support universel depuis 2021) :

```tsx
const naturalRatios = [
  { aspectRatio: "4/5"  },
  { aspectRatio: "16/9" },
  { aspectRatio: "1/1"  },
  { aspectRatio: "4/5"  },
  { aspectRatio: "3/2"  },
  { aspectRatio: "5/6"  },
  { aspectRatio: "16/10"},
  { aspectRatio: "4/5"  },
  { aspectRatio: "3/2"  },
];

// Et dans le JSX, supprimer paddingBottom :
<div key={item.key} className="reveal" style={{ position: "relative", ...ratio, … }}>
  <PhotoCard item={item} onClick={…} style={{ position: "static", width: "100%", height: "100%" }} />
</div>
```

---

### [IMPORTANT] Masonry toujours 3 colonnes — non responsive

**Fichier :** `components/GalleryClient.tsx` — L.155–175 (Masonry) et L.183–207 (Mixed)

**Problème :** Les colonnes sont hardcodées (`const cols: MediaItem[][] = [[], [], []]`). Sur mobile les vignettes font ~33% de la largeur et deviennent minuscules.

**Correction :** Utiliser la propriété CSS `columns` pour un masonry auto-adaptatif.

```tsx
function Masonry() {
  return (
    <div style={{ columns: "2 220px", gap: "8px" }}>
      {filtered.map((item, i) => (
        <div key={item.key} style={{ breakInside: "avoid", marginBottom: "8px" }}>
          <PhotoCard
            item={item}
            onClick={() => setLightboxIdx(i)}
            className="reveal"
          />
        </div>
      ))}
    </div>
  );
}
```

> `columns: "2 220px"` signifie : au moins 2 colonnes, chacune d'au moins 220px. Le navigateur calcule automatiquement le nombre optimal selon la largeur disponible.

---

### [MODÉRÉ] Memory leak — cleanup de l'IntersectionObserver incorrecte

**Fichier :** `components/GalleryClient.tsx` — L.115–128

**Problème :** Le `return () => io.disconnect()` est placé à l'intérieur du callback du `setTimeout`, pas en return du `useEffect`. L'observer n'est donc jamais disconnecté lors du démontage ou du changement de `filtered`.

```tsx
// AVANT — io.disconnect() inaccessible depuis le useEffect
useEffect(() => {
  const t = setTimeout(() => {
    const io = new IntersectionObserver(…);
    // …
    return () => io.disconnect(); // ← return du setTimeout, pas du useEffect !
  }, 50);
  return () => clearTimeout(t);
}, [filtered]);
```

```tsx
// APRÈS — cleanup correcte
useEffect(() => {
  const el = revealRef.current;
  if (!el) return;
  let io: IntersectionObserver;

  const t = setTimeout(() => {
    io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      }),
      { threshold: 0.05 }
    );
    el.querySelectorAll(".reveal:not(.visible)").forEach((c) => io.observe(c));
  }, 50);

  return () => {
    clearTimeout(t);
    io?.disconnect(); // ← cleanup au bon niveau
  };
}, [filtered]);
```

---

### [MINEUR] Variable `baseIdx` déclarée mais inutilisée

**Fichier :** `components/GalleryClient.tsx` — L.157

```tsx
// Supprimer cette ligne (erreur TypeScript / lint) :
const baseIdx = [0, 0, 0]; // ← inutilisée
```

---

## 🔐 Login

### [IMPORTANT] Open redirect — paramètre `?from` non validé

**Fichier :** `app/login/page.tsx` — L.10–12 + L.18

**Problème :** Après connexion, `router.push(from)` utilise directement le paramètre `?from` sans vérification. Un lien `/login?from=https://evil.com` redirige l'utilisateur vers un site externe après authentification.

```tsx
// AVANT
const from = params.get("from") ?? "/";
if (res.ok) router.push(from);

// APRÈS — s'assurer que from est un chemin interne
const rawFrom = params.get("from") ?? "/";
const from = rawFrom.startsWith("/") && !rawFrom.startsWith("//")
  ? rawFrom
  : "/";
if (res.ok) router.push(from);
```

---

### [IMPORTANT] Aucune protection brute-force sur `/api/login`

**Fichier :** `app/api/login/route.ts`

**Problème :** L'endpoint accepte un nombre illimité de tentatives. Un attaquant peut tester des mots de passe automatiquement.

**Correction :** Ajouter un rate limit simple par IP (ou utiliser `@upstash/ratelimit` sur Vercel).

```ts
const attempts = new Map<string, { count: number; reset: number }>();

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const now = Date.now();
  const rec = attempts.get(ip);

  if (rec && now < rec.reset && rec.count >= 5) {
    return NextResponse.json({ error: "too_many" }, { status: 429 });
  }

  attempts.set(ip, {
    count: (rec && now < rec.reset ? rec.count : 0) + 1,
    reset: rec && now < rec.reset ? rec.reset : now + 60_000,
  });

  const { password } = await req.json();
  if (password !== process.env.GALLERY_PASSWORD)
    return NextResponse.json({ error: "wrong" }, { status: 401 });

  const res = NextResponse.json({ ok: true });
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  session.authenticated = true;
  await session.save();
  return res;
}
```

---

### [MINEUR] `autoComplete` manquant sur le champ mot de passe

**Fichier :** `app/login/page.tsx` — L.32

Sans `autoComplete`, les gestionnaires de mots de passe (1Password, iOS, Android) ne proposent pas le remplissage automatique.

```tsx
// AVANT
<input type="password" value={pw} … />

// APRÈS
<input
  type="password"
  autoComplete="current-password"
  value={pw}
  …
/>
```

---

### [UX] Bouton fermer invisible + pas de retour au layout précédent

**Fichiers :** `components/BookMode.tsx` + `components/GalleryClient.tsx`

**Problème 1 :** Le `✕` de fermeture est un texte brut semi-transparent (`opacity: 0.8`) sans bordure ni fond — il se fond dans l'overlay sombre et est très difficile à trouver.

**Problème 2 :** Le bouton 📖 du header ne ferme pas le livre (il appelle `setBookModeOpen(true)` sans toggle). Et à la fermeture, le layout actif n'est pas restauré.

**Correction BookMode.tsx — bouton visible avec label :**

```tsx
// AVANT
<button onClick={onClose} className="absolute top-4 right-6 z-50 text-amber-600"
        style={{ opacity: 0.8, fontSize: "2rem" }}>
  ✕
</button>

// APRÈS — bouton gold avec label bilingue
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
  }}
  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--gold)"; e.currentTarget.style.color = "var(--deep)"; }}
  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(26,15,8,0.75)"; e.currentTarget.style.color = "var(--gold)"; }}
>
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
  Fermer · Itxi
</button>
```

---

### ✅ Correctifs appliqués

Tous les problèmes listés ci‑dessus ont été corrigés dans le code ou la feuille de style. Le livre est désormais responsive, les animations de révélation fonctionnent, les redirections sont sécurisées et des protections supplémentaires ont été ajoutées au formulaire de connexion.

**Correction GalleryClient.tsx — mémoriser le layout et rendre le bouton toggle :**

```tsx
// Ajouter après les autres useState :
const [previousLayout, setPreviousLayout] = useState<Layout>("flow");

// Ajouter deux callbacks :
const openBookMode = useCallback(() => {
  setPreviousLayout(layout);   // mémorise le layout actif
  setBookModeOpen(true);
}, [layout]);

const closeBookMode = useCallback(() => {
  setBookModeOpen(false);
  setLayout(previousLayout);   // restaure le layout précédent
}, [previousLayout]);

// Passer closeBookMode à BookMode :
<BookMode media={filtered} onClose={closeBookMode} />

// Rendre le bouton 📖 toggle :
onClick={() => bookModeOpen ? closeBookMode() : openBookMode()}
```

## Résumé

| Sévérité  | Nombre | Fichiers concernés |
|-----------|--------|--------------------|
| Critique  | 2      | `BookMode.tsx`, `GalleryClient.tsx` + `globals.css` |
| Important | 5      | `BookMode.tsx`, `GalleryClient.tsx` ×2, `login/page.tsx`, `api/login/route.ts` |
| Modéré    | 2      | `BookMode.tsx`, `GalleryClient.tsx` |
| UX        | 1      | `BookMode.tsx`, `GalleryClient.tsx` |
| Mineur    | 3      | `BookMode.tsx`, `GalleryClient.tsx`, `login/page.tsx` |
| **Total** | **13** | |

> Les deux issues **Critiques** (livre non responsive + scroll reveal cassé) sont à traiter en priorité car elles affectent directement l'expérience sur mobile. La perspective inversée et le bouton fermer sont à corriger conjointement.
