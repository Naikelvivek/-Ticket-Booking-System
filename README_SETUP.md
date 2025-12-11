# Ticket Booking System - Complete Setup Guide

This is a full-stack ticket booking application with React frontend and Node.js/Express backend using PostgreSQL.

## Prerequisites

- **Node.js** v16+ (includes npm)
- **PostgreSQL** running locally (v12+)
- **Git** (optional, for version control)

## Quick Start (5 minutes)

### 1. Setup PostgreSQL Database

**Windows - PostgreSQL Installation**
- Download from https://www.postgresql.org/download/windows/
- Install with default settings
- Username: `postgres`
- Password: `admin` (as you specified)
- Port: `5432`

**Enable pgcrypto extension** (needed for UUID generation):
```sql
-- Connect to postgres database and run once:
psql -U postgres -h localhost -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
```

Or using pgAdmin GUI:
- Open pgAdmin 4 (installed with PostgreSQL)
- Connect to "postgres" database
- Open Query Tool
- Paste: `CREATE EXTENSION IF NOT EXISTS pgcrypto;`
- Execute

### 2. Start Backend Server

**Terminal 1 - Backend:**
```powershell
cd 'C:\Users\HP\Desktop\modex\-Ticket-Booking-System\backend'
npm install
npm run dev
```

Expected output:
```
Server started on port 5000
Database initialized successfully
```

### 3. Start Frontend Application

**Terminal 2 - Frontend:**
```powershell
cd 'C:\Users\HP\Desktop\modex\-Ticket-Booking-System\frontend'
npm install
npm start
```

Expected output:
- Browser opens automatically to `http://localhost:3000`
- React app loads with login page

## Usage

1. **Login Page** (`http://localhost:3000`)
   - Click "Login as User" or "Login as Admin" buttons (demo login)
   - Or enter custom user ID (anything) + toggle Admin checkbox

2. **User Workflow**
   - Browse shows on home page
   - Click "Book Now" on any show
   - Select seats from seat map
   - Click "Book Seats" → "Confirm Booking"
   - View bookings in "My Bookings" page

3. **Admin Workflow**
   - Login as Admin
   - Go to "Admin Dashboard"
   - Create new shows/trips/doctor appointments
   - View all created shows

## API Endpoints (Backend)

All endpoints at `http://localhost:5000/api`

### Shows
- `POST /shows` - Create show (admin)
- `GET /shows` - List all shows (optional query: `?category=show|bus|doctor`)
- `GET /shows/:id` - Get show details with seats
- `GET /shows/:id/available-seats` - Get available seats only

### Bookings
- `POST /bookings` - Create booking (reserve seats)
- `GET /bookings/:id` - Get booking details
- `POST /bookings/:id/confirm` - Confirm pending booking
- `GET /users/:userId/bookings` - Get user's bookings

### Health
- `GET /health` - Server health check

## Troubleshooting

### Backend won't start - "Cannot find module"
```
Solution: Delete node_modules/ and reinstall
cd backend
rm -r node_modules  (or del /s node_modules on Windows)
npm install
npm run dev
```

### Backend - "connect ECONNREFUSED 127.0.0.1:5432"
```
Issue: PostgreSQL not running
Solution: 
- Windows: Start PostgreSQL service from Services app
- Or: check if postgres process is running
- Run: psql -U postgres -h localhost
- If it connects, Postgres is running
```

### Backend - "Unknown extension: pgcrypto"
```
Issue: pgcrypto extension not enabled
Solution: Run as admin in psql:
psql -U postgres -h localhost
CREATE EXTENSION pgcrypto;
```

### Frontend - "Cannot GET /api/shows"
```
Issue: Backend not running or API URL wrong
Solution:
- Ensure backend is running (check Terminal 1)
- Verify API base URL is http://localhost:5000/api
- In frontend/.env: REACT_APP_API_BASE_URL=http://localhost:5000/api
```

### Frontend - "CORS error"
```
Issue: Backend CORS not configured correctly
Solution: Backend has cors() enabled - should work. Try:
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+Shift+R)
- Check backend logs for errors
```

### Port 3000 or 5000 already in use
```
Solution: Kill existing process

PowerShell:
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue).OwningProcess -Force
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue).OwningProcess -Force

Then restart npm dev / npm start
```

## Environment Variables

### Backend (backend/.env)
```
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=admin
PGDATABASE=postgres
PORT=5000
```

Or use DATABASE_URL:
```
DATABASE_URL=postgres://postgres:admin@localhost:5432/postgres
PORT=5000
```

### Frontend (frontend/.env)
```
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

## Project Structure

```
Ticket-Booking-System/
├── backend/
│   ├── src/
│   │   ├── index.ts           # Main server entry
│   │   ├── database/
│   │   │   ├── db.ts          # Postgres connection pool
│   │   │   └── schema.ts       # Database schema initialization
│   │   ├── controllers/
│   │   │   └── bookingController.ts  # Business logic (shows, bookings, seats)
│   │   ├── routes/
│   │   │   └── bookingRoutes.ts      # Express routes
│   │   ├── jobs/
│   │   │   └── bookingExpiryJob.ts   # Cron job for expired bookings
│   │   └── types/
│   │       └── index.ts       # TypeScript interfaces
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── index.tsx          # React entry
│   │   ├── App.tsx            # Main app + routing
│   │   ├── api/
│   │   │   └── apiClient.ts   # HTTP client with caching
│   │   ├── components/
│   │   │   ├── Navigation.tsx
│   │   │   ├── ShowCard.tsx
│   │   │   └── SeatSelector.tsx
│   │   ├── context/
│   │   │   ├── AuthContext.tsx       # User login state
│   │   │   └── BookingContext.tsx    # Shows/bookings state
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── ShowsList.tsx
│   │   │   ├── BookingPage.tsx
│   │   │   ├── MyBookings.tsx
│   │   │   └── AdminDashboard.tsx
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── styles/
│   │       └── *.css
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── README_SETUP.md (this file)
```

## Key Features

- **Concurrency Control**: Uses PostgreSQL SERIALIZABLE transactions + row-level locking for seat bookings
- **Automatic Cleanup**: Cron job marks expired bookings (>2 min) as FAILED and releases seats
- **Caching**: Frontend API client caches shows (5 min TTL)
- **Multi-tenant**: Supports different user roles (Admin, User)
- **Categories**: Shows support 3 categories (show, bus, doctor appointments)

## Scripts

### Backend
```
npm run dev     # Run with ts-node (dev mode)
npm run build   # Compile TypeScript to dist/
npm start       # Run compiled JavaScript (production)
npm test        # Run tests (if configured)
```

### Frontend
```
npm start       # Dev server + auto-reload (port 3000)
npm run build   # Production build to build/
npm test        # Run tests
```

## Common Development Tasks

### Add a New Show (Admin)
1. Login as Admin
2. Admin Dashboard → Create New Show/Trip/Slot
3. Fill form (name, date, seats, category)
4. Click "Create Show"
5. Show appears in table and browseable by users

### Test Seat Booking
1. Login as User
2. Click "Book Now" on any show
3. Select seats from visual map
4. "Book Seats" → "Confirm Booking"
5. Go to "My Bookings" to see confirmed booking

### View Database
```powershell
# Connect to postgres DB
psql -U postgres -h localhost

# List tables
\dt

# View shows
SELECT * FROM shows;

# View bookings
SELECT * FROM bookings;

# View seats for show
SELECT * FROM seats WHERE show_id = '<UUID>';
```

## Known Limitations

- Bookings auto-expire after 2 minutes if not confirmed
- No authentication (uses localStorage for demo)
- No payment processing (just booking reservations)
- UI optimized for desktop (mobile support limited)

## Performance Notes

- Database uses indexes on frequently queried columns
- Frontend caches shows for 5 minutes to reduce server hits
- Backend uses connection pooling (default 10 connections)
- Bookings use SERIALIZABLE isolation to prevent race conditions

## Support

If you encounter issues:
1. Check troubleshooting section above
2. Verify Node.js: `node --version` (should be v16+)
3. Verify npm: `npm --version` (should be v7+)
4. Verify Postgres: `psql -U postgres --version`
5. Check backend/frontend logs for error messages
6. Ensure ports 3000 and 5000 are not in use

---

**Last Updated:** December 11, 2025
**Version:** 1.0.0
