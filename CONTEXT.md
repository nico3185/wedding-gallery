# CONTEXT.md — Galerie Aña & François

> Document de référence du projet. À lire avant de modifier quoi que ce soit.

---

## Qui, quoi, pourquoi

Site de galerie photo & vidéo de mariage pour **Aña et François**, célébrés le **5 mars 2026**, avec leurs deux enfants **Elena et Bixente**.

L'interface est entièrement **bilingue français / euskara (basque)**. Le site est privé : un mot de passe unique est partagé à tous les invités.

Ce site est conçu pour célébrer la vie, la joie d'être ensemble, et garder ces moments accessibles à la famille pour longtemps. Chaque décision de design va dans ce sens : chaleur, présence, lumière dans l'obscurité.

---

## Stack technique

| Couche | Technologie | Pourquoi |
|--------|-------------|----------|
| Framework | **Next.js 14** (App Router) | SSR, API routes, middleware Edge, Image optimization |
| Langage | **TypeScript** | Sûreté des types, meilleure DX |
| Style | **Tailwind CSS** + CSS custom | Utilitaires + design tokens CSS variables |
| Stockage médias | **Cloudflare R2** | Zéro frais d'egress, API S3-compatible, CDN mondial |
| Auth | **iron-session** | Sessions chiffrées côté serveur, cookie signé |
| Lightbox | **yet-another-react-lightbox** | Zoom, téléchargement, vidéo, vignettes |
| Hébergement | **Vercel** | Deploy instantané depuis CLI, edge network |
| Fonts | **Fraunces** (serif) + **Raleway** (sans) | Google Fonts — caractère, chaleur, lisibilité |

---

## Structure des fichiers

```
wedding-gallery/
│
├── .env.example                  ← Template de toutes les variables d'environnement
├── next.config.mjs               ← Config Next.js : domaines R2 autorisés pour next/image
├── tailwind.config.ts            ← Palette de couleurs étendue (bg, gold, amber, ember…)
├── postcss.config.js             ← PostCSS pour Tailwind
├── tsconfig.json                 ← Config TypeScript (paths @/*)
├── vercel.json                   ← Config déploiement Vercel
├── middleware.ts                 ← 🔒 Auth guard (Edge) — redirige vers /login si non authentifié
│
├── app/                          ← Next.js App Router
│   ├── layout.tsx                ← Root layout : <html lang="fr">, metadata, import globals.css
│   ├── globals.css               ← 🎨 Tout le design system CSS (tokens, animations, composants)
│   ├── page.tsx                  ← 🏠 Page d'accueil : hero plein écran + Ken Burns + braises
│   │
│   ├── login/
│   │   └── page.tsx              ← 🔑 Page de connexion : input mot de passe + session cookie
│   │
│   ├── gallery/
│   │   └── page.tsx              ← 🖼️  Page galerie (Server Component, importe GalleryClient)
│   │
│   └── api/
│       ├── login/
│       │   └── route.ts          ← POST /api/login : vérifie le mot de passe, crée la session
│       └── media/
│           └── route.ts          ← GET /api/media?album=xxx : liste les fichiers R2
│
├── components/
│   ├── GalleryClient.tsx         ← 🌟 Composant principal de la galerie (Client Component)
│   │                               Gère : 3 layouts, Live Photos, lightbox, album tabs, scroll reveal
│   └── EmberParticles.tsx        ← ✨ Particules lumineuses animées (braises flottantes)
│
└── lib/
    ├── r2.ts                     ← ☁️  Client Cloudflare R2 : listMedia(), détection paires Live Photo
    ├── session.ts                ← 🍪 Config iron-session : options cookie, type SessionData
    ├── i18n.ts                   ← 🌍 Strings bilingues FR/Euskara + helper t()
    └── useReveal.ts              ← 👁️  Hook IntersectionObserver : scroll reveal sur .reveal
```

---

## Architecture des données

### R2 bucket → structure attendue

```
wedding-media/            ← NEXT_PUBLIC_R2_BUCKET_NAME
├── ceremonie/
│   ├── IMG_0001.jpg      ← photo
│   ├── IMG_0001.mov      ← Live Photo companion (même nom de base, extension .mov)
│   ├── IMG_0002.jpg
│   └── ...
├── cocktail/
├── reception/
└── video/
    └── highlights.mp4
```

- Les **noms de dossier** deviennent des **onglets d'album** dans la galerie.
- Les fichiers à la racine (sans dossier) apparaissent sous l'album `all`.
- Un fichier `.mov` portant le même nom qu'un `.jpg` est automatiquement reconnu comme **Live Photo companion** — il s'anime au survol.
- Les `.mov` companions sont exclus de la liste principale (ils ne comptent pas comme une vidéo séparée).

### Flux de données

```
Navigateur
  │
  ├── GET /              → app/page.tsx (Server)          → Hero + animations
  ├── GET /login         → app/login/page.tsx (Client)    → Formulaire mot de passe
  ├── POST /api/login    → app/api/login/route.ts         → Vérifie mdp, set cookie
  ├── GET /gallery       → app/gallery/page.tsx (Server)  → Shell
  │     └── mount        → GalleryClient.tsx (Client)
  │           └── fetch /api/media                        → Liste R2
  │                 └── lib/r2.ts → ListObjectsV2         → Cloudflare R2
  └── <img src="...">    → Cloudflare R2 (direct, CDN)   → Photos/vidéos
```

---

## Design system

Toutes les valeurs visuelles sont définies dans `app/globals.css` comme variables CSS :

```css
:root {
  --bg:       #130F0A;   /* fond principal : noir brun très chaud */
  --deep:     #0D0A07;   /* fond le plus sombre */
  --surface:  #1E1810;   /* cartes, inputs */
  --surface2: #2A2118;   /* hover states */
  --gold:     #D4922A;   /* or principal : CTA, accents */
  --amber:    #E8B366;   /* ambre : textes secondaires actifs */
  --ember:    #F5C878;   /* braise claire : hover gold */
  --warm:     #F7EDD8;   /* blanc chaud : texte principal */
  --muted:    #7A6A54;   /* gris chaud : texte secondaire */
  --soft:     #4A3C2A;   /* brun doux : bordures, dividers */
}
```

### Typographie

| Classe CSS | Font | Usage |
|------------|------|-------|
| `.display` | Fraunces 300 | Noms, titres majeurs |
| `.display-italic` | Fraunces italic 200 | Sous-titres, "&", citations |
| `.label` | Raleway 300, letterspacing 0.18em, uppercase | Labels, boutons, badges |
| `body` | Raleway 300-400 | Texte courant |

### Animations définies dans globals.css

| Nom | Description | Utilisé sur |
|-----|-------------|-------------|
| `kenBurns` | Zoom lent + dérive sur 20s | Photo hero page d'accueil |
| `floatEmber` | Particule qui monte et disparaît | EmberParticles |
| `shimmer` | Gradient qui traverse le texte | Noms (`.shimmer-text`) |
| `breathe` | Scale + opacité oscillants | Glow halo, caret scroll |
| `lineExpand` | Ligne qui s'étire de gauche à droite | Séparateurs |
| `fadeIn` / `riseIn` / `scaleIn` | Entrées de page | Éléments UI |
| `.reveal` / `.visible` | Scroll reveal via IntersectionObserver | Cards galerie |

---

## Authentification

Le mécanisme est intentionnellement simple :

1. `middleware.ts` s'exécute sur **chaque requête** (Edge Runtime).
2. Si le cookie `w_session` n'existe pas ou n'est pas valide → redirect `/login?from=<chemin>`.
3. La page `/login` envoie le mot de passe en POST à `/api/login`.
4. L'API compare avec `process.env.GALLERY_PASSWORD` (comparaison stricte).
5. Si correct : iron-session crée un cookie signé (HMAC avec `SESSION_SECRET`), durée 14 jours.
6. L'utilisateur est redirigé vers son URL d'origine.

**Chemins publics** (jamais redirigés) : `/login`, `/api/login`, `/_next/*`, `/favicon.ico`.

---

## Variables d'environnement

| Variable | Visibilité | Description |
|----------|-----------|-------------|
| `R2_ACCOUNT_ID` | Serveur | ID de compte Cloudflare |
| `R2_ACCESS_KEY_ID` | Serveur | Clé d'accès API R2 |
| `R2_SECRET_ACCESS_KEY` | Serveur | Secret API R2 |
| `R2_BUCKET_NAME` | Serveur | Nom du bucket (ex: `wedding-media`) |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | Public | URL CDN publique du bucket |
| `GALLERY_PASSWORD` | Serveur | Mot de passe unique partagé aux invités |
| `SESSION_SECRET` | Serveur | Clé HMAC pour signer les cookies (min 32 chars) |
| `NEXT_PUBLIC_PARTNER_A` | Public | Prénom (ex: `Aña`) |
| `NEXT_PUBLIC_PARTNER_B` | Public | Prénom (ex: `François`) |
| `NEXT_PUBLIC_CHILD_A` | Public | Prénom enfant (ex: `Elena`) |
| `NEXT_PUBLIC_CHILD_B` | Public | Prénom enfant (ex: `Bixente`) |
| `NEXT_PUBLIC_WEDDING_DATE` | Public | Date affichée (ex: `5 mars 2026`) |
| `NEXT_PUBLIC_HERO_IMAGE_URL` | Public | URL photo de couverture (optionnel) |

> Les variables préfixées `NEXT_PUBLIC_` sont embarquées dans le bundle JavaScript côté client — ne jamais y mettre de secrets.

---

## Comportement des Live Photos iPhone

La détection est entièrement automatique dans `lib/r2.ts`, fonction `listMedia()` :

1. Tous les objets R2 sont listés en une passe.
2. Pour chaque `.jpg` ou `.heic`, on cherche un `.mov` avec le même nom de base dans le même dossier.
3. Si trouvé → `livePhotoUrl` est attaché à l'item.
4. Les `.mov` companions sont **supprimés de la liste principale** (pour ne pas apparaître en double).
5. Dans `GalleryClient.tsx`, `PhotoCard` détecte `item.livePhotoUrl` et monte un `<video>` invisible.
6. Au **hover (desktop)** ou **touchstart (mobile)**, la vidéo se lance en `opacity: 1`.
7. Un badge `◉ Live` apparaît en bas à gauche.

Pour exporter les Live Photos depuis un Mac : Photos.app → sélectionner → Fichier → Exporter → **"Exporter les photos non modifiées"** → coche "Vidéo Live Photo". Vous obtenez les paires `.HEIC` + `.mov`.

---

## Internationalisation (FR / Euskara)

Toutes les chaînes d'interface sont centralisées dans `lib/i18n.ts` :

```ts
export const i18n = {
  privateGallery: ["Galerie privée", "Galeria pribatua"],
  enterBtn:       ["Entrer",         "Sartu"],
  all:            ["Tout",           "Dena"],
  // ...
}
```

La fonction `t(key)` retourne `"FR · EUK"`. Les composants peuvent aussi accéder directement à `i18n[key][0]` (FR) ou `i18n[key][1]` (EUK) selon le besoin.

---

## Ce que ce site n'est pas

- Pas un CMS : les photos se gèrent directement dans R2 (upload, suppression).
- Pas multi-utilisateur : un seul mot de passe pour tout le monde, pas de comptes.
- Pas de redimensionnement automatique : `next/image` optimise à la volée via Vercel, mais les originaux sont servis depuis R2.
- Pas de commentaires, likes, ou interactions sociales.

---

## Pour modifier le site plus tard

| Ce que vous voulez changer | Fichier à modifier |
|----------------------------|--------------------|
| Couleurs | `app/globals.css` → section `:root` |
| Noms / date affichés | `.env.local` (ou variables Vercel) |
| Photo de couverture | `NEXT_PUBLIC_HERO_IMAGE_URL` dans `.env` |
| Textes de l'interface | `lib/i18n.ts` |
| Durée de session | `lib/session.ts` → `maxAge` |
| Ajouter des photos | Upload dans R2 via rclone ou interface web |
| Renommer un album | Renommer le dossier dans R2 (ou déplacer les fichiers) |
| Ajouter un domaine | Vercel Dashboard → Settings → Domains |

---

*Fait avec amour · Maitasunez egina* 🤍
