# IT Helpdesk — UI Preview (Vercel-ready, static)

Demo of company ticketing system tailored for IT Department. **No backend** — data in `localStorage`.

## Features demoed
- Role login (employee / it_staff / admin)
- Email notification (toast simulation)
- Mobile responsive
- File input preview
- Light/dark mode (persisted)
- CSV import/export (real client-side)
- Analytics (Chart.js: by category/priority, counts, avg hrs)

## Run locally
```bash
npx serve .
# or
python -m http.server 3000
```

## Deploy to Vercel
Option A — Vercel dashboard: Import GitHub repo `it-helpdesk-preview`, no build command, output `.`.

Option B — CLI:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npx -y vercel --prod
```

## Production backend
See `../it-helpdesk/` (PHP 8 + MySQL, PDO, `password_hash`, SMTP optional). Preview is UI-only.
