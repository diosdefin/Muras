# Deployment (host-independent)

The build output is a plain static folder. No server code, no environment variables, no vendor APIs.

```bash
npm ci
npm run build        # prebuild validates locales + data; postbuild writes dist/admin/ and dist/precache.json
# upload ./dist to any static host
```

## The only host requirement: single-page-app fallback

Answer unknown paths with `/index.html` (status 200). Existing files (assets, images, `/admin/index.html`) win over the fallback.
Never cache `sw.js` or `precache.json` for long (the service worker updates itself from them);
hashed files in `/assets/` may be cached for a year.

| Host | Configuration |
| --- | --- |
| **Vercel** (current) | `vercel.json` in the repository root (rewrites for `/map`, `/species/:id`, `/territories…`, `/admin`; long cache for hero media) |
| **nginx / Docker** | `deploy/nginx.conf`, `deploy/Dockerfile` (`docker build -f deploy/Dockerfile -t muras . && docker run -p 8080:80 muras`) |
| **Netlify** | put `/*  /index.html  200` into a `_redirects` file in `dist/` (or `[[redirects]]` in `netlify.toml`) |
| **Cloudflare Pages** | same `_redirects` rule; Pages serves real files first |
| **GitHub Pages** | copy `dist/index.html` to `dist/404.html` after the build; if the site lives under a sub-path set `base` in `vite.config.js` and rebuild |

If the site is served from a sub-path, change `base` in `vite.config.js`; the code uses `import.meta.env.BASE_URL`.
The manifest, service worker scope and precache list assume the site root (`/`); adjust `public/manifest.webmanifest`
and `public/sw.js` for a sub-path.

## Checklist after deploying

1. Open `/`, `/map`, `/territories` and reload on a deep link such as `/species/<id>`: no 404.
2. `/admin/` shows the static "local editor only" page.
3. `/precache.json` exists, DevTools → Application → Service Workers shows an activated worker.
4. Switch the browser offline: catalogue, map and territories still open.

## Moving away from Vercel later

Nothing in `src/` or `scripts/` imports Vercel. Delete `vercel.json` (or leave it, it is ignored elsewhere), pick a row from the table above, done.
