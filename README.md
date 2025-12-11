# Ticket Booking System - Full Stack Application

A production-ready ticket booking system with React frontend and Node.js/Express backend, featuring high concurrency handling, race condition prevention, and real-time seat availability.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Performance](#performance)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## 🎯 Project Overview

A complete ticket booking system similar to RedBus, BookMyShow, or Doctor Appointment booking platforms. The system handles high concurrency scenarios to prevent race conditions and overbooking.

### Key Capabilities

- **Concurrency Handling**: Prevents race conditions with database transactions and locking
- **Admin Management**: Create and manage shows/trips/slots
- **User Booking**: Browse, select seats, and book tickets
- **Real-time Status**: Track booking status (PENDING, CONFIRMED, FAILED)
- **Auto-expiry**: Pending bookings automatically fail after 2 minutes
- **Responsive UI**: Works on desktop and mobile devices

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│         React.js Frontend + TypeScript                       │
│  (Context API, React Router, Axios)                          │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTPS/REST API
┌──────────────────▼──────────────────────────────────────────┐
│                   API Gateway Layer                          │
│              Nginx/HAProxy (Load Balancer)                   │
│        (Rate Limiting, SSL Termination)                      │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│              Application Layer                               │
│      Express.js + Node.js + TypeScript                       │
│  (Business Logic, Validation, Authentication)                │
└──────────────────┬──────────────────────────────────────────┘
                   │ Connection Pool
┌──────────────────▼──────────────────────────────────────────┐
│              Data Layer                                      │
│     PostgreSQL (Master-Slave Replication)                    │
│  (ACID Transactions, Row-Level Locking)                      │
└─────────────────────────────────────────────────────────────┘
```

## ✨ Features

### Admin Features
- ✅ Create shows/trips/slots with details
- ✅ Set show date, time, and capacity
- ✅ View all created shows
- ✅ Category management (show, bus, doctor appointment)
- ✅ Real-time show updates

### User Features
- ✅ Browse available shows
- ✅ View seat layout with availability
- ✅ Select and book multiple seats
- ✅ Reserve seats with pending status
- ✅ Confirm booking within 2 minutes
- ✅ View booking history
- ✅ Track booking status

### Technical Features
- ✅ Database transaction isolation (SERIALIZABLE)
- ✅ Pessimistic locking to prevent overbooking
- ✅ Automatic booking expiry (2 minutes)
- ✅ API response caching (5-minute TTL)
- ✅ Error handling and validation
- ✅ Loading states and empty states
- ✅ Responsive design (mobile & desktop)
- ✅ TypeScript for type safety

## 🛠️ Technology Stack

### Frontend
- React 18.2.0
- TypeScript 5.0
- React Router DOM v6
- Axios for HTTP requests
- CSS3 with flexbox/grid
- Context API for state management

### Backend
- Node.js (v16+)
- Express.js 4.18
- TypeScript 5.0
- PostgreSQL 12+
- node-cron for job scheduling
- UUID for identifiers
- Swagger/OpenAPI for documentation

### Deployment
- Docker for containerization
- Render/Heroku/AWS for backend hosting
- Vercel/Netlify for frontend hosting
- PostgreSQL cloud services (AWS RDS, Supabase)

## 🚀 Quick Start

### 30-Second Setup

**Prerequisites:**
- Node.js v16+ and npm v7+
- PostgreSQL running locally with user `postgres` and password `admin`

**One-time DB setup:**
```powershell
# Enable pgcrypto extension (needed for UUID generation)
psql -U postgres -h localhost -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
```

**Run both services (Windows PowerShell):**

**Terminal 1 - Backend:**
```powershell
cd 'C:\Users\HP\Desktop\modex\-Ticket-Booking-System\backend'
npm install
npm run dev
```
Expected: `Server started on port 5000`

**Terminal 2 - Frontend:**
```powershell
cd 'C:\Users\HP\Desktop\modex\-Ticket-Booking-System\frontend'
npm install
npm start
```
Expected: Browser opens to `http://localhost:3000`

**Or use one of the quick-start scripts:**
```powershell
# Option A: Batch file (opens 2 command windows)
.\QUICK_START.bat

# Option B: PowerShell script (better feedback)
.\QUICK_START.ps1
```

Then:
1. Click "Login as User" or "Login as Admin" on the login page
2. Browse shows, book seats, or create shows as admin
3. Frontend connects to backend at `http://localhost:5000/api`

### Detailed Setup

For troubleshooting or alternative configurations, see **[README_SETUP.md](./README_SETUP.md)** for:
- Detailed PostgreSQL setup
- Environment variable options
- Troubleshooting common issues
- Docker setup (if preferred)
- Database schema details

### Manual Setup (if scripts fail)

**Backend:**
```bash
cd backend
npm install
# Optional: create .env from .env.example
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
set REACT_APP_API_BASE_URL=http://localhost:5000/api
npm start
```

Or create `frontend/.env`:
```
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

Then `npm start`

### Legacy Setup (Original)

If you prefer the original setup instructions with DATABASE_URL:

```bash
cd backend
# Install dependencies
npm install
# Configure environment
cp .env.example .env
# Edit .env with your database credentials
```

**Update `.env`:**
```
DATABASE_URL=postgresql://postgres:admin@localhost:5432/postgres
PORT=5000
```

**Start backend:**
```bash
npm run dev
```

Backend will be available at `http://localhost:5000`

**Frontend setup:**
```bash
cd frontend
# Install dependencies
npm install
# Configure environment
cat > .env << EOF
REACT_APP_API_BASE_URL=http://localhost:5000/api
EOF

# Start frontend
npm start
```

Frontend will open at `http://localhost:3000`

## 📁 Project Structure

```
-Ticket-Booking-System/
├── backend/
│   ├── src/
│   │   ├── index.ts                 # Main entry point
│   │   ├── database/
│   │   │   ├── db.ts               # Database connection
│   │   │   └── schema.ts           # Table schema initialization
│   │   ├── controllers/
│   │   │   └── bookingController.ts # Business logic
│   │   ├── routes/
│   │   │   └── bookingRoutes.ts    # API endpoints
│   │   ├── jobs/
│   │   │   └── bookingExpiryJob.ts # CRON job for expiry
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript interfaces
│   │   └── migrations/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   ├── README.md
│   ├── SYSTEM_DESIGN.md            # Detailed technical document
│   └── .gitignore
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── api/
│   │   │   └── apiClient.ts        # API calls with caching
│   │   ├── components/
│   │   │   ├── Navigation.tsx
│   │   │   ├── ShowCard.tsx
│   │   │   └── SeatSelector.tsx
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   └── BookingContext.tsx
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── ShowsList.tsx
│   │   │   ├── BookingPage.tsx
│   │   │   └── MyBookings.tsx
│   │   ├── styles/
│   │   │   ├── Navigation.css
│   │   │   ├── ShowCard.css
│   │   │   ├── SeatSelector.css
│   │   │   ├── LoginPage.css
│   │   │   ├── ShowsList.css
│   │   │   ├── BookingPage.css
│   │   │   ├── AdminDashboard.css
│   │   │   └── MyBookings.css
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── index.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   ├── README.md
│   └── .gitignore
│
├── LICENSE
└── README.md (this file)
```

## 📝 Setup Instructions

### Backend Setup Details

1. **Database Setup**
```bash
# Create PostgreSQL database
createdb ticket_booking_db

# Or connect to existing database
psql -U postgres -c "CREATE DATABASE ticket_booking_db;"
```

2. **Environment Configuration**
```bash
cat > backend/.env << EOF
DATABASE_URL=postgresql://user:password@localhost:5432/ticket_booking_db
PORT=5000
NODE_ENV=development
EOF
```

3. **Install and Build**
```bash
cd backend
npm install
npm run build
```

4. **Run Server**
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

The API will initialize tables automatically on startup.

### Frontend Setup Details

1. **Environment Configuration**
```bash
cat > frontend/.env << EOF
REACT_APP_API_BASE_URL=http://localhost:5000/api
EOF
```

2. **Install and Start**
```bash
cd frontend
npm install
npm start
```

3. **Test Production Build**
```bash
npm run build
npm install -g serve
serve -s build
```

## 🔌 API Documentation

### Swagger Documentation
Once backend is running, visit: `http://localhost:5000/api-docs`

### Key Endpoints

#### Shows Management
```
POST /api/shows
GET  /api/shows
GET  /api/shows/{id}
GET  /api/shows/{id}/available-seats
```

#### Booking Management
```
POST /api/bookings
GET  /api/bookings/{id}
POST /api/bookings/{id}/confirm
GET  /api/users/{userId}/bookings
```

#### Health Check
```
GET  /api/health
```

See `backend/README.md` for detailed API documentation.

## 🚀 Deployment

### Deploy Backend to Render

1. Push code to GitHub
2. Create account on Render.com
3. Create new PostgreSQL database
4. Create new Web Service
5. Connect GitHub repository
6. Set environment variables
7. Deploy

### Deploy Frontend to Vercel

```bash
cd frontend
npm run build
vercel --prod
```

Or connect GitHub to Vercel for automatic deployments.

### Docker Deployment

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

**Build and run:**
```bash
docker build -t ticket-booking-backend .
docker run -p 5000:5000 --env-file .env ticket-booking-backend
```

## ⚡ Performance

### Frontend Performance
- **Caching**: 5-minute API response caching
- **Tree Shaking**: Unused code removed in production
- **Code Splitting**: Routes can be lazy loaded
- **Minification**: CSS and JS minified in production

### Backend Performance
- **Database Indexing**: Strategic indexes on frequently queried columns
- **Connection Pooling**: Reuses database connections
- **Transaction Isolation**: SERIALIZABLE level for consistency
- **Optimistic Locking**: Optional for high-concurrency scenarios

### Scalability
- Horizontal scaling: Add more app servers
- Vertical scaling: Increase server resources
- Database replication: Read replicas for read queries
- Sharding: Distribute data across multiple databases

See `backend/SYSTEM_DESIGN.md` for detailed scaling strategies.

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

### Manual Testing

1. **Login as Admin**:
   - Click "Login as Admin"
   - Go to Admin Dashboard
   - Create a show

2. **Login as User**:
   - Click "Login as User"
   - Go to Browse Shows
   - Click "Book Now" on a show
   - Select seats
   - Confirm booking

3. **Test Concurrency**:
   - Open two browser windows
   - Try booking the same seats simultaneously
   - Verify only one succeeds

## 🐛 Troubleshooting

### Backend Issues

**Database connection error**
```
Check DATABASE_URL in .env
Verify PostgreSQL is running
Test connection: psql $DATABASE_URL
```

**Port 5000 already in use**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### Frontend Issues

**API calls failing**
```
Verify backend is running on port 5000
Check REACT_APP_API_BASE_URL in .env
Look for CORS errors in console
```

**Port 3000 already in use**
```bash
PORT=3001 npm start
```

## 📊 Metrics to Monitor

### Application Metrics
- Booking success rate
- Average response time
- Error rate
- Concurrent users

### Database Metrics
- Query latency
- Lock wait time
- Connection pool usage
- Replication lag

### Business Metrics
- Bookings per hour
- Revenue per show
- User conversion rate
- Cancellation rate

## 📚 Additional Documentation

- [Backend README](backend/README.md) - Detailed backend information
- [Frontend README](frontend/README.md) - Detailed frontend information
- [System Design Document](backend/SYSTEM_DESIGN.md) - Architecture and scaling

## 🔒 Security Considerations

1. **Input Validation**: All inputs validated on server
2. **SQL Injection Prevention**: Parameterized queries used
3. **CORS Configuration**: Restrict to allowed origins
4. **Rate Limiting**: Implement on API gateway
5. **HTTPS/TLS**: Use in production
6. **Authentication**: Implement real auth (JWT tokens)
7. **Authorization**: Role-based access control
8. **Data Encryption**: Encrypt sensitive data at rest

## 📝 License

This project is licensed under the ISC License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For issues, questions, or suggestions:
- Create an issue on GitHub
- Check existing documentation
- Review code comments

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [PostgreSQL Manual](https://www.postgresql.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

**Built with ❤️ for learning and production use**
