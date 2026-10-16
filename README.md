# JobPortal Demo

Demo job portal for Farhad — browse jobs, filter, view details and apply. No backend, no Supabase. Mock data only. Applications are saved in the browser (localStorage).

## Features

- Header with portal name **JobPortal Demo** + search bar
- 12 mock jobs: Dhaka, Chattogram, Remote, Singapore (Remote)
- Filters: keyword search, category, location, job type, salary range
- Job details modal: description, requirements, company info
- Apply form: name, email, phone, CV link, cover letter
- Applications saved to `localStorage` (`job-portal-demo-applications`) + **My Applications** view with success message
- Responsive, clean modern UI (English)

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Deploy to Vercel (free)

1. Push this folder to a GitHub repo (e.g. `job-portal-demo`).
2. Go to [vercel.com/new](https://vercel.com/new) → Import the repo.
3. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
4. Deploy — Vercel gives a public URL anyone can open.

No environment variables needed for the demo.

## Notes

- To go from demo to real: replace `src/data/jobs.js` with a real API / Supabase query, and replace the localStorage apply form with a real backend / email endpoint.
- LinkedIn / Facebook jobs are **not** scraped in this demo — that would violate their Terms. Real aggregation should use official job APIs (e.g. Adzuna, JSearch) or employer direct posting.
