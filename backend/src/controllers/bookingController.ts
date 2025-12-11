import pool from '../database/db';
import { Show, Seat, Booking, ApiResponse } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Shows Controller
export const createShow = async (
  name: string,
  description: string | undefined,
  startTime: Date,
  totalSeats: number,
  category: 'show' | 'bus' | 'doctor'
): Promise<Show> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO shows (name, description, start_time, total_seats, category)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, description, startTime, totalSeats, category]
    );

    const show = result.rows[0];

    // Create seats for this show
    const seatInsertValues = [];
    const seatParams = [];
    let paramCounter = 1;

    for (let i = 1; i <= totalSeats; i++) {
      const seatNumber = String.fromCharCode(65 + Math.floor((i - 1) / 10)) + ((i - 1) % 10 + 1);
      seatInsertValues.push(`($${paramCounter++}, $${paramCounter++}, $${paramCounter++})`);
      seatParams.push(show.id, seatNumber, 'available');
    }

    if (seatInsertValues.length > 0) {
      await client.query(
        `INSERT INTO seats (show_id, seat_number, status) VALUES ${seatInsertValues.join(', ')}`,
        seatParams
      );
    }

    await client.query('COMMIT');
    return show;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getShows = async (category?: string): Promise<Show[]> => {
  let query = 'SELECT * FROM shows';
  const params = [];

  if (category) {
    query += ' WHERE category = $1';
    params.push(category);
  }

  query += ' ORDER BY start_time ASC';

  const result = await pool.query(query, params);
  return result.rows;
};

export const getShowById = async (showId: string): Promise<Show | null> => {
  const result = await pool.query('SELECT * FROM shows WHERE id = $1', [showId]);
  return result.rows[0] || null;
};

export const getAvailableSeats = async (showId: string): Promise<Seat[]> => {
  const result = await pool.query(
    `SELECT * FROM seats WHERE show_id = $1 AND status = 'available' ORDER BY seat_number ASC`,
    [showId]
  );
  return result.rows;
};

export const getSeatsByShow = async (showId: string): Promise<Seat[]> => {
  const result = await pool.query(
    'SELECT * FROM seats WHERE show_id = $1 ORDER BY seat_number ASC',
    [showId]
  );
  return result.rows;
};

// Booking Controller with Concurrency Handling
export const bookSeats = async (
  showId: string,
  userId: string,
  numberOfSeats: number,
  requestedSeats?: string[]
): Promise<{ booking: Booking; success: boolean }> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

    // Lock the show row to prevent concurrent modifications
    const showResult = await client.query(
      'SELECT id FROM shows WHERE id = $1 FOR UPDATE',
      [showId]
    );

    if (!showResult.rows[0]) {
      throw new Error('Show not found');
    }

    // Validate user exists
    const userCheck = await client.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (!userCheck.rows[0]) {
      throw new Error('User not found');
    }

    // Get available seats with a lock
    let availableSeatsQuery = `
      SELECT id, seat_number FROM seats 
      WHERE show_id = $1 AND status = 'available' 
      FOR UPDATE
      LIMIT $2
    `;

    const params: any[] = [showId, numberOfSeats];

    if (requestedSeats && requestedSeats.length > 0) {
      availableSeatsQuery = `
        SELECT id, seat_number FROM seats 
        WHERE show_id = $1 AND status = 'available' AND seat_number = ANY($2)
        FOR UPDATE
      `;
      params.pop();
      params.push(requestedSeats);
    }

    const seatsResult = await client.query(availableSeatsQuery, params);
    const bookedSeats = seatsResult.rows;

    if (bookedSeats.length < numberOfSeats) {
      await client.query('ROLLBACK');
      return {
        booking: {
          id: uuidv4(),
          show_id: showId,
          user_id: userId,
          number_of_seats: numberOfSeats,
          booked_seats: [],
          status: 'FAILED',
          created_at: new Date(),
          updated_at: new Date(),
        },
        success: false,
      };
    }

    // Update seats status
    const seatIds = bookedSeats.map((s: any) => s.id);
    await client.query(
      'UPDATE seats SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = ANY($2)',
      ['booked', seatIds]
    );

    // Create booking record
    const bookingId = uuidv4();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now
    const seatNumbers = bookedSeats.map((s: any) => s.seat_number);

    const bookingResult = await client.query(
      `INSERT INTO bookings (id, show_id, user_id, number_of_seats, booked_seats, status, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        bookingId,
        showId,
        userId,
        numberOfSeats,
        JSON.stringify(seatNumbers),
        'PENDING',
        expiresAt,
      ]
    );

    await client.query('COMMIT');

    const booking = bookingResult.rows[0];
    booking.booked_seats = seatNumbers;

    return { booking, success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const confirmBooking = async (bookingId: string): Promise<Booking> => {
  const result = await pool.query(
    `UPDATE bookings 
     SET status = 'CONFIRMED', updated_at = CURRENT_TIMESTAMP 
     WHERE id = $1 AND status = 'PENDING'
     RETURNING *`,
    [bookingId]
  );

  if (result.rows.length === 0) {
    throw new Error('Booking not found or already confirmed');
  }

  return result.rows[0];
};

export const getBookingById = async (bookingId: string): Promise<Booking | null> => {
  const result = await pool.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
  return result.rows[0] || null;
};

export const getBookingsByUser = async (userId: string): Promise<Booking[]> => {
  const result = await pool.query(
    'SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
};

export const getAllBookings = async (): Promise<any[]> => {
  const result = await pool.query(
    `SELECT b.*, u.username FROM bookings b LEFT JOIN users u ON b.user_id = u.id ORDER BY b.created_at DESC`
  );
  return result.rows;
};

export const markExpiredBookingsAsFailed = async (): Promise<number> => {
  const result = await pool.query(
    `UPDATE bookings 
     SET status = 'FAILED', updated_at = CURRENT_TIMESTAMP 
     WHERE status = 'PENDING' AND expires_at < CURRENT_TIMESTAMP
     RETURNING id`
  );

  if (result.rows.length > 0) {
    // Release the booked seats back to available
    const bookingIds = result.rows.map((row: any) => row.id);
    await pool.query(
      `UPDATE seats 
       SET status = 'available', updated_at = CURRENT_TIMESTAMP 
       WHERE id IN (
         SELECT id FROM seats WHERE show_id IN (
           SELECT show_id FROM bookings WHERE id = ANY($1)
         ) AND status = 'booked'
       )`,
      [bookingIds]
    );
  }

  return result.rows.length;
};
