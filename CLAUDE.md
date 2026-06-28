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

## Componentização

**Regra:** Maximize a extração de componentes. Se um bloco de UI pode aparecer em mais de uma view, extraia imediatamente — não espere a duplicação acontecer.

Componentes ficam em `src/components/` com prefixo `Ehub`. Sub-dirs por escopo:
- `inputs/` — controles de formulário e UI de campo
- `modules/` — painéis maiores e auto-contidos (org, league, event)
- `general/` — helpers de layout, wrappers

Exemplos do que DEVE ser componente (não inline na view):
- Upload de imagem com preview (logo, capa, avatar) → `EhubProfileImageUpload`
- Seletor de cor → `EhubColorPicker`
- Modal de confirmação reutilizável
- Campos de formulário com validação visual
- Barras de navegação por abas usadas em múltiplas views
- Cards de estatística/badge usados em org, time e perfil
- Exibição de cargo/permissão (badge de role)
- Avatar com fallback de iniciais

Ao implementar UI: pergunte "isso existe em outro lugar, ou poderia existir?" Se sim — extraia primeiro, depois use.

## Environment

API base URL configured in Axios instance. WebSocket URL points to `:3001`.
