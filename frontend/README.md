# Ticket Booking System - Frontend

A React.js frontend application for the Ticket Booking System with admin and user views.

## Features

- **Authentication**: Demo login with User and Admin roles
- **User Features**:
  - Browse available shows/trips/slots
  - View detailed seat layout
  - Book seats with visual feedback
  - Track booking status (PENDING, CONFIRMED, FAILED)
  - View personal booking history
- **Admin Features**:
  - Create new shows/trips/slots
  - Manage show details
  - View all created shows
  - Real-time updates
- **Performance**: 
  - Client-side caching with 5-minute TTL
  - Context API for state management
  - Optimized re-renders
- **Error Handling**:
  - User-friendly error messages
  - Loading states
  - Form validation
  - API error handling

## Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **State Management**: Context API
- **Styling**: CSS3 with responsive design

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running on http://localhost:5000

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   Create/update `.env` file:
   ```
   REACT_APP_API_BASE_URL=http://localhost:5000/api
   ```

## Running the Application

### Development Mode
```bash
npm start
```
The app will open at `http://localhost:3000`

### Production Build
```bash
npm run build
```
Build files will be in the `build/` directory

### Testing
```bash
npm test
```

## Project Structure

```
src/
├── api/
│   └── apiClient.ts          # API calls with caching
├── components/
│   ├── Navigation.tsx        # Navigation bar
│   ├── ShowCard.tsx          # Show card component
│   └── SeatSelector.tsx      # Seat selection component
├── context/
│   ├── AuthContext.tsx       # Authentication state
│   └── BookingContext.tsx    # Booking state
├── pages/
│   ├── LoginPage.tsx         # Login/authentication
│   ├── AdminDashboard.tsx    # Admin features
│   ├── ShowsList.tsx         # Browse shows
│   ├── BookingPage.tsx       # Booking and seat selection
│   └── MyBookings.tsx        # User's bookings
├── styles/
│   ├── Navigation.css
│   ├── ShowCard.css
│   ├── SeatSelector.css
│   ├── LoginPage.css
│   ├── ShowsList.css
│   ├── BookingPage.css
│   ├── AdminDashboard.css
│   └── MyBookings.css
├── types/
│   └── index.ts              # TypeScript interfaces
├── App.tsx                   # Main app component
├── App.css                   # Global styles
└── index.tsx                 # React entry point
```

## Application Routes

```
/login          → Authentication page
/               → Browse shows (default page)
/booking/:id    → Book seats for a specific show
/my-bookings    → View user's bookings
/admin          → Admin dashboard (admin only)
```

## Key Components

### Navigation
- Displays user information
- Navigation links
- Logout functionality
- Admin indicator for admin users

### ShowCard
- Displays show information
- Shows category badge
- Displays date, time, and seat count
- Link to booking page
- Disables booking for past events

### SeatSelector
- Visual seat layout
- Seat status indicators (available, booked, selected)
- Row labels and screen indicator
- Prevents selecting more than max seats
- Displays selection summary

### Booking Page
- Seat selection interface
- Booking summary
- Status management (PENDING → CONFIRMED)
- 2-minute countdown for pending bookings
- Error handling and user feedback

### Admin Dashboard
- Form to create new shows
- Table listing all shows
- Category selection (show, bus, doctor)
- Form validation
- Real-time updates

### My Bookings
- Lists all user bookings
- Shows booking status with color coding
- Displays booked seats
- Shows expiration time for pending bookings
- Empty state when no bookings

## State Management

### AuthContext
```typescript
{
  userId: string | null,
  isAdmin: boolean,
  login(userId: string, isAdmin?: boolean),
  logout()
}
```

### BookingContext
```typescript
{
  shows: Show[],
  bookings: Booking[],
  selectedSeats: string[],
  loading: boolean,
  error: string | null,
  fetchShows(category?: string),
  fetchShowById(id: string),
  bookSeats(showId, userId, numberOfSeats, requestedSeats?),
  confirmBooking(bookingId),
  fetchUserBookings(userId),
  setSelectedSeats(seats),
  clearError()
}
```

## API Integration

All API calls are made through `apiClient.ts` which includes:

### Features
- Built-in caching (5-minute TTL)
- Automatic cache invalidation on mutations
- Error handling
- TypeScript typing
- Request timeout (10 seconds)

### Cached Endpoints
- `GET /shows` - Cached for 5 minutes
- `GET /shows/{id}` - Cached for 5 minutes
- `GET /shows/{id}/available-seats` - Cached for 1 minute
- `GET /users/{userId}/bookings` - Cached for 2 minutes

### Mutation Endpoints (No Cache)
- `POST /shows` - Create show
- `POST /bookings` - Create booking
- `POST /bookings/{id}/confirm` - Confirm booking

## Performance Optimizations

1. **Context API Usage**: Avoids prop drilling
2. **Memoization**: Components use React.FC for functional components
3. **Lazy Loading**: Routes support lazy loading (can be added)
4. **API Caching**: Client-side cache with TTL
5. **Optimized Renders**: Proper dependency arrays in hooks
6. **CSS Optimization**: External stylesheets for better caching

## Error Handling

1. **API Errors**: Display user-friendly messages
2. **Form Validation**: Real-time feedback
3. **Loading States**: Show loading indicators
4. **Empty States**: Display when no data available
5. **Concurrent Booking**: Handle booking conflicts gracefully

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Known Limitations

1. No real authentication - uses mock user IDs
2. Bookings are demo data - not persisted after logout
3. No real-time updates (could be added with WebSockets)
4. Limited to sequential number seat numbering (e.g., A1, A2)

## Assumptions

1. Backend API is running and accessible
2. User IDs can be any string (for demo purposes)
3. Shows are ordered by start time
4. Seat selection is optional (can auto-select)
5. Admin creates shows before users can book

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Deploy the build/ folder to Netlify
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables for Production
```
REACT_APP_API_BASE_URL=https://api.yourdomain.com
```

## Troubleshooting

### Port 3000 already in use
```bash
PORT=3001 npm start
```

### API calls failing
- Ensure backend is running on port 5000
- Check `REACT_APP_API_BASE_URL` in `.env`
- Check browser console for CORS errors

### Styling issues
- Clear browser cache
- Check CSS files are properly imported
- Verify CSS Modules or global imports

## Future Enhancements

1. Real-time updates with WebSockets
2. Payment gateway integration
3. User reviews and ratings
4. Advanced seat filtering
5. Booking history export
6. Email notifications
7. Mobile app version
8. Dark mode
9. Multi-language support
10. Accessibility improvements (WCAG 2.1)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

## License

ISC

## Support

For issues, questions, or suggestions, please create an issue on GitHub.
