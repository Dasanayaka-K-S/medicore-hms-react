# MediCore HMS — Frontend (React + Vite)

React single-page app for the MediCore Hospital Management System,
migrated from the original PHP pages. It talks to the Express API in
`../backend`.

Built with React 18, Vite, React Router 6, Axios and Bootstrap 5. The
dark navy/teal styling from the PHP version was carried over.

## Requirements

- Node.js 18 or newer
- The backend API running (see `../backend/README.md`)

## Installation

```bash
cd frontend
npm install
cp .env.example .env
```

`.env` needs one variable:

```
VITE_API_URL=http://localhost:5000/api
```

Vite only exposes variables prefixed with `VITE_`. This URL ends up in
the built JavaScript, so it must be a public API URL — never put secrets
or database credentials in a frontend `.env`.

## Running

```bash
npm run dev       # http://localhost:5173
npm run build     # production build into dist/
npm run preview   # preview the production build locally
```

## Logging in

Use the **Demo login** button, or any account from the backend README.
`demo` / `admin123` signs in as an Administrator and shows every module.

Sign in as `nurse.silva`, `accountant` or `pharmacist` to see the sidebar
change — each role only sees the modules it is allowed to open.

## How it is organised

```
frontend/src/
├── components/   Reusable pieces: Card, Pagination, SearchBar,
│                 StatusBadge, EmptyState, Loader, FlashMessages
├── config/       modules.js — sidebar items + which roles see them
├── context/      AuthContext (session), FlashContext (success/error)
├── layouts/      DashboardLayout, Sidebar, Topbar
├── pages/        One folder per module (list / form / view)
├── routes/       AppRoutes, ProtectedRoute
├── services/     api.js — axios instance, token storage, interceptors
└── utils/        format.js — date, time and currency formatting
```

Each module follows the same shape the PHP version used: a **list** page
with search, pagination and row actions; a **form** page that handles
both add and edit; and a **view** page where the original had one.

## How authentication works

Logging in stores the JWT and user, then every request attaches it as an
`Authorization: Bearer` header. If the API ever answers `401`, the stored
session is cleared and you are returned to the login page.

"Remember me" chooses where the session is kept: ticked uses
`localStorage` so it survives a browser restart, unticked uses
`sessionStorage` so it disappears when the tab closes. This replaces the
cookie-lifetime trick in the old `login.php`.

`ProtectedRoute` redirects signed-out visitors to `/login` and shows a
403 page to signed-in users whose role isn't allowed on that module. The
sidebar likewise only renders permitted links — but the backend enforces
the same rules independently, so hiding a link is never the only check.

## Responsive behaviour

The layout works on desktop, tablet and mobile. Below 992px the sidebar
slides off-canvas and is opened with the button in the top bar; tables
scroll horizontally inside their cards.

## Deploying to Vercel

1. Push the repository to GitHub.
2. In Vercel, import the project and set **Root Directory** to `frontend`.
3. Framework preset: **Vite**. Build command `npm run build`, output
   directory `dist` (Vercel detects these).
4. Add an environment variable `VITE_API_URL` pointing at your deployed
   backend, e.g. `https://your-api.onrender.com/api`.
5. Deploy.

`vercel.json` rewrites all paths to `index.html` so refreshing a deep
link like `/patients/5/edit` works instead of 404ing.

After deploying, set `CLIENT_ORIGIN` on the backend to your Vercel URL,
or the browser will block the API calls with a CORS error.

Rebuild after changing `VITE_API_URL` — the value is baked in at build
time, not read at runtime.
