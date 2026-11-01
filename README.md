# Baby Pleats Admin

Admin dashboard for Baby Pleats (React + TypeScript + Vite).

## Local development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` if you need a non-default API host.

```bash
npm run build   # production build → dist/
npm run lint
npm run preview # serve dist locally
```

## Environment

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Baby Pleats API origin (no trailing slash). Build-time only. |

Production value: `https://babypleats-api.onrender.com`

Do not put API secrets, Cloudinary API secrets, or other private credentials in frontend env vars — they are embedded in the client bundle.

## Deploy on Render (Static Site)

1. Create a **Static Site** from this repository (or use the Blueprint in `render.yaml`).
2. **Build command:** `npm install && npm run build`
3. **Publish directory:** `dist`
4. **Environment** (build-time):

   - `VITE_API_BASE_URL` = `https://babypleats-api.onrender.com`

5. **SPA rewrite** (Redirects/Rewrites):

   | Source | Destination | Action |
   | --- | --- | --- |
   | `/*` | `/index.html` | Rewrite |

6. Ensure the API (`babypleats-api`) allows CORS from the admin Static Site origin.

After deploy, open the Render URL and confirm login, nested routes, and hard refresh on deep links (e.g. `/orders`, `/products/:id`).

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck + production build |
| `npm run lint` | Oxlint |
| `npm run preview` | Preview production build |
