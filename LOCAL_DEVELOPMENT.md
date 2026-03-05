# Local Development Guide 🎉

## Quick Start

```bash
npm run dev
```

Visit `http://localhost:3000` (or 3001 if 3000 is in use).

---

## Local Media for Development

No R2 credentials needed! The gallery works offline with local media files.

### Local Media Folder Structure

```
public/media/
├── ceremonie/
│   ├── IMG_0001.jpg
│   ├── IMG_0002.jpg
│   └── ...
├── reception/
│   ├── IMG_0001.jpg
│   └── ...
└── famille/
    ├── IMG_0001.jpg
    └── ...
```

### Adding Your Own Photos

1. **Create album folders** in `public/media/`
   - Supported: `ceremonie/`, `reception/`, `famille/`, or any custom folder name

2. **Drop photos inside**
   - Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`, `.heic`
   - Videos: `.mp4`, `.mov`, `.webm`
   - Files are served at: `http://localhost:3000/media/album/photo.jpg`

3. **Reload the gallery**
   - The `/api/media` endpoint will auto-discover files

### Generate Test Images

Pre-generated test images are in `public/media/`. To regenerate them:

```bash
node scripts/create-test-media.js
```

This creates simple placeholder PNG files for testing the gallery UI.

---

## Testing the Gallery

### Password (Local)

Default password for local testing: **`mariage2026`**

```bash
# Login via API
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"password":"mariage2026"}'
```

### Gallery Views

After login, you can test:

- **Grid view**: All photos as a grid
- **Album view**: Photos filtered by folder (e.g., `ceremonie`)
- **Single photo**: Click any photo to open lightbox
- **Lightbox features**: Zoom, download, keyboard navigation

---

## R2 Integration (Production)

When deploying, add your Cloudflare R2 credentials to `.env`:

```env
R2_ACCOUNT_ID=your_r2_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=wedding-media
NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

The app **automatically switches** to R2 when credentials are configured.

---

## Theme Testing

The app includes **light mode (default) and dark mode**.

- 🌞 Default: Bright, warm colors for daytime
- 🌙 Toggle: Click the button in top-right corner to switch themes
- 💾 Persisted: Theme choice is saved in browser localStorage

Both modes are fully tested and responsive.

---

## Troubleshooting

### Port already in use

If `3000` is busy, the server tries `3001`, `3002`, etc. Check the terminal output.

```bash
# Kill any lingering Node processes
killall node
npm run dev
```

### Media not showing

1. Verify files exist in `public/media/`
2. Check browser console for errors (`F12`)
3. Ensure you're logged in (should redirect to `/login` first)
4. Try `node scripts/test-local-media.js` to debug the API

### Theme not persisting

- Check browser storage: `DevTools → Application → Local Storage`
- Incognito windows don't persist storage; use normal windows

---

## File Organization

```
wedding-gallery/
├── public/media/           ← 🎬 Add images here
│   ├── ceremonie/
│   ├── reception/
│   └── famille/
├── scripts/
│   ├── create-test-media.js     ← Generate placeholder images
│   └── test-local-media.js      ← Test the API
├── app/
│   ├── api/media/route.ts       ← Serves local OR R2 files
│   ├── api/login/route.ts       ← Auth API
│   ├── page.tsx                 ← Landing page (public)
│   ├── login/page.tsx           ← Login form (public)
│   └── gallery/page.tsx         ← Gallery (protected)
├── lib/
│   ├── r2.ts                    ← R2 + Local media client
│   └── theme-context.tsx        ← Theme system
└── components/
    ├── ThemeToggle.tsx          ← Light/Dark toggle button
    ├── GalleryClient.tsx        ← Gallery UI
    └── EmberParticles.tsx       ← Animated particles
```

---

## Building for Production

```bash
npm run build  # Creates optimized .next/ folder
npm start      # Runs the production server
```

Make sure R2 credentials are in `.env.local` before building for production!
