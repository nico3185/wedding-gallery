# Aña & François · Galerie de mariage

**5 mars 2026 · Elena & Bixente**

Stack : **Next.js 14 · Cloudflare R2 · Vercel · TypeScript · Tailwind CSS**

---

## Fonctionnalités

- **Dark mode chaud** — palette braise et ambre, particules lumineuses animées
- **Live Photos iPhone** — les photos s'animent au survol si une vidéo `.mov` accompagnatrice existe dans R2
- **Protection par mot de passe** — session chiffrée 14 jours (iron-session)
- **3 modes de galerie** — mosaïque / mixte / grille, toggle en haut
- **Onglets albums** — auto-détectés depuis les dossiers R2
- **Lightbox complet** — zoom, téléchargement, vidéo, film de vignettes
- **Bilingue** — Français + Euskara dans toute l'interface
- **Zéro frais d'egress** — R2 sert les médias directement
- **iOS / Android / Desktop** — responsive, safe-area iOS respectée

---

## Structure du bucket R2

Organisez vos fichiers ainsi — les albums sont détectés automatiquement :

```
wedding-media/             ← votre bucket R2
├── ceremonie/
│   ├── IMG_0001.jpg
│   ├── IMG_0001.mov       ← Live Photo companion (même nom, .mov)
│   ├── IMG_0002.jpg
│   └── ...
├── cocktail/
│   └── ...
├── reception/
│   └── ...
└── video/
    └── highlights.mp4
```

> **Live Photos iPhone** : exportez depuis Photos.app → Fichier → Exporter → "Exporter les photos non modifiées" → cela exporte le JPEG + le MOV associé. Uploadez les deux avec le même nom de fichier. Le site détecte automatiquement la paire et anime la photo au survol.

---

## Installation locale

```bash
# 1. Cloner / copier le projet
cd wedding-gallery

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env.local
# Éditer .env.local avec vos valeurs R2

# 4. Lancer
npm run dev
# → http://localhost:3000
```

---

## Configuration Cloudflare R2

### 1. Créer le bucket
1. [dash.cloudflare.com](https://dash.cloudflare.com) → **R2 Object Storage** → **Créer un bucket**
2. Nom : `wedding-media`
3. **Settings → Public access → Activer**
4. Copier l'URL publique : `https://pub-xxxxxxxx.r2.dev`

### 2. Créer un token API
1. R2 → **Gérer les tokens API R2** → **Créer un token**
2. Permissions : **Lecture & Écriture d'objets**
3. Sauvegarder : Account ID, Access Key ID, Secret Access Key

### 3. Uploader les photos (rclone recommandé pour 200 photos)

```bash
# Installer rclone
brew install rclone   # macOS

# Configurer
rclone config
# → Nouveau remote → nom: r2mariage
# → Stockage: S3 Compatible → Fournisseur: Cloudflare
# → Renseigner Access Key ID + Secret

# Uploader un dossier entier
rclone copy ./ceremonie  r2mariage:wedding-media/ceremonie  --progress
rclone copy ./reception  r2mariage:wedding-media/reception  --progress
rclone copy ./cocktail   r2mariage:wedding-media/cocktail   --progress

# Pour les Live Photos (JPEG + MOV) : rclone copie les deux automatiquement
```

---

## Déploiement Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Ajouter les variables d'environnement
vercel env add R2_ACCOUNT_ID
vercel env add R2_ACCESS_KEY_ID
vercel env add R2_SECRET_ACCESS_KEY
vercel env add R2_BUCKET_NAME          # wedding-media
vercel env add NEXT_PUBLIC_R2_PUBLIC_URL  # https://pub-xxxx.r2.dev
vercel env add GALLERY_PASSWORD
vercel env add SESSION_SECRET          # openssl rand -hex 32

# Redéployer avec les variables
vercel --prod
```

---

## Personnalisation

### Noms et date
Dans `.env.local` :
```
NEXT_PUBLIC_PARTNER_A=Aña
NEXT_PUBLIC_PARTNER_B=François
NEXT_PUBLIC_CHILD_A=Elena
NEXT_PUBLIC_CHILD_B=Bixente
NEXT_PUBLIC_WEDDING_DATE=5 mars 2026
```

### Palette de couleurs
Dans `app/globals.css` :
```css
:root {
  --bg:      #130F0A;   /* fond très sombre chaud */
  --gold:    #D4922A;   /* or */
  --amber:   #E8B366;   /* ambre */
  --ember:   #F5C878;   /* braise claire */
  --warm:    #F7EDD8;   /* blanc chaud */
  --muted:   #7A6A54;   /* gris chaud */
}
```

---

## Estimation des coûts R2

Pour ~200 photos iPhone (~5 Mo chacune) + vidéos = ~1,5 Go :

| Élément | Coût |
|---------|------|
| Stockage (1,5 Go) | ~$0.02/mois |
| Egress | **$0** (R2 = zéro frais de sortie) |
| Opérations | ~$0.01/mois |
| **Total** | **< $0.05/mois** |

---

*Fait avec amour* 🤍
