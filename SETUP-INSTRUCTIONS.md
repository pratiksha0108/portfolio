# Hero Cursor-Tracker: Add to Your Repo + Deploy to GitHub Pages

## 1. Copy files into your Next.js project

- `public/hero-frames/` → copy the whole folder into your project's `public/` folder
  (so the final path is `your-project/public/hero-frames/frame-000.jpg` etc.)
- `components/HeroCursorTracker.tsx` → copy into your project's `components/` folder
- `next.config.js` → replace your existing one (or merge the `output`, `images`,
  `basePath`, `assetPrefix`, `trailingSlash` settings into your existing config)
- `.github/workflows/deploy.yml` → copy into your project's `.github/workflows/` folder

## 2. Edit next.config.js

Open `next.config.js` and change:

```js
const repoName = 'your-repo-name';
```

to your actual GitHub repo name, e.g. if your repo is `github.com/pratiksha0108/portfolio`,
set `repoName = 'portfolio'`.

If you're using a custom domain (like pratikshashirsat.com) instead of
`username.github.io/repo-name`, delete the `basePath` and `assetPrefix` lines entirely.

## 3. Use the component on your homepage

In your homepage file (e.g. `app/page.tsx`):

```tsx
import HeroCursorTracker from '@/components/HeroCursorTracker';

export default function Home() {
  return (
    <main>
      <HeroCursorTracker />
      {/* rest of your page */}
    </main>
  );
}
```

## 4. Add the build script

Make sure your `package.json` has:

```json
"scripts": {
  "build": "next build"
}
```

(Next.js writes static files to an `out/` folder automatically when `output: 'export'`
is set in next.config.js — that's what the GitHub Action uploads.)

## 5. Push to GitHub

```bash
git add .
git commit -m "Add cursor-tracking hero section"
git push origin main
```

## 6. Turn on GitHub Pages

1. Go to your repo on GitHub → **Settings** → **Pages**
2. Under "Build and deployment" → **Source**, select **GitHub Actions**
   (not "Deploy from a branch" — the workflow handles that)
3. Push to `main` (or go to the **Actions** tab and manually run the workflow)
4. After it finishes (1-2 min), your site will be live at:
   `https://<your-username>.github.io/<repo-name>/`

## Notes

- The 100 JPEGs in `hero-frames/` total ~3MB — fine for GitHub Pages, no size concerns.
- If you later want a custom domain, add a `CNAME` file in `public/` with your domain,
  and remove `basePath`/`assetPrefix` from `next.config.js`.
- If images don't load after deploying, double check `repoName` in `next.config.js`
  matches your repo name exactly (case-sensitive).
