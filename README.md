# tourtoise web frontend
This is tourtoise web app

# tech stack
- next.js (App Router) + react + javascript
- tailwind css
- shadcn
- redux toolkit + rtk query
- firebase auth
- pwa (workbox via @ducanh2912/next-pwa)

# structure
- `app/` — next.js app router: thin route entries (page/layout) only
- `src/templates/` — page-level components (the actual screens) + route guards
- `src/layouts/` — app shell layouts (header, bottom nav, auth gate)
- `src/components/` — shared components (ui, layout, table, dialog)
- `src/features/` — redux slices + rtk query apis, feature components
- `src/hooks/`, `src/lib/`, `src/constants/`, `src/styles/` — cross-cutting code

# commands
- `npm run dev` — start dev server
- `npm run build` — production build (also emits the service worker)
- `npm start` — serve the production build
- `npm run lint` — eslint
- `npm run pwa:icons` — regenerate pwa icons from logo

# env
Copy `.env.example` to `.env` and fill in `NEXT_PUBLIC_*` values
(api base url, socket url, firebase credentials).

sudo sysctl fs.inotify.max_user_watches=524288
sudo sysctl fs.inotify.max_user_instances=1024
