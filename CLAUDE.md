# eHub Viewer

Vue 3 SPA — main interface for league masters and participants.

## Commands

```bash
npm run dev      # Vite dev server (port 5173, host 0.0.0.0)
npm run build    # Production build → dist/
npm run preview  # Serve built dist
npm install
```

## Architecture

- Vue 3 Composition API + Vuex + Vue Router
- Auth tokens (Sanctum Bearer) stored via `vue-cookies`
- Axios for API requests to Laravel API (`:8000`)
- Socket.IO client for real-time event updates from WebSocket server (`:3001`)
- i18n via `vue-i18n`, translations in `src/locales/`

## Key Routes

- `/` home, `/login`, `/register`
- `/org/:orgRoute` league view
- `/org/:orgRoute/manage` league management
- `/org/:orgRoute/manage/events/:eventRoute?/:eventRouteMenu?` event management (stages, participants, notifications)
- `/org/:orgRoute/manage/tournaments/:tournamentRoute` tournament management
- `/tournament/:tournamentRoute` public tournament view
- `/user/:userRoute` user profile

## State

- `src/store/auth.js` — auth state (token, user)
- `src/store/index.js` — root store

## Code Style

- ESLint + Prettier — run before committing
- Path alias: `@` → `src/`
- Composition API preferred over Options API

## Environment

API base URL configured in Axios instance. WebSocket URL points to `:3001`.
