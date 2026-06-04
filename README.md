# AssetTrack

A full-stack campus asset repair management system built with Node.js, PostgreSQL, React, and Socket.IO.

Reporters scan a QR code posted in a room, click a broken asset on a spatial map, and file a repair report. Admins assign reports to repairers. Repairers resolve them. The map updates in real-time for everyone.

---

## Features

- **Spatial asset map** — assets plotted as colored dots on a room image; green = working, red = pending, orange = under repair
- **QR code deep-linking** — each room has a printable QR code that opens the reporting interface pre-loaded to that room
- **Real-time updates** — Socket.IO broadcasts status changes instantly across all open clients
- **Role-based access control** — three roles (reporter, repairer, admin) enforced at both route and middleware level
- **Repairer onboarding** — new users start as reporters; repairer requests go to an admin approval queue with bulk actions
- **Institutional email gating** — registration restricted to admin-configured domains (e.g. iitg.ac.in)
- **Admin panel** — drag-and-drop asset placement, bulk role approvals, report assignment, analytics charts, QR generation

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Backend   | Node.js, Express                  |
| Database  | PostgreSQL (via pg Pool)          |
| Auth      | JWT + bcrypt                      |
| Realtime  | Socket.IO                         |
| Frontend  | React (Vite), React Router v6     |
| Charts    | Recharts                          |
| QR Codes  | qrcode                            |

---

## Setup

### 1. Database

```bash
createdb assettrack
psql assettrack < backend/schema.sql
```

### 2. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```
DB_USER=your_pg_user
DB_PASSWORD=your_pg_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=assettrack
JWT_SECRET=any_long_random_string
```

```bash
node index.js
```

### 3. Frontend

```bash
cd frontend
npm install
npm install recharts qrcode
```

Create `frontend/.env`:

```
VITE_API_URL=http://localhost:3000
VITE_BASE_URL=http://localhost:5173
```

```bash
npm run dev
```

### 4. First login

The schema seeds a default admin:
- Email: `admin@iitg.ac.in`
- Password: `admin123`

Change the password after first login. To generate a new bcrypt hash:

```bash
node -e "require('bcrypt').hash('newpassword', 10).then(console.log)"
```

Then run: `UPDATE users SET password = '<hash>' WHERE email = 'admin@iitg.ac.in';`

---

## How It Works

**Reporting flow**
1. Reporter scans QR code in a room → lands on `/room/:id` → redirected to Dashboard with room pre-selected
2. Reporter clicks an asset dot → describes the issue → submits
3. Asset turns red in real-time for all viewers

**Repair flow**
1. Admin assigns report to a repairer (Reports tab)
2. Repairer sees it on their dashboard → opens Repair Details → marks resolved
3. Asset turns green in real-time

**Repairer onboarding**
1. User registers → always starts as reporter regardless of selection
2. If they selected repairer, a pending request is auto-created
3. Admin approves/rejects from the Approvals tab (individually or in bulk)

---

## API Summary

**Auth:** `POST /auth/register`, `POST /auth/login`

**Reports:** `GET/POST /reports`, `PUT /reports/:id/assign`, `PUT /reports/:id/status`, `GET /reports/my-reports`, `GET /reports/:id`, analytics endpoints

**Rooms (public):** `GET /rooms/:id/assets`

**Admin (all require admin token):** role requests, room CRUD, asset CRUD, domain management

---

## Known Limitations

- No file upload for room images — use image URLs
- No email notifications — approval flow is UI-only
- No pagination on tables
- Admin role must be assigned directly in the DB

---

## License

MIT