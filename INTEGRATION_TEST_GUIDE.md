# Integration Test Guide - Manual Testing Steps

This guide shows how to manually test the complete application workflow end-to-end.

## Test Environment
- **Backend:** http://localhost:5000/api
- **Frontend:** http://localhost:3000
- **Database:** PostgreSQL on localhost:5432 (user: postgres, password: admin)

## Pre-Test Requirements
- [ ] Backend running: `npm run dev` in backend/
- [ ] Frontend running: `npm start` in frontend/
- [ ] PostgreSQL running and accessible
- [ ] pgcrypto extension enabled

## Test Suite 1: Authentication & Navigation

### Test 1.1: User Demo Login
**Steps:**
1. Open http://localhost:3000
2. Click "👤 Login as User" button
3. **Expected:** Redirected to Shows list page, see "Browse Shows" and "My Bookings" in navbar

**Verify:**
- [ ] Login page disappears
- [ ] Shows list page loads
- [ ] Navbar shows user ID (truncated)
- [ ] Navigation menu has: Browse Shows, My Bookings, Logout

### Test 1.2: Admin Demo Login
**Steps:**
1. Click Logout
2. Click "👨‍💼 Login as Admin" button
3. **Expected:** Redirected to Shows list, see Admin Dashboard in navbar

**Verify:**
- [ ] Admin badge shows in navbar
- [ ] "Admin Dashboard" link visible in navbar
- [ ] Can click "Admin Dashboard" and form loads

### Test 1.3: Custom User Login
**Steps:**
1. Click Logout
2. Enter any text in "User ID" field (e.g., "testuser123")
3. Optionally check "Login as Admin" checkbox
4. Click Login button
5. **Expected:** Uses custom user ID

**Verify:**
- [ ] Custom user ID shows in navbar
- [ ] Admin badge only shows if checkbox was checked
- [ ] Redirects to shows list

---

## Test Suite 2: Show Management (Admin)

### Test 2.1: Create Show
**Setup:** Login as Admin

**Steps:**
1. Click "Admin Dashboard" in navbar
2. Fill form:
   - Show Name: "Concert Night 2025"
   - Description: "Live music concert"
   - Date & Time: Pick a future date/time
   - Total Seats: 100
   - Category: "show"
3. Click "Create Show"
4. **Expected:** Success message, show appears in table below

**Verify:**
- [ ] Form clears after submit
- [ ] "Show created successfully!" message appears
- [ ] New show appears in table with correct details
- [ ] Table shows: Name, Category, Date & Time, Total Seats, Status

### Test 2.2: Create Multiple Categories
**Steps:**
1. Repeat Test 2.1 three times with:
   - Category: "bus" (Show Name: "Bus to Mumbai")
   - Category: "doctor" (Show Name: "Dr. Smith Appointment")
   - Category: "show" (Show Name: "Movie Night")
2. **Expected:** All shows appear in table with correct categories

**Verify:**
- [ ] Shows have correct category badges
- [ ] Shows sorted by date
- [ ] Status shows "Upcoming" or "Passed" (based on date)

### Test 2.3: View Shows in Different Categories
**Steps:**
1. Click "Browse Shows" in navbar
2. (Note: Category filter not shown in UI, but all shows should appear)
3. **Expected:** All admin-created shows visible

**Verify:**
- [ ] Shows from all categories visible
- [ ] Show cards display: name, description, date/time, seats
- [ ] "Book Now" button visible for upcoming shows
- [ ] "Event Passed" button disabled for past shows

---

## Test Suite 3: Seat Booking Flow (User)

### Test 3.1: Browse and View Show
**Setup:** Login as User, have at least one upcoming show created

**Steps:**
1. Click "Browse Shows"
2. Click "Book Now" on any upcoming show
3. **Expected:** Redirected to booking page with seat map

**Verify:**
- [ ] Show name and date visible
- [ ] Seat grid displays (rows A-Z, columns 1-10)
- [ ] Screen icon visible at top
- [ ] Legend shows: Available (green), Booked (red), Selected (blue)

### Test 3.2: Select Seats
**Steps:**
1. Click on 3 available (green) seats
2. **Expected:** Seats turn blue/selected color
3. Watch bottom section: "Selected Seats: A1, A2, A3"

**Verify:**
- [ ] Selected seats change color
- [ ] Summary updates: "Number of Seats: 3"
- [ ] Can select up to 10 seats max
- [ ] Cannot select booked (red) seats

### Test 3.3: Cannot Exceed Max Seats
**Steps:**
1. Try to select 11+ seats
2. **Expected:** Cannot click after 10 selected

**Verify:**
- [ ] 11th seat click has no effect
- [ ] Summary shows: "Seats Remaining: 0"

### Test 3.4: Book Seats
**Steps:**
1. Select 3 seats
2. Click "Book Seats" button in summary
3. **Expected:** Booking created, button changes to "Confirm Booking" with timer warning

**Verify:**
- [ ] ⏰ "Booking pending - confirm within 2 minutes" message shows
- [ ] "Confirm Booking" button available
- [ ] "Cancel" button to cancel booking

### Test 3.5: Confirm Booking
**Steps:**
1. Click "Confirm Booking"
2. **Expected:** Alert: "Booking confirmed successfully!"
3. Redirected back to shows list

**Verify:**
- [ ] Success message appears
- [ ] Button disabled during confirmation
- [ ] Redirects after confirmation
- [ ] Booking status changes from PENDING to CONFIRMED

### Test 3.6: Booking Expiry (Advanced)
**Steps:**
1. Create a booking but don't confirm for 2+ minutes
2. Try to confirm after 2 minutes
3. **Expected:** Error: "Booking not found or already confirmed"

**Verify:**
- [ ] System marks expired bookings as FAILED
- [ ] Seats released back to available
- [ ] Error message on confirmation attempt

---

## Test Suite 4: View Bookings

### Test 4.1: View User Bookings
**Setup:** Have at least one confirmed booking

**Steps:**
1. Click "My Bookings" in navbar
2. **Expected:** See list of user's bookings

**Verify:**
- [ ] Booking cards display with ID (truncated)
- [ ] Status badge shows: CONFIRMED (green), PENDING (yellow), FAILED (red)
- [ ] Shows: Show ID, Seats, Number of Seats, Booked On date
- [ ] Shows expiry time for PENDING bookings

### Test 4.2: No Bookings State
**Setup:** Login as new user (no prior bookings)

**Steps:**
1. Click "My Bookings"
2. **Expected:** "No bookings found" message with link to browse

**Verify:**
- [ ] Empty state message
- [ ] "Browse Shows" link clickable

---

## Test Suite 5: API Testing (Backend)

### Test 5.1: Health Check
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/health" -Method GET
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Server is running"
}
```

**Verify:** [ ] Status 200, success is true

### Test 5.2: Get All Shows
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/shows" -Method GET
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Concert Night 2025",
      "description": "...",
      "start_time": "2025-12-25T18:00:00.000Z",
      "total_seats": 100,
      "category": "show",
      "created_at": "...",
      "updated_at": "..."
    }
  ]
}
```

**Verify:**
- [ ] Status 200
- [ ] Array of shows returned
- [ ] Each show has all required fields

### Test 5.3: Get Show with Seats
```powershell
# Replace {showId} with actual ID from previous test
Invoke-WebRequest -Uri "http://localhost:5000/api/shows/{showId}" -Method GET
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "...",
    "seats": [
      {
        "id": "uuid",
        "show_id": "uuid",
        "seat_number": "A1",
        "status": "available",
        "version": 0,
        "created_at": "...",
        "updated_at": "..."
      }
    ]
  }
}
```

**Verify:**
- [ ] Status 200
- [ ] Show includes seats array
- [ ] Each seat has status (available/booked/reserved)

### Test 5.4: Create Booking (API)
```powershell
$body = @{
    show_id = "your-show-uuid"
    user_id = "test-user-123"
    number_of_seats = 2
    requested_seats = @("A1", "A2")
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/bookings" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "booking-uuid",
    "show_id": "...",
    "user_id": "test-user-123",
    "number_of_seats": 2,
    "booked_seats": ["A1", "A2"],
    "status": "PENDING",
    "created_at": "...",
    "expires_at": "2025-12-11T10:05:00.000Z",
    "updated_at": "..."
  }
}
```

**Verify:**
- [ ] Status 201 (Created)
- [ ] Booking has PENDING status
- [ ] expires_at is 2 minutes from now
- [ ] booked_seats matches requested

### Test 5.5: Confirm Booking (API)
```powershell
# Replace {bookingId} with UUID from previous test
Invoke-WebRequest -Uri "http://localhost:5000/api/bookings/{bookingId}/confirm" `
  -Method POST
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "booking-uuid",
    "status": "CONFIRMED",
    ...
  }
}
```

**Verify:**
- [ ] Status 200
- [ ] Status changed to CONFIRMED
- [ ] No expires_at or expires_at cleared

---

## Test Suite 6: Database Verification

### Test 6.1: Verify Database State
```powershell
# Connect to PostgreSQL
psql -U postgres -h localhost -d postgres

# In psql:
SELECT COUNT(*) as show_count FROM shows;
SELECT COUNT(*) as booking_count FROM bookings;
SELECT COUNT(*) as seat_count FROM seats;
SELECT COUNT(DISTINCT status) FROM bookings;
```

**Expected:**
- [ ] Shows created = match admin dashboard count
- [ ] Bookings = match "My Bookings" count
- [ ] Seats = total_seats × number_of_shows
- [ ] Booking statuses include: PENDING, CONFIRMED, FAILED (if expired)

### Test 6.2: Check Seat Status After Booking
```powershell
# In psql:
SELECT show_id, seat_number, status FROM seats 
WHERE show_id = 'uuid' AND status != 'available' LIMIT 5;
```

**Expected:**
- [ ] Booked seats show status='booked'
- [ ] Count matches number of confirmed bookings for that show

### Test 6.3: View Indexes
```powershell
# In psql:
\d shows  # Should show idx_shows_start_time index
\d seats  # Should show idx_seats_show_id, idx_seats_status
\d bookings  # Should show various indexes
```

**Expected:**
- [ ] Indexes exist on frequently queried columns
- [ ] No error messages

---

## Test Suite 7: Error Handling

### Test 7.1: Invalid Show ID
**Steps:**
1. Manually go to http://localhost:3000/booking/invalid-uuid
2. **Expected:** Loading then "Loading show details..." message

**Verify:**
- [ ] Graceful handling of invalid ID
- [ ] No error in console

### Test 7.2: Insufficient Seats
**Steps:**
1. Create show with 3 total seats
2. Try to book 5 seats
3. **Expected:** Error message "Not enough available seats"

**Verify:**
- [ ] Error displays in booking summary
- [ ] Button shows error state
- [ ] Can select fewer seats and retry

### Test 7.3: Backend Error Handling
**Steps:**
1. Stop PostgreSQL service
2. Try to load shows
3. **Expected:** Frontend shows error: "Failed to fetch shows"

**Verify:**
- [ ] Error banner appears
- [ ] Console shows network error
- [ ] Page doesn't crash

---

## Performance Tests (Optional)

### Test P1: Load Time
- [ ] Shows page loads in <1 second
- [ ] Booking page with 100+ seats loads in <2 seconds
- [ ] API health check <100ms

### Test P2: Concurrent Bookings
**Setup:** Multiple users/browsers

**Steps:**
1. Open http://localhost:3000 in 2 browser windows
2. Both users select same seats on same show
3. Both try to book simultaneously

**Expected:** Only one succeeds, other gets insufficient seats error

**Verify:**
- [ ] Race condition prevented by database locking
- [ ] Seat status correctly updated in database

---

## Cleanup After Testing

### Clear Demo Data
```powershell
# In psql, if you want to reset:
DELETE FROM bookings;
DELETE FROM seats;
DELETE FROM shows;

# Verify:
SELECT COUNT(*) FROM shows;  # Should be 0
```

### Restart Services
```powershell
# Terminal 1:
Ctrl+C  # Stop backend

# Terminal 2:
Ctrl+C  # Stop frontend

# Restart:
npm run dev   # backend
npm start     # frontend
```

---

## Test Report Template

Use this to document your test results:

```
Date: [DATE]
Backend: [RUNNING/FAILED]
Frontend: [RUNNING/FAILED]
Database: [CONNECTED/FAILED]

Test Suite 1: [PASS/FAIL] - X/Y tests passed
Test Suite 2: [PASS/FAIL] - X/Y tests passed
Test Suite 3: [PASS/FAIL] - X/Y tests passed
Test Suite 4: [PASS/FAIL] - X/Y tests passed
Test Suite 5: [PASS/FAIL] - X/Y tests passed
Test Suite 6: [PASS/FAIL] - X/Y tests passed
Test Suite 7: [PASS/FAIL] - X/Y tests passed
Test Suite P: [PASS/FAIL] - Performance acceptable

Overall: [PASS/FAIL]
Notes: [Any issues or observations]
```

---

**All tests passed? Your Ticket Booking System is ready for use!**

For issues, check:
- Browser console (F12)
- Backend terminal logs
- PostgreSQL logs
- README_SETUP.md troubleshooting
