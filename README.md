# MediCore HMS — React + Node.js + Express + MySQL

A migration of the original **PHP + MySQL** MediCore Hospital Management
System to a modern full-stack setup. Same database, same modules, same
business rules, same role permissions — different technology.

```
medicore-hms-react/
├── frontend/    React 18 + Vite + React Router + Axios + Bootstrap 5
└── backend/     Node.js + Express + MySQL (mysql2) + JWT + bcrypt
```

Start with `backend/README.md`, then `frontend/README.md`.

## Quick start

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env          # fill in DB settings + a real JWT_SECRET
mysql -u root -p < database/schema.sql   # fresh installs only
mysql -u root -p < database/seed.sql     # fresh installs only
npm run dev                   # http://localhost:5000

# 2. Frontend (second terminal)
cd frontend
npm install
cp .env.example .env          # VITE_API_URL=http://localhost:5000/api
npm run dev                   # http://localhost:5173
```

Open http://localhost:5173 and press **Demo login**.

If you already have the `medicore_hms` database from the PHP project,
skip the two `mysql` commands — the new backend runs against your
existing data and users untouched.

## Test credentials

| Username | Password | Role |
|---|---|---|
| `admin` | `admin123` | Administrator |
| `demo` | `admin123` | Administrator |
| `dr.perera` | `Password123` | Doctor |
| `nurse.silva` | `Password123` | Nurse |
| `reception.jane` | `Password123` | Receptionist |
| `lab.staff` | `Password123` | Laboratory Staff |
| `pharmacist` | `Password123` | Pharmacist |
| `accountant` | `Password123` | Accountant |

## The original architecture

The PHP app was procedural, with one folder per module and a
`index/add/edit/delete` page inside each:

- `config/database.php` — PDO connection, credentials hard-coded
- `includes/auth.php` — `$_SESSION` login + a `PAGE_ACCESS` role map
- `includes/functions.php` — flash messages, date/currency formatting,
  status badges, pagination, medicine status calculation
- `includes/header.php` / `sidebar.php` / `footer.php` — shared layout
- Nine module folders, each page doing its own SQL, validation and HTML

Authentication was a session cookie; every page called `requireLogin()`
and `requirePageAccess('module')` at the top.

## Database tables

Ten tables, carried over unchanged:

| Table | Purpose | Key relationships |
|---|---|---|
| `roles` | The 7 job roles | referenced by `users` |
| `users` | Login accounts | `role_id` → `roles` |
| `patients` | Patient records | unique `nic` |
| `doctors` | Doctor records | `department_id` → `departments` (SET NULL) |
| `departments` | Hospital departments | unique `department_name` |
| `appointments` | Bookings | → `patients`, `doctors` (CASCADE), `departments` (SET NULL) |
| `medical_records` | Diagnoses/treatment | → `patients`, `doctors` (CASCADE) |
| `laboratory_tests` | Test requests + results | → `patients` (CASCADE), `doctors` (SET NULL) |
| `medicines` | Pharmacy inventory | — |
| `bills` | Billing | → `patients` (CASCADE) |

## PHP → React / Node mapping

| PHP page | REST endpoint | React route |
|---|---|---|
| `login.php` | `POST /api/auth/login` | `/login` |
| `logout.php` | (client clears the token) | sidebar "Log out" |
| `index.php` | — | `/` redirects to `/dashboard` |
| `dashboard.php` | `GET /api/dashboard` | `/dashboard` |
| `patients/index.php` | `GET /api/patients` | `/patients` |
| `patients/add.php` | `POST /api/patients` | `/patients/new` |
| `patients/edit.php` | `PUT /api/patients/:id` | `/patients/:id/edit` |
| `patients/view.php` | `GET /api/patients/:id` | `/patients/:id` |
| `patients/delete.php` | `DELETE /api/patients/:id` | confirm dialog in list |
| `doctors/*` | `/api/doctors` | `/doctors`, `/doctors/new`, `/doctors/:id/edit` |
| `departments/*` | `/api/departments` | `/departments`, `/departments/new`, `/departments/:id/edit` |
| `appointments/index.php` | `GET /api/appointments` | `/appointments` |
| `appointments/add.php` | `POST /api/appointments` | `/appointments/new` |
| `appointments/edit.php` | `PUT /api/appointments/:id` | `/appointments/:id/edit` |
| `appointments/cancel.php` | `PATCH /api/appointments/:id/cancel` | confirm dialog in list |
| `medical-records/*` | `/api/medical-records` | `/medical-records/...` |
| `laboratory/index.php` | `GET /api/laboratory` | `/laboratory` |
| `laboratory/add.php` | `POST /api/laboratory` | `/laboratory/new` |
| `laboratory/edit.php` | `PUT /api/laboratory/:id` | `/laboratory/:id/edit` |
| `pharmacy/*` | `/api/pharmacy` | `/pharmacy/...` |
| `billing/*` | `/api/billing` | `/billing/...` |

### Shared logic

| PHP | Replacement |
|---|---|
| `$pdo` (PDO) | `backend/config/db.js` — mysql2 pool |
| `PAGE_ACCESS` | `backend/config/roles.js` + `frontend/src/config/modules.js` |
| `requireLogin()` | `requireAuth` middleware (JWT) |
| `requirePageAccess()` | `requireModuleAccess(key)` middleware |
| `setFlash()` / `renderFlash()` | `FlashContext` + `FlashMessages` |
| `formatDate/Time/Currency()` | `frontend/src/utils/format.js` |
| `statusBadge()` | `components/StatusBadge.jsx` |
| `paginate()` / `renderPagination()` | `utils/helpers.js` + `components/Pagination.jsx` |
| `computeMedicineStatus()` | `utils/helpers.js` (server-side only) |
| `clean()` (htmlspecialchars) | React escapes by default |
| `sidebar.php` | `layouts/Sidebar.jsx` |
| `header.php` / `footer.php` | `layouts/DashboardLayout.jsx` + `Topbar.jsx` |
| Live clock in `app.js` | `useClock()` in `Topbar.jsx` |

## Business rules that were preserved

- Patient NIC must be unique (checked on add and edit).
- Department names must be unique.
- Medicine status is **calculated, never entered**: Expired (past expiry)
  → Out of Stock (qty ≤ 0) → Low Stock (qty < 20) → Available.
- New lab tests always start as `Requested`; the patient and requesting
  doctor can't be changed afterwards, only the status and result.
- Appointments are **cancelled, not deleted**, and the cancel action only
  appears for appointments that aren't already Completed or Cancelled.
- Medical records, lab tests and bills have no delete at all.
- Dashboard revenue counts **Paid** bills only.
- Lists page 10 rows at a time; searches match the same columns as before.
- Every destructive action still asks for confirmation first.

## What changed, and why

**Sessions → JWT.** PHP sessions are server-side state tied to a cookie.
A separate React frontend and API needs a stateless token, so login now
returns a JWT that the frontend sends on each request. Passwords were
*not* touched: bcryptjs reads PHP's `$2y$` hashes directly, so every
existing account keeps working with its current password.

**Added `/api/lookups/*`.** The PHP appointment form queried the
`doctors` table directly for its dropdown, even for Nurses, who aren't
allowed into the Doctors module. Exposing the full Doctors API to Nurses
would have been a privilege escalation, so these endpoints return only
id + name to any signed-in user. Same behaviour, narrower access.

**Status fields are validated server-side.** The PHP code inserted
`$_POST['status']` more or less as-is. The API now checks values against
the allowed list before they reach the database.

**Database credentials moved to `.env`.** They were hard-coded in
`config/database.php`. Both `.env` files are gitignored.

**Errors no longer leak.** Real errors are logged on the server; clients
get a generic message with no stack trace or SQL.

### Not migrated

**The login-notification email.** `config/mail.php` defines SMTP
constants and the old README refers to a `sendLoginNotification()`
function in `includes/functions.php` — but that function does not exist
in the file, and `MAIL_ENABLED` was `false`. The feature was documented
but never implemented, so there was nothing to port. Adding it (with
Nodemailer) would be new work, not a migration.

**`tools/hash_password.php`.** A dev utility that generated bcrypt
hashes through an unauthenticated public page. It has no place in the new
stack; create users through the database or add an admin endpoint.

**`config/test-db.php`.** A 4-line connection test, replaced by
`GET /api/health`.

## Deployment

**Frontend → Vercel.** Root directory `frontend`, preset Vite, and set
`VITE_API_URL` to your live API. `vercel.json` handles SPA routing so
deep links don't 404.

**Backend → any Node host** (Railway, Render, Fly.io, a VPS). Set
`DB_*`, `JWT_SECRET`, `PORT` and `CLIENT_ORIGIN` there. Point
`CLIENT_ORIGIN` at your Vercel URL or CORS will block the browser.

**Database → any managed MySQL** (PlanetScale, Railway MySQL, Amazon
RDS). Import `backend/database/schema.sql`, or your existing dump.

No PHP is required anywhere.

## Security checklist

- Parameterised SQL everywhere — no query string concatenation
- bcrypt password verification; hashes never leave the server
- JWT-protected routes plus per-module role authorisation
- Role checks enforced on the API, not just hidden in the UI
- CORS limited to a configured origin
- Secrets in `.env`, gitignored, with `.env.example` committed instead
- Generic client-facing error messages
- React escapes rendered values, so the `clean()` calls aren't needed
