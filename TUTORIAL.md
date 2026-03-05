# Guide complet — Galerie Aña & François
### Tester en local · Déployer · Choisir un mot de passe

---

## Avant de commencer — Ce dont vous avez besoin

| Outil | Pourquoi | Installer |
|-------|----------|-----------|
| **Node.js 20+** | Faire tourner Next.js | [nodejs.org](https://nodejs.org) → bouton "LTS" |
| **Git** (optionnel) | Versionner le projet | Inclus sur Mac, [git-scm.com](https://git-scm.com) sur Windows |
| **Un terminal** | Taper les commandes | Terminal sur Mac, PowerShell sur Windows |

> **Vérifier que Node est installé :**
> ```
> node --version
> ```
> Doit afficher `v20.x.x` ou supérieur.

---

## PARTIE 1 — Tester en local sur votre ordinateur

### Étape 1 · Placer le projet

Décompressez le dossier `wedding-gallery` téléchargé. Ouvrez votre terminal et naviguez dedans :

```bash
cd chemin/vers/wedding-gallery
# Exemple Mac : cd ~/Downloads/wedding-gallery
# Exemple Windows : cd C:\Users\Vous\Downloads\wedding-gallery
```

### Étape 2 · Installer les dépendances

```bash
npm install
```

Cette commande télécharge ~200 Mo de bibliothèques dans un dossier `node_modules/`. C'est normal, cela prend 1 à 2 minutes.

### Étape 3 · Créer le fichier de configuration local

```bash
cp .env.example .env.local
```

Ouvrez maintenant `.env.local` avec n'importe quel éditeur de texte (Notes, VS Code, Notepad…).

**Pour tester EN LOCAL sans R2** (mode démo rapide), mettez :

```
R2_ACCOUNT_ID=placeholder
R2_ACCESS_KEY_ID=placeholder
R2_SECRET_ACCESS_KEY=placeholder
R2_BUCKET_NAME=wedding-media
NEXT_PUBLIC_R2_PUBLIC_URL=https://placeholder.r2.dev

GALLERY_PASSWORD=mariage2026
SESSION_SECRET=une-chaine-quelconque-de-32-caracteres-au-moins

NEXT_PUBLIC_PARTNER_A=Aña
NEXT_PUBLIC_PARTNER_B=François
NEXT_PUBLIC_CHILD_A=Elena
NEXT_PUBLIC_CHILD_B=Bixente
NEXT_PUBLIC_WEDDING_DATE=5 mars 2026

NEXT_PUBLIC_HERO_IMAGE_URL=
```

> La galerie affichera "Aucune photo" en mode démo — c'est normal, R2 n'est pas encore configuré. Tout le reste (login, animations, navigation) fonctionne parfaitement.

### Étape 4 · Lancer le serveur de développement

```bash
npm run dev
```

Vous verrez :

```
▲ Next.js 14.x.x
- Local:    http://localhost:3000
- Ready in 2.3s
```

### Étape 5 · Ouvrir dans le navigateur

→ **http://localhost:3000**

Vous devriez voir la page d'accueil avec les animations de braise.
Cliquez sur "Galerie · Galeria" → entrez le mot de passe `mariage2026` → vous êtes dans la galerie.

> **Pour arrêter le serveur :** `Ctrl + C` dans le terminal.

---

## PARTIE 2 — Configurer Cloudflare R2 (stockage des photos)

R2 est le service de stockage de Cloudflare. Gratuit jusqu'à 10 Go, et surtout **zéro frais d'egress** (contrairement à Amazon S3 qui facture chaque téléchargement).

### Étape 1 · Créer un compte Cloudflare

→ [dash.cloudflare.com](https://dash.cloudflare.com) → Créer un compte gratuit (email + mot de passe).

### Étape 2 · Créer le bucket

1. Dans le tableau de bord Cloudflare, cliquez sur **R2** dans le menu gauche
2. Cliquez sur **"Create bucket"**
3. Nom : `wedding-media` (exactement comme ça, en minuscules)
4. Région : laissez **Automatic**
5. Cliquez **"Create bucket"**

### Étape 3 · Activer l'accès public

Sans cette étape, les photos ne seront pas visibles sur le site.

1. Cliquez sur votre bucket `wedding-media`
2. Onglet **"Settings"**
3. Section **"Public access"** → cliquez **"Allow Access"**
4. Confirmez
5. Copiez l'URL affichée, elle ressemble à : `https://pub-abc123def456.r2.dev`

→ Cette URL va dans `NEXT_PUBLIC_R2_PUBLIC_URL` de votre `.env.local`

### Étape 4 · Créer les clés d'accès API

Ces clés permettent au site d'écrire et lister les photos dans votre bucket.

1. Dans le menu R2, cliquez **"Manage R2 API tokens"** (en haut à droite)
2. Cliquez **"Create API token"**
3. Nom du token : `wedding-gallery`
4. Permissions : sélectionnez **"Object Read & Write"**
5. Scope : **"Specific bucket"** → choisissez `wedding-media`
6. Cliquez **"Create API Token"**
7. **⚠️ Copiez immédiatement** les trois valeurs affichées, elles ne seront plus visibles :
   - `Account ID`
   - `Access Key ID`
   - `Secret Access Key`

### Étape 5 · Uploader vos photos

**Option A — Interface web Cloudflare (pour quelques photos)**

Dans votre bucket R2, cliquez **"Upload"** et glissez-déposez vos photos directement.

Pour créer des albums, créez des "dossiers" virtuels en nommant vos fichiers `ceremonie/photo.jpg`.

**Option B — rclone (recommandé pour 200 photos)**

rclone est un outil en ligne de commande qui synchronise des dossiers entiers vers R2.

```bash
# 1. Installer rclone
# Mac :
brew install rclone

# Windows : télécharger sur https://rclone.org/downloads/

# 2. Configurer (une seule fois)
rclone config

# Suivre les étapes :
# n) New remote
# name> r2mariage
# Storage> s3  (chercher "S3 compatible")
# provider> Cloudflare
# access_key_id> VOTRE_ACCESS_KEY_ID
# secret_access_key> VOTRE_SECRET_ACCESS_KEY
# endpoint> https://VOTRE_ACCOUNT_ID.r2.cloudflarestorage.com
# (tout le reste : Entrée pour défaut)

# 3. Uploader vos dossiers de photos
rclone copy ./ceremonie  r2mariage:wedding-media/ceremonie  --progress
rclone copy ./cocktail   r2mariage:wedding-media/cocktail   --progress
rclone copy ./reception  r2mariage:wedding-media/reception  --progress
```

> **Live Photos iPhone :** exportez depuis l'app Photos → Fichier → Exporter → "Exporter photos non modifiées". Cela crée des paires `IMG_0001.HEIC` + `IMG_0001.mov`. Uploadez les deux avec rclone. Le site détecte automatiquement la paire et anime la photo au survol.

### Étape 6 · Choisir votre photo de couverture

Une fois vos photos uploadées dans R2, choisissez-en une pour la page d'accueil.

L'URL de votre photo sera : `https://pub-abc123.r2.dev/ceremonie/IMG_0001.jpg`

Ajoutez-la dans `.env.local` :
```
NEXT_PUBLIC_HERO_IMAGE_URL=https://pub-abc123.r2.dev/ceremonie/IMG_0001.jpg
```

Relancez `npm run dev` pour voir le résultat.

---

## PARTIE 3 — Choisir un mot de passe

Le site utilise **un seul mot de passe partagé** entre tous les invités. Simple, efficace.

### Bons exemples de mots de passe

Choisissez quelque chose de mémorable pour les invités, mais pas trop évident :

| Style | Exemple |
|-------|---------|
| Lieu du mariage | `Mendi2026` (montagne en basque) |
| Prénom + année | `Elena2026` |
| Mot basque | `Zorionak` (félicitations) |
| Mot français | `Muguet2026` |
| Combinaison | `Ana-Francois-5mars` |

> Évitez les espaces — certains téléphones peuvent les transformer lors de la saisie.

### Comment partager le mot de passe

- Dans le **faire-part numérique** ou le **carton d'invitation**
- Dans un **SMS de groupe** après le mariage
- Via **WhatsApp** à la famille

---

## PARTIE 4 — Générer le SESSION_SECRET

Le `SESSION_SECRET` est une clé cryptographique qui signe les cookies de session. Il doit être long et aléatoire. **Les invités n'ont jamais besoin de le connaître.**

### Option A — Terminal Mac/Linux

```bash
openssl rand -hex 32
```

Exemple de résultat : `a3f8c2d1e9b7456a8f0e3c2d1a9b74...` (64 caractères)

### Option B — Terminal Windows (PowerShell)

```powershell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

### Option C — En ligne (si vous n'avez pas de terminal)

Allez sur [generate-secret.vercel.app](https://generate-secret.vercel.app/32) — cliquez "Générer" et copiez le résultat.

Collez ce secret dans `.env.local` :
```
SESSION_SECRET=a3f8c2d1e9b7456a8f0e3c2d1a9b74...
```

---

## PARTIE 5 — Déploiement sur Vercel

Vercel est la plateforme qui héberge le site. Le plan gratuit (Hobby) est largement suffisant.

### Étape 1 · Créer un compte Vercel

→ [vercel.com](https://vercel.com) → "Sign Up" → connexion avec GitHub, GitLab ou email.

### Étape 2 · Installer la CLI Vercel

```bash
npm install -g vercel
```

### Étape 3 · Se connecter

```bash
vercel login
```

Suivez les instructions — un email de confirmation vous sera envoyé.

### Étape 4 · Déployer le projet

Depuis le dossier `wedding-gallery` :

```bash
vercel
```

Répondez aux questions :
- **Set up and deploy?** → `Y`
- **Which scope?** → votre compte
- **Link to existing project?** → `N`
- **Project name?** → `wedding-ana-francois` (ou ce que vous voulez)
- **Directory?** → `.` (point = dossier actuel)
- **Override settings?** → `N`

Vercel déploie une version de prévisualisation. Vous obtiendrez une URL comme `https://wedding-ana-francois-xxxx.vercel.app`.

### Étape 5 · Ajouter les variables d'environnement

C'est l'étape la plus importante — sans les variables, le site ne fonctionnera pas en production.

```bash
# Exécutez chaque commande, collez la valeur quand demandé

vercel env add R2_ACCOUNT_ID
# → Collez votre Account ID Cloudflare (ex: abc123def456)

vercel env add R2_ACCESS_KEY_ID
# → Collez votre Access Key ID

vercel env add R2_SECRET_ACCESS_KEY
# → Collez votre Secret Access Key

vercel env add R2_BUCKET_NAME
# → wedding-media

vercel env add NEXT_PUBLIC_R2_PUBLIC_URL
# → https://pub-abc123.r2.dev

vercel env add GALLERY_PASSWORD
# → votre mot de passe choisi à la Partie 3

vercel env add SESSION_SECRET
# → votre secret généré à la Partie 4

vercel env add NEXT_PUBLIC_PARTNER_A
# → Aña

vercel env add NEXT_PUBLIC_PARTNER_B
# → François

vercel env add NEXT_PUBLIC_CHILD_A
# → Elena

vercel env add NEXT_PUBLIC_CHILD_B
# → Bixente

vercel env add NEXT_PUBLIC_WEDDING_DATE
# → 5 mars 2026

vercel env add NEXT_PUBLIC_HERO_IMAGE_URL
# → https://pub-abc123.r2.dev/ceremonie/IMG_0001.jpg
```

Pour chaque variable, Vercel demande l'environnement — choisissez toujours **Production, Preview, Development** (les trois).

### Étape 6 · Déployer en production

```bash
vercel --prod
```

Vous obtiendrez votre URL définitive :
`https://wedding-ana-francois.vercel.app`

### Étape 7 (optionnel) · Domaine personnalisé

Si vous voulez une URL comme `mariage.ana-francois.fr` :

1. Achetez un domaine sur [OVH](https://ovh.com) ou [Namecheap](https://namecheap.com)
2. Dans le tableau de bord Vercel → votre projet → **Settings → Domains**
3. Ajoutez votre domaine et suivez les instructions DNS (5 minutes)

---

## Résumé — Checklist finale

```
✅ Node.js 20+ installé
✅ npm install lancé
✅ .env.local créé et rempli
✅ npm run dev → http://localhost:3000 fonctionne
✅ Bucket R2 créé avec accès public activé
✅ Clés API R2 générées et copiées
✅ Photos uploadées dans R2 (dossiers = albums)
✅ Photo de couverture choisie (NEXT_PUBLIC_HERO_IMAGE_URL)
✅ Mot de passe choisi et noté
✅ SESSION_SECRET généré
✅ vercel login
✅ vercel (premier déploiement)
✅ Toutes les variables d'env ajoutées avec vercel env add
✅ vercel --prod (déploiement final)
✅ URL partagée avec les invités + mot de passe
```

---

## En cas de problème

| Erreur | Solution |
|--------|----------|
| `Module not found` | Relancer `npm install` |
| Galerie vide | Vérifier `NEXT_PUBLIC_R2_PUBLIC_URL` et que le bucket est public |
| Login ne fonctionne pas | Vérifier `GALLERY_PASSWORD` et `SESSION_SECRET` dans les env vars Vercel |
| Photo de couverture absente | Vérifier que `NEXT_PUBLIC_HERO_IMAGE_URL` est bien dans `next.config.mjs` → `remotePatterns` |
| Erreur R2 en prod | Re-vérifier les 3 variables R2 dans Vercel Dashboard → Settings → Environment Variables |

Pour tout problème de déploiement, le tableau de bord Vercel affiche les logs en temps réel sous **Deployments → votre déploiement → Logs**.

---

*Fait avec amour* 🤍
