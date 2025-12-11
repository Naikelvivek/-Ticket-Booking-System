import express, { Router, Request, Response } from 'express';
import {
  createShow,
  getShows,
  getShowById,
  getAvailableSeats,
  getSeatsByShow,
  bookSeats,
  confirmBooking,
  getBookingById,
  getBookingsByUser,
  getAllBookings,
} from '../controllers/bookingController';
import { ApiResponse } from '../types';

const router: Router = express.Router();

// Show Routes
/**
 * @route POST /api/shows
 * @desc Create a new show/trip/slot
 * @access Admin
 */
router.post('/shows', async (req: Request, res: Response) => {
  try {
    const { name, description, start_time, total_seats, category } = req.body;

    if (!name || !start_time || !total_seats || !category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, start_time, total_seats, category',
      } as ApiResponse);
    }

    const show = await createShow(
      name,
      description,
      new Date(start_time),
      total_seats,
      category
    );

    res.status(201).json({
      success: true,
      data: show,
      message: 'Show created successfully',
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    } as ApiResponse);
  }
});

/**
 * @route GET /api/bookings
 * @desc Get all bookings (admin)
 * @access Public (should be protected in production)
 */
router.get('/bookings', async (_req: Request, res: Response) => {
  try {
    const bookings = await getAllBookings();
    res.json({ success: true, data: bookings } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Internal server error' } as ApiResponse);
  }
});

/**
 * @route GET /api/shows
 * @desc Get all shows
 * @access Public
 */
router.get('/shows', async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const shows = await getShows(category as string);

    res.json({
      success: true,
      data: shows,
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    } as ApiResponse);
  }
});

/**
 * @route GET /api/shows/:id
 * @desc Get show by ID with all seat details
 * @access Public
 */
router.get('/shows/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const show = await getShowById(id);

    if (!show) {
      return res.status(404).json({
        success: false,
        error: 'Show not found',
      } as ApiResponse);
    }

    const seats = await getSeatsByShow(id);

    res.json({
      success: true,
      data: {
        ...show,
        seats,
      },
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    } as ApiResponse);
  }
});

/**
 * @route GET /api/shows/:id/available-seats
 * @desc Get available seats for a show
 * @access Public
 */
router.get('/shows/:id/available-seats', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const seats = await getAvailableSeats(id);

    res.json({
      success: true,
      data: seats,
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    } as ApiResponse);
  }
});

// Booking Routes
/**
 * @route POST /api/bookings
 * @desc Create a booking (book seats)
 * @access Public
 */
router.post('/bookings', async (req: Request, res: Response) => {
  try {
    const { show_id, user_id, number_of_seats, requested_seats } = req.body;

    if (!show_id || !user_id || !number_of_seats) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: show_id, user_id, number_of_seats',
      } as ApiResponse);
    }

    if (number_of_seats < 1) {
      return res.status(400).json({
        success: false,
        error: 'number_of_seats must be at least 1',
      } as ApiResponse);
    }

    const { booking, success } = await bookSeats(
      show_id,
      user_id,
      number_of_seats,
      requested_seats
    );

    if (!success) {
      return res.status(400).json({
        success: false,
        data: booking,
        message: 'Not enough available seats',
      } as ApiResponse);
    }

    res.status(201).json({
      success: true,
      data: booking,
      message: 'Booking created successfully',
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    } as ApiResponse);
  }
});

/**
 * @route GET /api/bookings/:id
 * @desc Get booking details
 * @access Public
 */
router.get('/bookings/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const booking = await getBookingById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: booking,
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    } as ApiResponse);
  }
});

/**
 * @route POST /api/bookings/:id/confirm
 * @desc Confirm a pending booking
 * @access Public
 */
router.post('/bookings/:id/confirm', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const booking = await confirmBooking(id);

    res.json({
      success: true,
      data: booking,
      message: 'Booking confirmed successfully',
    } as ApiResponse);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to confirm booking',
    } as ApiResponse);
  }
});

/**
 * @route GET /api/users/:userId/bookings
 * @desc Get all bookings for a user
 * @access Public
 */
router.get('/users/:userId/bookings', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const bookings = await getBookingsByUser(userId);

    res.json({
      success: true,
      data: bookings,
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    } as ApiResponse);
  }
});

/**
 * @route GET /api/health
 * @desc Health check endpoint
 * @access Public
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Server is running',
  } as ApiResponse);
});

export default router;
