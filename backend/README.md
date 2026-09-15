# MediCore HMS — Backend (Node.js + Express + MySQL)

REST API for the MediCore Hospital Management System, migrated from the
original PHP version. It runs against the **same MySQL database** the PHP
app used — the schema was not redesigned.

## Requirements

- Node.js 18 or newer
- MySQL 5.7+ / MariaDB 10.4+

## Installation

```bash
cd backend
npm install
cp .env.example .env
```

Then edit `.env`:

```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=medicore_hms
DB_USER=root
DB_PASSWORD=
JWT_SECRET=a_long_random_string_you_generate
JWT_EXPIRES_IN=8h
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

Generate a real `JWT_SECRET` (never ship the example one):

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Database setup

**If you already have the `medicore_hms` database from the PHP project**,
you don't need to do anything. The API works against it as-is, including
your existing users — their bcrypt password hashes are read unchanged, so
nobody has to reset a password.

**For a fresh install:**

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

`schema.sql` creates the ten tables with the same columns, keys and
foreign keys as the original export. `seed.sql` adds the 7 roles, the 8
demo users and the 6 default departments.

## Running

```bash
npm run dev    # nodemon, reloads on change
npm start      # plain node
```

The API listens on `http://localhost:5000`. Check it with
`curl http://localhost:5000/api/health`.

## Test credentials

| Username         | Password      | Role             |
|------------------|---------------|------------------|
| `admin`          | `admin123`    | Administrator    |
| `demo`           | `admin123`    | Administrator    |
| `dr.perera`      | `Password123` | Doctor           |
| `nurse.silva`    | `Password123` | Nurse            |
| `reception.jane` | `Password123` | Receptionist     |
| `lab.staff`      | `Password123` | Laboratory Staff |
| `pharmacist`     | `Password123` | Pharmacist       |
| `accountant`     | `Password123` | Accountant       |

Development accounts only — remove or change them before any real use.

## API endpoints

All routes except `POST /api/auth/login` and `GET /api/health` require an
`Authorization: Bearer <token>` header, and each module additionally
checks the caller's role.

### Auth
| Method | Endpoint | Notes |
|---|---|---|
| POST | `/api/auth/login` | Returns `{ token, user }` |
| GET | `/api/auth/me` | Current user from the token |

### Lookups (any signed-in user)
| Method | Endpoint | Notes |
|---|---|---|
| GET | `/api/lookups/patients` | id + name, for dropdowns |
| GET | `/api/lookups/doctors` | `?activeOnly=1` for active only |
| GET | `/api/lookups/departments` | id + name |

### Modules
| Method | Endpoint | Notes |
|---|---|---|
| GET | `/api/dashboard` | Stats, today's appointments, recent patients |
| GET | `/api/patients` | `?q=&page=` search + pagination |
| GET/POST/PUT/DELETE | `/api/patients/:id` | Full CRUD |
| GET | `/api/doctors` | `?q=&page=` |
| GET/POST/PUT/DELETE | `/api/doctors/:id` | Full CRUD |
| GET/POST/PUT/DELETE | `/api/departments/:id` | Full CRUD (list is unpaginated) |
| GET | `/api/appointments` | `?q=&status=&page=` |
| GET/POST/PUT | `/api/appointments/:id` | No delete — see below |
| PATCH | `/api/appointments/:id/cancel` | Soft cancel |
| GET | `/api/medical-records` | `?q=&page=` |
| GET/POST/PUT | `/api/medical-records/:id` | No delete |
| GET | `/api/laboratory` | `?status=&page=` |
| GET/POST/PUT | `/api/laboratory/:id` | No delete |
| GET | `/api/pharmacy` | `?q=&page=`, returns `alertCount` |
| GET/POST/PUT/DELETE | `/api/pharmacy/:id` | Full CRUD |
| GET | `/api/billing` | `?q=&status=&page=` |
| GET/POST/PUT | `/api/billing/:id` | No delete |

**Why some modules have no DELETE:** the original PHP app had no
`delete.php` for medical records, laboratory tests or bills, and
cancelled appointments by changing their status rather than removing the
row. That was left exactly as it was — clinical and financial history
isn't destroyed.

## Role permissions

Taken directly from `PAGE_ACCESS` in the PHP app's `includes/auth.php`
and enforced by `middleware/auth.js`.

| Module | Roles with access |
|---|---|
| Dashboard | All 7 roles |
| Patients | Administrator, Doctor, Nurse, Receptionist, Laboratory Staff, Pharmacist |
| Doctors | Administrator, Receptionist |
| Departments | Administrator, Receptionist |
| Appointments | Administrator, Doctor, Nurse, Receptionist |
| Medical Records | Administrator, Doctor, Nurse |
| Laboratory | Administrator, Doctor, Laboratory Staff |
| Pharmacy | Administrator, Pharmacist |
| Billing | Administrator, Receptionist, Accountant |

## Project structure

```
backend/
├── config/        db.js (MySQL pool), roles.js (permission map)
├── controllers/   one per module, holds the SQL
├── middleware/    auth.js (JWT + roles), errorHandler.js
├── routes/        one router per module
├── utils/         asyncHandler.js, helpers.js
├── database/      schema.sql, seed.sql
└── server.js
```

## Security notes

- All queries are parameterised (`?` placeholders) — no string-built SQL.
- Passwords are bcrypt-verified; hashes are never returned by the API.
- Medicine status and appointment/bill status values are decided
  server-side, not trusted from the request body.
- Errors are logged on the server but clients only receive a generic
  message — no stack traces, SQL text or credentials.
- CORS only allows the origin(s) in `CLIENT_ORIGIN`.
- `.env` is gitignored. Never commit real credentials.

## Deployment

Works on any Node host (Railway, Render, Fly.io, a VPS). Set the same
environment variables in the host's dashboard, and point `CLIENT_ORIGIN`
at your deployed frontend URL.

Because it keeps a MySQL connection pool, a long-running Node process
suits it better than short-lived serverless functions. If you do deploy
serverless, use a MySQL provider with connection pooling (such as
PlanetScale) to avoid exhausting connections.
