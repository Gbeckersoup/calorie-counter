# Calorie Counter (PWA)

A tiny offline-first calorie counter you can install on Android.

## Quick deploy options

### 1) Netlify Drop (fastest)
1. Go to https://app.netlify.com/drop
2. Drag-and-drop the **contents** of this folder (not the folder itself).
3. Netlify gives you a URL like `https://calorie-counter-xyz.netlify.app`.
4. Open that URL on your phone → **Install** / **Add to Home screen**.

### 2) GitHub Pages
1. Create a new public repo named `calorie-counter`.
2. Upload everything in this folder to the repo root.
3. Go to **Settings → Pages** and set:
   - Source: **GitHub Actions**
4. Push once to `main`. The included workflow (`.github/workflows/pages.yml`) will publish.
5. Your site will be available at `https://<your-username>.github.io/calorie-counter`.

## Notes
- Works offline; data is stored on-device (localStorage).
- Use **Export/Import JSON** in the app to back up / restore.
- No server, no tracking.
