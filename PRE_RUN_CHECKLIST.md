# Pre-Run Checklist

Use this checklist before running the application to ensure everything is set up correctly.

## System Prerequisites
- [ ] Windows OS with PowerShell
- [ ] Node.js v16+ installed (`node --version`)
- [ ] npm v7+ installed (`npm --version`)
- [ ] PostgreSQL v12+ installed and running
- [ ] PostgreSQL accessible from command line (`psql --version`)

## Database Setup
- [ ] PostgreSQL service is running
  - Windows: Services app → search "PostgreSQL" → verify Running
  - Or: `sc query postgresql` shows "RUNNING"
- [ ] Can connect to postgres: `psql -U postgres -h localhost -c "SELECT 1"`
  - Password should be `admin`
- [ ] pgcrypto extension enabled:
  - `psql -U postgres -h localhost -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"`
  - Or in pgAdmin: Query Tool → execute that command

## Project Setup
- [ ] Project location: `C:\Users\HP\Desktop\modex\-Ticket-Booking-System`
- [ ] Subdirectories exist:
  - [ ] `backend/` with `src/`, `package.json`, `tsconfig.json`
  - [ ] `frontend/` with `src/`, `public/`, `package.json`, `tsconfig.json`
- [ ] New files created:
  - [ ] `README_SETUP.md` (setup guide)
  - [ ] `CHANGES_SUMMARY.md` (this summary)
  - [ ] `QUICK_START.bat` (auto-start script)
  - [ ] `QUICK_START.ps1` (PowerShell script)
  - [ ] `backend/src/index.ts` (server entry)
  - [ ] `backend/.env.example` (env template)
  - [ ] `frontend/src/context/AuthContext.tsx` (auth context)
  - [ ] `frontend/.env.example` (env template)

## Pre-Flight Checks
- [ ] Ports 3000 and 5000 are not in use
  - `netstat -ano | findstr :3000` should show nothing
  - `netstat -ano | findstr :5000` should show nothing
- [ ] No other Postgres is running on port 5432
  - `netstat -ano | findstr :5432` should show postgres only

## Running the Application

### Quick Start (Recommended)
```powershell
cd 'C:\Users\HP\Desktop\modex\-Ticket-Booking-System'
.\QUICK_START.ps1
# Then wait for browser to open at http://localhost:3000
```

### Manual Start (If scripts don't work)
**Terminal 1:**
```powershell
cd 'C:\Users\HP\Desktop\modex\-Ticket-Booking-System\backend'
npm install --force
npm run dev
# Should show: Server started on port 5000
```

**Terminal 2:**
```powershell
cd 'C:\Users\HP\Desktop\modex\-Ticket-Booking-System\frontend'
npm install --force
npm start
# Should open browser at http://localhost:3000
```

## Verification After Starting

### Backend Checks
- [ ] Backend terminal shows: `Server started on port 5000`
- [ ] Backend terminal shows: `Database initialized successfully`
- [ ] No error messages in backend terminal
- [ ] Can access: `http://localhost:5000/api/health` (should return JSON)

### Frontend Checks
- [ ] Frontend terminal shows: `webpack compiled successfully`
- [ ] Browser automatically opens to `http://localhost:3000`
- [ ] Login page loads (see "Login as User" and "Login as Admin" buttons)
- [ ] No red errors in browser console (F12 → Console tab)

### Functional Checks
- [ ] Click "Login as User" → redirects to Shows page
- [ ] Click "Browse Shows" in navbar → shows list visible
- [ ] Click "Login as Admin" (different browser/logout first)
- [ ] Admin Dashboard tab visible in navbar
- [ ] Can fill show creation form without errors

## Common Issues & Fixes

### Backend won't start - "port 5000 already in use"
```powershell
# Find process using port 5000
Get-NetTCPConnection -LocalPort 5000 | Select-Object -ExpandProperty OwningProcess

# Kill it
Stop-Process -Id <PID> -Force

# Then restart backend
npm run dev
```

### "PostgreSQL connection failed"
```powershell
# Verify Postgres is running
Get-Service postgresql*

# If not running, start it
Start-Service postgresql-x64-15  # adjust version number

# Test connection
psql -U postgres -h localhost -c "SELECT 1"
```

### "pgcrypto not found" error in backend logs
```powershell
# Connect to Postgres and enable extension
psql -U postgres -h localhost
# Type in psql:
CREATE EXTENSION pgcrypto;
\q
```

### Frontend API calls fail (404 errors)
- [ ] Backend is running (check Terminal 1)
- [ ] Frontend .env has correct API URL: `REACT_APP_API_BASE_URL=http://localhost:5000/api`
- [ ] Clear browser cache: Ctrl+Shift+Delete
- [ ] Hard refresh: Ctrl+Shift+R

### npm install fails with permission errors
```powershell
# Use --force flag
npm install --force
```

### Too many open files / EMFILE error
```powershell
# Increase file watcher limit (Windows doesn't have this)
# Just restart the terminal and try again
```

## Success Indicators

✅ **You're ready to use the application when:**
1. Both terminals are running without errors
2. Browser shows login page at `http://localhost:3000`
3. You can click login buttons without errors
4. Shows page loads after login
5. No red error messages in browser console

## Database Verification

To verify database is properly initialized:
```powershell
psql -U postgres -h localhost

# In psql prompt:
\dt  # List all tables (should show: bookings, seats, shows)
SELECT COUNT(*) FROM shows;  # Should return 0 (empty initially)
```

## Next Steps After Successful Run

1. **Create a Show** (Admin)
   - Click "Login as Admin"
   - Go to "Admin Dashboard"
   - Fill in show details (name, date, seats)
   - Click "Create Show"

2. **Book a Show** (User)
   - Click "Login as User"
   - Click "Book Now" on any show
   - Select seats from map
   - Click "Book Seats" → "Confirm Booking"
   - View in "My Bookings"

3. **Monitor Database**
   - Keep a psql window open to watch data changes:
   ```powershell
   psql -U postgres -h localhost -d postgres -c "SELECT id, name, total_seats FROM shows;" --watch=2
   ```

## Performance Monitoring

Open browser DevTools (F12) and check:
- **Network tab**: API responses should be <200ms
- **Console tab**: No red errors, only info/warnings OK
- **Performance tab**: Frontend interactions should be responsive

## Troubleshooting Guide

See `README_SETUP.md` for detailed troubleshooting on:
- Database connection errors
- Port conflicts
- Missing dependencies
- CORS errors
- Authentication issues

---

**If everything checks out, you're ready to use the Ticket Booking System!**

For any issues, refer to `README_SETUP.md` or `CHANGES_SUMMARY.md`.
