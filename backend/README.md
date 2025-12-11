# Ticket Booking System - Backend

A Node.js/Express backend for a high-concurrency ticket booking system with race condition prevention and transaction handling.

## Features

- **Admin functionality**: Create shows/trips/slots with specific details
- **User functionality**: Browse available shows and book seats
- **Concurrency Control**: Prevents race conditions and overbooking using database transactions
- **Booking Expiry**: Automatically marks pending bookings as failed after 2 minutes
- **RESTful API**: Full API documentation with Swagger/OpenAPI

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **API Documentation**: Swagger/OpenAPI
- **Job Scheduling**: node-cron

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Setup environment variables**:
   Create a `.env` file in the backend directory:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/ticket_booking_db
   PORT=5000
   NODE_ENV=development
   ```

4. **Create PostgreSQL database**:
   ```bash
   createdb ticket_booking_db
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## API Documentation

Once the server is running, visit `http://localhost:5000/api-docs` to see the Swagger UI documentation.

## API Endpoints

### Shows Management

#### Create Show
```
POST /api/shows
Content-Type: application/json

{
  "name": "Concert Night",
  "description": "Amazing concert",
  "start_time": "2024-12-25T19:00:00Z",
  "total_seats": 100,
  "category": "show"
}
```

#### Get All Shows
```
GET /api/shows?category=show
```

#### Get Show Details
```
GET /api/shows/{id}
```

#### Get Available Seats
```
GET /api/shows/{id}/available-seats
```

### Booking Management

#### Create Booking
```
POST /api/bookings
Content-Type: application/json

{
  "show_id": "uuid",
  "user_id": "uuid",
  "number_of_seats": 2,
  "requested_seats": ["A1", "A2"]
}
```

#### Get Booking
```
GET /api/bookings/{id}
```

#### Confirm Booking
```
POST /api/bookings/{id}/confirm
```

#### Get User Bookings
```
GET /api/users/{userId}/bookings
```

## Concurrency Handling Strategy

### Database-Level Concurrency Control

1. **Pessimistic Locking**: Uses `FOR UPDATE` to lock seat rows during transaction
2. **Serializable Isolation Level**: Ensures complete transaction isolation
3. **Atomic Operations**: All seat updates happen in a single transaction

### Transaction Flow

```
BEGIN ISOLATION LEVEL SERIALIZABLE
  → Lock show row
  → Lock and select available seats
  → Update seat status
  → Create booking record
  → Set expiry time
COMMIT
```

### Key Components

- **Seats Table**: Each seat has a version column for optimistic locking if needed
- **Bookings Table**: Tracks pending, confirmed, and failed bookings
- **Expiry Job**: CRON job runs every minute to mark expired bookings as failed

## System Design Document

### High-Level Architecture

```
┌─────────────────┐
│  Client (Web)   │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────────────────────────────┐
│  Express.js Application Server          │
│  - Authentication                       │
│  - Request Validation                   │
│  - Business Logic                       │
│  - Error Handling                       │
└────────┬────────────────────────────────┘
         │ TCP Connection Pool
         ▼
┌─────────────────────────────────────────┐
│  PostgreSQL Database                    │
│  - ACID Transactions                    │
│  - Row-Level Locking                    │
│  - Indexes for Performance              │
└─────────────────────────────────────────┘
```

### Database Design

#### Shows Table
- `id`: UUID (Primary Key)
- `name`: VARCHAR(255)
- `description`: TEXT
- `start_time`: TIMESTAMP
- `total_seats`: INTEGER
- `category`: VARCHAR(50) (show/bus/doctor)

#### Seats Table
- `id`: UUID (Primary Key)
- `show_id`: UUID (Foreign Key)
- `seat_number`: VARCHAR(10)
- `status`: VARCHAR(20) (available/booked/reserved)
- `version`: INTEGER (for optimistic locking)
- **Index**: (show_id, status) for fast queries

#### Bookings Table
- `id`: UUID (Primary Key)
- `show_id`: UUID (Foreign Key)
- `user_id`: UUID
- `number_of_seats`: INTEGER
- `booked_seats`: TEXT (JSON array)
- `status`: VARCHAR(20) (PENDING/CONFIRMED/FAILED)
- `expires_at`: TIMESTAMP
- **Index**: (show_id, status), (user_id), (expires_at)

### Concurrency Control Mechanisms

#### 1. Pessimistic Locking
- Locks rows immediately upon transaction start
- Prevents dirty reads and race conditions
- Best for high-contention scenarios

#### 2. Transaction Isolation
- Uses `SERIALIZABLE` isolation level
- Prevents all types of concurrency issues
- Slight performance trade-off for data consistency

#### 3. Optimistic Locking
- Version column in seats table for future implementation
- Reduces lock contention in low-conflict scenarios
- Can be switched to if performance becomes critical

### Scaling Strategy

#### Horizontal Scaling

1. **Read Replicas**: Set up PostgreSQL read replicas
   - Distribute read queries (GET shows, available seats)
   - Primary handles writes (bookings)

2. **Connection Pooling**: Use PgBouncer or similar
   - Manages database connections efficiently
   - Prevents connection exhaustion

3. **Load Balancing**: Deploy multiple Express instances
   - Use Nginx or HAProxy
   - Route requests to healthy instances

#### Vertical Scaling

1. **Database Indexing**: Optimize query performance
2. **Query Optimization**: Use efficient queries with minimal scans
3. **Server Resources**: Increase CPU/Memory for database and application

#### Database Sharding

For very large datasets:

```
Shard Key: show_id (consistent hashing)

Shard 1: Shows A-F
  ├── Seats
  ├── Bookings

Shard 2: Shows G-M
  ├── Seats
  ├── Bookings

Shard 3: Shows N-Z
  ├── Seats
  └── Bookings
```

### Caching Strategy

1. **Redis Cache**:
   - Cache show listings (TTL: 5 minutes)
   - Cache available seat counts (TTL: 1 minute)
   - Invalidate on booking

2. **Application-Level Caching**:
   - In-memory cache for category list
   - LRU cache for frequently accessed shows

3. **CDN for Static Content**:
   - API responses for read-heavy operations

### Message Queue Usage (Optional)

For decoupling critical operations:

```
Booking Flow:
1. User submits booking → Express validates
2. Sends to RabbitMQ/Kafka
3. Worker processes booking
4. Updates database
5. Sends confirmation

Benefits:
- Handles spike in concurrent requests
- Reliable message delivery
- Asynchronous processing
- Better fault tolerance
```

## Booking Status Flow

```
┌─────────────┐
│   PENDING   │
└──────┬──────┘
       │
       ├──(User confirms)──→ CONFIRMED
       │
       └──(2 minutes)────────→ FAILED
```

## Error Handling

### Client Errors (4xx)
- 400: Bad Request (validation errors)
- 404: Not Found (resource doesn't exist)
- 409: Conflict (concurrency issue)

### Server Errors (5xx)
- 500: Internal Server Error (database errors, etc.)

## Testing

Run tests with:
```bash
npm test
```

## Deployment

### Docker Deployment

Build image:
```bash
docker build -t ticket-booking-backend .
```

Run container:
```bash
docker run -p 5000:5000 --env-file .env ticket-booking-backend
```

### Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)

## Future Enhancements

1. Implement Redis caching
2. Add message queue support (RabbitMQ/Kafka)
3. Implement WebSocket for real-time updates
4. Add authentication and authorization
5. Implement payment gateway integration
6. Add analytics and reporting
7. Database replication and failover
8. Implement circuit breaker pattern

## License

ISC
