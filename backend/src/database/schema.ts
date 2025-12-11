import pool from './db';

export const initializeDatabase = async () => {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create shows table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shows (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        start_time TIMESTAMP NOT NULL,
        total_seats INTEGER NOT NULL,
        category VARCHAR(50) NOT NULL DEFAULT 'show',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create seats table with version column for optimistic locking
    await pool.query(`
      CREATE TABLE IF NOT EXISTS seats (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
        seat_number VARCHAR(10) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'available',
        version INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(show_id, seat_number)
      );
    `);

    // Create bookings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
        user_id UUID NOT NULL,
        number_of_seats INTEGER NOT NULL,
        booked_seats TEXT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for better query performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_shows_start_time ON shows(start_time);
      CREATE INDEX IF NOT EXISTS idx_seats_show_id ON seats(show_id);
      CREATE INDEX IF NOT EXISTS idx_seats_status ON seats(status);
      CREATE INDEX IF NOT EXISTS idx_bookings_show_id ON bookings(show_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
      CREATE INDEX IF NOT EXISTS idx_bookings_expires_at ON bookings(expires_at);
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

export default pool;
