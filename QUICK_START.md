# Quick Start Guide - Ticket Booking System

## ✅ Installation Complete!

Node.js v25.2.1 has been installed and dependencies are ready.

---

## 📋 Prerequisites

### Required
- ✅ Node.js 16+ (Installed: v25.2.1)
- ✅ npm 8+ (Installed with Node.js)
- ⚠️ PostgreSQL 12+ (Required - Not installed yet)

### Optional (For production)
- Docker
- Git

---

## 🚀 Getting Started

### Step 1: Set Up PostgreSQL Database

You need to install and set up PostgreSQL. Choose one of these options:

#### Option A: Install PostgreSQL Locally (Recommended for Development)
```powershell
# Download and install PostgreSQL from:
# https://www.postgresql.org/download/windows/
# During installation, remember the password you set for the 'postgres' user
```

#### Option B: Use Docker (If Docker is installed)
```powershell
docker run --name postgres_ticket_booking `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=ticket_booking_db `
  -p 5432:5432 `
  -d postgres:15
```

#### Option C: Use Online Database (Quick)
- Create free account at https://railway.app/ or https://supabase.com/
- Get your PostgreSQL connection string
- Copy it to `.env` file in backend folder

---

## 🔧 Configuration

### Backend Configuration

1. **Navigate to backend folder:**
```powershell
cd "c:\Users\HP\Desktop\modex\-Ticket-Booking-System\backend"
```

2. **Update `.env` file with your database:**
```env
# If using local PostgreSQL (default credentials: postgres/postgres)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ticket_booking_db
PORT=5000
NODE_ENV=development

# OR if using Railway/Supabase, paste the connection string:
# DATABASE_URL=postgresql://user:password@host:port/database
```

3. **The backend will auto-create database tables on startup** ✓

### Frontend Configuration

1. **Navigate to frontend folder:**
```powershell
cd "c:\Users\HP\Desktop\modex\-Ticket-Booking-System\frontend"
```

2. **Update `.env` file:**
```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

---

## ▶️ Running the Application

### Terminal 1: Start Backend Server

```powershell
cd "c:\Users\HP\Desktop\modex\-Ticket-Booking-System\backend"
npm run dev
```

Expected output:
```
✓ Server running on port 5000
✓ Database connected
✓ Swagger docs at http://localhost:5000/api-docs
```

### Terminal 2: Start Frontend Server

```powershell
cd "c:\Users\HP\Desktop\modex\-Ticket-Booking-System\frontend"
npm start
```

Expected output:
```
Compiled successfully!
You can now view react-app in the browser.
  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

---

## 🎯 Access the Application

Once both servers are running:

1. **Frontend (User Interface):**
   - URL: http://localhost:3000
   - Demo Admin Login: email: admin@example.com, password: admin123
   - Demo User Login: email: user@example.com, password: user123

2. **API Documentation (Swagger):**
   - URL: http://localhost:5000/api-docs
   - Explore all API endpoints
   - Test endpoints directly

3. **API Base URL:**
   - http://localhost:5000/api

---

## 📱 Using the Application

### As Admin
1. Log in with admin credentials
2. Navigate to "Admin Dashboard"
3. Create a new show/trip/slot with:
   - Show name and description
   - Date and time
   - Number of seats
   - Category (Concert, Movie, Sports, etc.)
4. View created shows in the list

### As User
1. Log in with user credentials
2. Browse available shows on "Shows List"
3. Click "Book Seats" on any show
4. Select seats visually (click seats to toggle)
5. Click "Confirm Booking"
6. View booking status in "My Bookings"
7. Bookings automatically expire after 2 minutes if not confirmed

---

## 🔄 Database Auto-Initialization

When the backend starts:
- ✅ Connects to PostgreSQL
- ✅ Creates `shows` table (if not exists)
- ✅ Creates `seats` table (if not exists)
- ✅ Creates `bookings` table (if not exists)
- ✅ Starts CRON job for booking expiry (every minute)
- ✅ Enables Swagger documentation

**No manual database setup needed!** The backend handles everything.

---

## 🛠️ Available npm Commands

### Backend
```powershell
cd backend

npm run dev          # Start development server with auto-reload
npm run build        # Build for production
npm run start        # Start production server
npm test             # Run tests (if configured)
```

### Frontend
```powershell
cd frontend

npm start            # Start development server
npm run build        # Build for production
npm run eject        # Eject from create-react-app (caution: irreversible)
```

---

## 📊 Features to Test

1. **Admin Features:**
   - ✓ Create multiple shows
   - ✓ View all created shows
   - ✓ See available seats count

2. **User Features:**
   - ✓ Browse shows by category
   - ✓ See seat layout visually
   - ✓ Select multiple seats
   - ✓ Book seats
   - ✓ View booking history
   - ✓ See booking status (PENDING, CONFIRMED, FAILED)

3. **Concurrency Features:**
   - ✓ Open same show in 2 browsers
   - ✓ Both users try to book same seats
   - ✓ Only one succeeds, other gets error
   - ✓ No overbooking possible

4. **Auto-Expiry Feature:**
   - ✓ Create booking
   - ✓ Don't confirm for 2 minutes
   - ✓ Status changes to FAILED automatically

---

## 🐛 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:** PostgreSQL is not running. Start it:
- Windows: Start "PostgreSQL xx" service from Services
- Docker: Run `docker start postgres_ticket_booking`

### Port 5000 Already in Use
```powershell
# Find process using port 5000
Get-NetTCPConnection -LocalPort 5000

# Change PORT in backend/.env to 5001 or another port
```

### Port 3000 Already in Use
```powershell
# Frontend will ask to use port 3001 instead
# Or stop process using 3000:
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

### npm install Legacy Peer Deps Error
```powershell
# Already handled! Frontend was installed with:
npm install --legacy-peer-deps
```

### TypeScript Errors in VS Code
- Close and reopen VS Code
- Or run: Ctrl+Shift+P → "TypeScript: Restart TS Server"

---

## 📚 Documentation Files

Read these for more details:

1. **README.md** - Project overview and architecture
2. **DEPLOYMENT.md** - Production deployment guide
3. **backend/README.md** - API documentation and setup
4. **frontend/README.md** - Frontend features and components
5. **backend/SYSTEM_DESIGN.md** - Scaling and concurrency details
6. **PROJECT_SUMMARY.md** - Complete feature checklist

---

## ✨ What's Already Installed

✅ **Backend:**
- Express.js server with TypeScript
- PostgreSQL connection with connection pooling
- 12 RESTful API endpoints
- Swagger API documentation
- Concurrency control with database transactions
- CRON job for booking expiry

✅ **Frontend:**
- React.js with TypeScript
- 5 pages (Login, Admin, Shows, Booking, My Bookings)
- 3 reusable components (Navigation, ShowCard, SeatSelector)
- Context API for state management
- API client with response caching
- Responsive mobile design

✅ **Database:**
- Shows table (name, description, date, category)
- Seats table (seat number, status, show reference)
- Bookings table (user, seats, status, expiry)
- Strategic indexes for performance
- Automatic table creation on startup

---

## 🚀 Next Steps After Verification

1. Test all features in development
2. Review API endpoints at http://localhost:5000/api-docs
3. Check database in PostgreSQL client (pgAdmin, DBeaver)
4. Read DEPLOYMENT.md for production setup
5. For production: Change NODE_ENV to "production"

---

## 📞 Support

If you encounter issues:

1. Check **Troubleshooting** section above
2. Read relevant documentation file
3. Verify all prerequisites are met
4. Check that both servers are running
5. Clear browser cache (Ctrl+Shift+Delete)
6. Restart both servers

---

**You're all set! Start the servers and enjoy the application! 🎉**

For detailed technical information, see other documentation files.
