# Installation & Setup Complete! 🎉

## ✅ What's Been Done

1. ✅ Node.js v25.2.1 installed
2. ✅ Backend dependencies installed (427 packages)
3. ✅ Frontend dependencies installed (1323 packages)
4. ✅ Quick Start guide created (QUICK_START.md)

---

## ⚠️ Next Step: Install PostgreSQL

The application requires PostgreSQL 12+ to run. Choose one option below:

### **Option 1: Install PostgreSQL Locally (Windows)**

#### Step 1: Download PostgreSQL
```
Go to: https://www.postgresql.org/download/windows/
Click "Download the installer"
Choose version 15 or 16 (latest stable)
Download the Windows installer
```

#### Step 2: Run Installer
- Double-click the downloaded .msi file
- Follow the installation wizard
- **Important**: Remember the password you set for "postgres" user
- Default port: 5432 (keep as default)
- At the end, uncheck "Stack Builder" if you don't need it

#### Step 3: Verify Installation
```powershell
# Open new PowerShell and run:
psql --version
# Should show: psql (PostgreSQL) 15.x or 16.x
```

#### Step 4: Create Database
```powershell
# Connect to PostgreSQL
psql -U postgres

# In psql prompt, create database:
CREATE DATABASE ticket_booking_db;

# Exit psql
\q
```

#### Step 5: Update Backend .env
Edit file: `c:\Users\HP\Desktop\modex\-Ticket-Booking-System\backend\.env`

Replace with:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/ticket_booking_db
PORT=5000
NODE_ENV=development
```

Where `YOUR_PASSWORD` is the password you set during PostgreSQL installation.

---

### **Option 2: Use Railway.app (Easiest - No Installation)**

#### Step 1: Create Railway Account
- Go to: https://railway.app/
- Click "Start a New Project"
- Sign up with GitHub

#### Step 2: Create PostgreSQL Database
- Click "Create" → Select "PostgreSQL"
- Railway will create a database for you instantly
- Click the PostgreSQL card to see details
- Copy the "DATABASE_URL" value

#### Step 3: Update Backend .env
Edit file: `c:\Users\HP\Desktop\modex\-Ticket-Booking-System\backend\.env`

Paste the DATABASE_URL you copied:
```env
DATABASE_URL=postgresql://user:password@host:port/railway
PORT=5000
NODE_ENV=development
```

---

### **Option 3: Use Supabase (Also Easy)**

#### Step 1: Create Supabase Account
- Go to: https://supabase.com/
- Sign up with GitHub
- Create a new project

#### Step 2: Get Connection String
- Go to Settings → Database → Connection Strings
- Copy "URI" (PostgreSQL)

#### Step 3: Update Backend .env
Edit file: `c:\Users\HP\Desktop\modex\-Ticket-Booking-System\backend\.env`

Paste:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_DOMAIN.supabase.co:5432/postgres
PORT=5000
NODE_ENV=development
```

---

### **Option 4: Use Docker (If Installed)**

```powershell
# Run PostgreSQL in Docker
docker run --name postgres_booking `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=ticket_booking_db `
  -p 5432:5432 `
  -d postgres:15

# Update backend/.env:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ticket_booking_db
```

---

## 🚀 After Database Setup

Once you've set up the database and updated `.env`, proceed to **QUICK_START.md**

Or run these commands directly:

### Terminal 1: Start Backend
```powershell
cd "c:\Users\HP\Desktop\modex\-Ticket-Booking-System\backend"
npm run dev
```

**Expected output:**
```
✓ Server running on http://localhost:5000
✓ Database connected
✓ API docs at http://localhost:5000/api-docs
```

### Terminal 2: Start Frontend
```powershell
cd "c:\Users\HP\Desktop\modex\-Ticket-Booking-System\frontend"
npm start
```

**Expected output:**
```
Compiled successfully!
Local: http://localhost:3000
```

---

## 📝 Demo Credentials

Once running, use these to test:

**Admin Account:**
- Email: admin@example.com
- Password: admin123

**User Account:**
- Email: user@example.com
- Password: user123

---

## 🔗 Access Points

After both servers start:

- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:5000/api-docs
- **API Base**: http://localhost:5000/api

---

## ✨ What You Can Do

### As Admin
- Create shows/trips/slots
- Set seat count
- Choose category
- View all created shows

### As User
- Browse available shows
- Select seats visually
- Book seats
- View booking history
- See auto-expiry (2 minutes)

### Test Concurrency
- Open same show in 2 browsers
- Both try to book same seat
- Only one succeeds ✓

---

## 📚 Documentation

Read these files for more info:
- `README.md` - Project overview
- `QUICK_START.md` - Detailed setup guide
- `DEPLOYMENT.md` - Production deployment
- `backend/README.md` - API documentation
- `PROJECT_SUMMARY.md` - Feature checklist

---

## ⏱️ Time to Run

- PostgreSQL install: ~5-10 minutes
- Database setup: ~2 minutes
- Backend start: ~3 seconds
- Frontend start: ~30 seconds
- **Total: ~15 minutes to full system running**

---

## 🎯 Recommended Path

1. **Install PostgreSQL** (Option 1 - takes 5 min but no dependencies)
   OR
   **Use Railway** (Option 2 - instant, no installation)

2. **Update backend/.env** with database URL

3. **Run both servers** (Terminal 1 & 2)

4. **Visit http://localhost:3000**

5. **Log in with demo credentials**

6. **Start testing!**

---

## ❓ Quick Troubleshooting

### Can't connect to database?
- Check DATABASE_URL in .env is correct
- Verify PostgreSQL is running
- Try with Railway/Supabase if local install fails

### Port already in use?
- Backend: Change PORT in .env
- Frontend: It will ask to use 3001

### Still having issues?
- Read `QUICK_START.md` section "Troubleshooting"
- Check database connection string format
- Ensure PostgreSQL is accessible

---

**Next Step: Install PostgreSQL and update the .env file!**

Then follow the running instructions above. You'll have a complete ticket booking system in minutes! 🚀
