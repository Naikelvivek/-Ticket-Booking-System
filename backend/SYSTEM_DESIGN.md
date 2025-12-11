# Ticket Booking System - Technical Design Document

## Executive Summary

This document outlines the architecture, design decisions, and scaling strategies for a production-grade ticket booking system similar to RedBus or BookMyShow. The system is designed to handle high concurrency, prevent race conditions, and ensure data consistency.

## 1. System Architecture

### 1.1 High-Level Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        Client Layer                               │
│  (Web Browser, Mobile App, Admin Dashboard)                      │
└────────────┬─────────────────────────────────────────────────────┘
             │ HTTPS
┌────────────▼─────────────────────────────────────────────────────┐
│                    API Gateway / Load Balancer                    │
│  (Nginx, HAProxy, Cloud Load Balancer)                           │
└────────────┬─────────────────────────────────────────────────────┘
             │
┌────────────▼─────────────────────────────────────────────────────┐
│                   Application Server Cluster                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  │  Express Node 1  │  │  Express Node 2  │  │  Express Node N  │
│  │  (API Handler)   │  │  (API Handler)   │  │  (API Handler)   │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
│           │                     │                     │
│           └─────────────────────┼─────────────────────┘
└────────────┬─────────────────────────────────────────────────────┘
             │ Connection Pool (PgBouncer)
┌────────────▼─────────────────────────────────────────────────────┐
│                  Database Cluster (PostgreSQL)                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Primary Database (Write)                                   │  │
│  │  - Holds authoritative data                                │  │
│  │  - Manages transactions                                    │  │
│  │  - Executes writes                                         │  │
│  └────────────────────────────────────────────────────────────┘  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                 │
│  │ Replica 1  │  │ Replica 2  │  │ Replica N  │                 │
│  │ (Read)     │  │ (Read)     │  │ (Read)     │                 │
│  └────────────┘  └────────────┘  └────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Component Breakdown

#### API Gateway
- Route requests to appropriate backend services
- Rate limiting and DDoS protection
- SSL/TLS termination
- Request validation

#### Application Servers
- Express.js instances running on Node.js
- Handle business logic
- Validate requests
- Execute booking operations
- Respond to clients

#### Connection Pool (PgBouncer)
- Manages database connections
- Pools connections across multiple applications
- Reduces database connection overhead

#### Primary Database
- Single point of write (write master)
- Handles all transactional writes
- Maintains data consistency

#### Read Replicas
- Asynchronous replication from primary
- Handle read queries only
- Distributed geographically

#### Cache Layer (Optional)
- Redis for session and result caching
- In-memory store for quick retrieval
- Reduces database load

## 2. Database Design and Scaling

### 2.1 Core Tables

#### Shows Table
```sql
CREATE TABLE shows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  total_seats INTEGER NOT NULL,
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shows_start_time ON shows(start_time);
CREATE INDEX idx_shows_category ON shows(category);
```

#### Seats Table (Shardable by show_id)
```sql
CREATE TABLE seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  show_id UUID NOT NULL REFERENCES shows(id),
  seat_number VARCHAR(10) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'available',
  version INTEGER DEFAULT 0,  -- For optimistic locking
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(show_id, seat_number)
);

CREATE INDEX idx_seats_show_id_status ON seats(show_id, status);
CREATE INDEX idx_seats_status ON seats(status);
```

#### Bookings Table (Shardable by show_id)
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  show_id UUID NOT NULL REFERENCES shows(id),
  user_id UUID NOT NULL,
  number_of_seats INTEGER NOT NULL,
  booked_seats TEXT NOT NULL,  -- JSON array
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookings_show_id_status ON bookings(show_id, status);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_expires_at ON bookings(expires_at);
```

### 2.2 Scaling Strategies

#### Horizontal Scaling - Sharding

For massive scale (millions of shows/bookings):

**Sharding Strategy: Show ID Hash**

```
Shard Key: show_id (CRC32 modulo number of shards)

Example with 3 shards:
Shard 1: show_id % 3 == 0
Shard 2: show_id % 3 == 1
Shard 3: show_id % 3 == 2
```

**Shard Mapping Service**:
```
┌─────────────────────────────┐
│  Application               │
└────────┬────────────────────┘
         │ Query: show_id
         ▼
┌─────────────────────────────┐
│  Shard Router               │
│  (Redis or In-Memory Map)   │
└────────┬────────────────────┘
         │ Shard 1 | Shard 2 | Shard 3
         ▼
┌─────────────────────────────┐
│  PostgreSQL Instances       │
│  (Shard 1 | Shard 2 | Shard 3)
└─────────────────────────────┘
```

**Benefits**:
- Distributes load across multiple database instances
- Each shard handles subset of data
- Linear scalability

**Challenges**:
- Cross-shard queries (e.g., all shows) require aggregation
- Rebalancing when adding new shards
- Complex application logic

#### Vertical Scaling

1. **Increase database resources**:
   - Add CPU cores
   - Increase RAM (for buffer pool)
   - Use SSD storage

2. **Optimize queries**:
   - Use appropriate indexes
   - Avoid sequential scans
   - Use query explain plans

#### Read Replicas

```
Primary DB (Write Master)
    │
    ├──→ Replica 1 (Async)
    ├──→ Replica 2 (Async)
    └──→ Replica N (Async)
```

**Setup**:
- Configure streaming replication
- Set `wal_level = replica`
- Configure standby_mode on replicas

**Usage**:
- Route all READ queries to replicas
- Route all WRITE queries to primary
- Use read-write splitting at application level

### 2.3 Connection Pooling

Use PgBouncer between application and database:

```
┌─────────────────────────────┐
│  Application Instances (20) │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  PgBouncer (Connection Pool) │
│  - Default: 25 connections  │
│  - Max: varies by config    │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  PostgreSQL Server          │
│  - Reduced connection count │
│  - Better resource usage    │
└─────────────────────────────┘
```

## 3. Concurrency Control Mechanisms

### 3.1 Transaction Isolation Levels

PostgreSQL supports four isolation levels:

#### SERIALIZABLE (Used in booking)
```sql
BEGIN ISOLATION LEVEL SERIALIZABLE;
  -- All operations appear to execute sequentially
  -- Prevents all concurrency anomalies
  -- Highest safety, potential performance impact
COMMIT;
```

**Race Condition Prevention**:
- Dirty Read: ✓ Prevented
- Non-Repeatable Read: ✓ Prevented
- Phantom Read: ✓ Prevented
- Serialization Conflict: ✓ Prevented

### 3.2 Locking Mechanisms

#### Pessimistic Locking (Row-Level)
```sql
BEGIN ISOLATION LEVEL SERIALIZABLE;
  -- Lock seats for update
  SELECT * FROM seats 
  WHERE show_id = $1 AND status = 'available'
  FOR UPDATE
  LIMIT $2;
  
  -- No other transaction can modify these rows
  UPDATE seats SET status = 'booked' WHERE id = ANY($3);
COMMIT;
```

**Advantages**:
- Guarantees data consistency
- Prevents overbooking completely
- Simple to implement

**Disadvantages**:
- Can cause deadlocks under high load
- Reduced concurrency (serialized access)
- Blocking operations

#### Optimistic Locking (Version-Based)
```sql
-- Check version before update
UPDATE seats 
SET status = 'booked', version = version + 1
WHERE id = $1 AND version = $2;

-- If rows affected = 0, conflict occurred, retry
```

**Advantages**:
- Higher concurrency
- No lock overhead
- Good for low-conflict scenarios

**Disadvantages**:
- Requires retry logic
- Can lead to conflicts under high load
- More complex code

### 3.3 Booking Flow with Concurrency Protection

```
User Request to Book 2 Seats
           │
           ▼
┌─────────────────────────────┐
│ BEGIN SERIALIZABLE          │
│ Transaction                 │
└─────────────────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ SELECT show WHERE id=?      │
│ FOR UPDATE                  │
│ (Lock show row)             │
└─────────────────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ SELECT seats WHERE           │
│ show_id=? AND status='avail' │
│ FOR UPDATE LIMIT 2          │
│ (Lock seat rows)            │
└─────────────────────────────┘
           │
     ┌─────┴─────┐
     │           │
  ✓ Found   ✗ Not Found
     │           │
     ▼           ▼
  UPDATE     ROLLBACK
  Seats      → Return
           FAILED Status
     │
     ▼
┌─────────────────────────────┐
│ INSERT Booking              │
│ status = 'PENDING'          │
│ expires_at = now() + 2min   │
└─────────────────────────────┘
     │
     ▼
┌─────────────────────────────┐
│ COMMIT                      │
│ Release all locks           │
└─────────────────────────────┘
     │
     ▼
  Return Success/Failure
```

### 3.4 Preventing Deadlocks

**Deadlock Scenario**:
```
Transaction A: Lock Seat 1, tries to lock Seat 2
Transaction B: Lock Seat 2, tries to lock Seat 1
Result: DEADLOCK

Solution: Always lock in consistent order (by seat_id)
```

**Implementation**:
```sql
-- Good: Consistent ordering
SELECT * FROM seats 
WHERE show_id = $1 AND id IN ($2, $3, $4)
ORDER BY id  -- Always same order
FOR UPDATE;

-- Bad: Non-deterministic ordering
SELECT * FROM seats 
WHERE show_id = $1 AND seat_number IN ('A1', 'B2')
FOR UPDATE;
```

## 4. Caching Strategy

### 4.1 Multi-Level Caching

```
┌──────────────────────────────────────┐
│  Application (L1 Cache)              │
│  - In-memory (LRU)                   │
│  - TTL: 30 seconds                   │
│  - Size: 1000 entries                │
└──────────┬───────────────────────────┘
           │ Cache Miss
           ▼
┌──────────────────────────────────────┐
│  Redis (L2 Cache)                    │
│  - Distributed cache                 │
│  - TTL: 5 minutes                    │
│  - Replication for HA                │
└──────────┬───────────────────────────┘
           │ Cache Miss
           ▼
┌──────────────────────────────────────┐
│  Database (Persistent)               │
│  - Source of truth                   │
│  - Slower access                     │
└──────────────────────────────────────┘
```

### 4.2 Cache Invalidation Strategy

```
Event: New Booking Created
   │
   ├──→ Invalidate: Shows/{show_id}
   ├──→ Invalidate: Shows/{show_id}/AvailableSeats
   ├──→ Invalidate: AvailableSeatsCount/{show_id}
   └──→ Invalidate: User/{user_id}/Bookings
```

### 4.3 Cached Queries

```
GET /api/shows
  - Cache Key: "shows:all:{category}"
  - TTL: 5 minutes
  - Invalidate on: New show created

GET /api/shows/{id}/available-seats
  - Cache Key: "show:{id}:seats:available"
  - TTL: 1 minute
  - Invalidate on: Seat booked/released

GET /api/users/{id}/bookings
  - Cache Key: "user:{id}:bookings"
  - TTL: 2 minutes
  - Invalidate on: New booking
```

## 5. Message Queue Architecture (Optional)

For handling spike in concurrent bookings:

```
┌──────────────────┐
│  Booking Request │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Validate        │
│  Request         │
└────────┬─────────┘
         │
         ├──(Valid)──→ ┌──────────────────┐
         │             │  Publish to MQ   │
         │             │  (RabbitMQ/Kafka)│
         │             └────────┬─────────┘
         │                      │
         │              ┌───────┴────────┐
         │              │                │
         │              ▼                ▼
         │         Consumer 1      Consumer 2
         │              │                │
         │              ├──→ Process Booking
         │              ├──→ Update DB
         │              ├──→ Cache Update
         │              └──→ Send Confirmation
         │
         └──(Invalid)──→ Return Error
```

**Benefits**:
- Decouples booking request from processing
- Handles burst traffic
- Reliable message delivery
- Ability to retry failed bookings
- Horizontal scaling of workers

**Implementation**:
```javascript
// Producer
const booking = await createBooking(req.body);
await messageQueue.publish('bookings', booking);
res.json({ status: 'PENDING', id: booking.id });

// Consumer
messageQueue.subscribe('bookings', async (msg) => {
  try {
    await processBooking(msg);
    await confirmBooking(msg.id);
  } catch (error) {
    await failBooking(msg.id);
  }
});
```

## 6. High Availability & Disaster Recovery

### 6.1 Redundancy

```
┌─────────────────────────────────────────┐
│  Load Balancer (2 instances)            │
│  - Active-Passive failover              │
│  - Heartbeat monitoring                 │
└──────┬──────────────────────┬───────────┘
       │                      │
       ▼                      ▼
┌─────────────────┐  ┌─────────────────┐
│ App Cluster 1   │  │ App Cluster 2   │
│ (Region A)      │  │ (Region B)      │
└────────┬────────┘  └────────┬────────┘
         │                    │
         └────────┬───────────┘
                  │
         ┌────────┴────────┐
         │                 │
         ▼                 ▼
    ┌────────┐         ┌────────┐
    │ Primary│         │Standby │
    │ DB     │◄────────│DB      │
    │        │ Stream  │        │
    │(Writes)│Replication(Read)│
    └────────┘         └────────┘
```

### 6.2 Backup Strategy

```
Primary Database
      │
      ├──→ Real-time WAL Archiving
      ├──→ Nightly Full Backup (S3)
      └──→ Continuous Replication
```

## 7. Monitoring & Alerting

### Key Metrics to Monitor

```
Application Level:
- Request latency (p50, p95, p99)
- Error rate (4xx, 5xx)
- Bookings success rate
- Concurrent requests

Database Level:
- Query latency
- Lock contention
- Connection pool usage
- Replication lag
- Slow queries

Infrastructure:
- CPU usage
- Memory usage
- Disk I/O
- Network throughput
```

### Alert Triggers

```
- Booking success rate < 95%
- P99 latency > 2 seconds
- Database replication lag > 10 seconds
- Lock wait time > 5 seconds
- Error rate > 1%
```

## 8. Testing Strategy

### Load Testing

```
Simulate 10,000 concurrent bookings for same event:

Tool: Apache JMeter / Locust
Duration: 5 minutes
Ramp-up: 100 users/second

Expected Results:
- No overbooking (exact seat count matches)
- <5% failed bookings
- P99 latency < 2 seconds
- Zero data corruption
```

### Chaos Testing

```
1. Kill primary database
   - Verify failover to replica
   - Verify no data loss

2. Kill one app server
   - Verify load balancer redirects
   - Verify no booking loss

3. Introduce 1000ms network latency
   - Verify timeout handling
   - Verify transaction rollback
```

## 9. Security Considerations

1. **Authentication**: JWT tokens for user identification
2. **Authorization**: Role-based access control (Admin/User)
3. **Rate Limiting**: Prevent abuse and DDoS
4. **Input Validation**: Sanitize all inputs
5. **SQL Injection Prevention**: Use parameterized queries
6. **HTTPS/TLS**: Encrypt data in transit
7. **Data Encryption**: Encrypt sensitive data at rest

## 10. Cost Optimization

```
Option 1: Single Large Database
- Cost: $$
- Scalability: Limited
- Simplicity: High

Option 2: Primary + Read Replicas
- Cost: $$$
- Scalability: Medium
- Simplicity: Medium

Option 3: Sharded Database
- Cost: $$$$
- Scalability: High
- Simplicity: Low

Recommendation: Start with Option 2, migrate to Option 3 if needed
```

## 11. Migration Path to Production Scale

```
Phase 1 (0-100K users):
└─ Single server + PostgreSQL
   └─ Simple, cost-effective

Phase 2 (100K-1M users):
├─ Load balanced app servers
├─ Primary + Read replicas
└─ Redis caching

Phase 3 (1M+ users):
├─ Sharded database
├─ Message queue processing
├─ Multi-region deployment
└─ Advanced caching strategies
```

## Conclusion

This ticket booking system is designed with scalability, reliability, and high concurrency in mind. By using PostgreSQL transactions, appropriate locking mechanisms, and horizontal scaling strategies, the system can handle millions of concurrent bookings while preventing race conditions and ensuring data consistency.

The key to success is:
1. **Database transactions** for consistency
2. **Proper locking** to prevent race conditions
3. **Horizontal scaling** for capacity
4. **Caching** for performance
5. **Monitoring** for reliability
