import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Show, Booking, BookingContextType } from '../types';
import apiClient from '../api/apiClient';

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [shows, setShows] = useState<Show[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAuth();

  const fetchShows = useCallback(async (category?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getShows(category);
      setShows(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch shows');
      console.error('Error fetching shows:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchShowById = useCallback(async (id: string): Promise<Show | null> => {
    setLoading(true);
    setError(null);
    try {
      const show = await apiClient.getShowById(id);
      return show;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch show');
      console.error('Error fetching show:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const bookSeats = useCallback(
    async (
      showId: string,
      numberOfSeats: number,
      requestedSeats?: string[]
    ): Promise<Booking | null> => {
      setLoading(true);
      setError(null);
      try {
        // Use userId from AuthContext (UUID)
        if (!userId) throw new Error('User not logged in');
        const booking = await apiClient.bookSeats(showId, userId, numberOfSeats, requestedSeats);
        setBookings((prev) => [...prev, booking]);
        setSelectedSeats([]);
        return booking;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to book seats';
        setError(errorMessage);
        console.error('Error booking seats:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const confirmBooking = useCallback(async (bookingId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const updatedBooking = await apiClient.confirmBooking(bookingId);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? updatedBooking : b))
      );
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to confirm booking');
      console.error('Error confirming booking:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserBookings = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getUserBookings(userId);
      // Normalize booked_seats to array
      const normalized = (data || []).map((b: any) => ({
        ...b,
        booked_seats: typeof b.booked_seats === 'string' ? JSON.parse(b.booked_seats) : (b.booked_seats || []),
      }));
      setBookings(normalized);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch bookings');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <BookingContext.Provider
      value={{
        shows,
        bookings,
        selectedSeats,
        loading,
        error,
        fetchShows,
        fetchShowById,
        bookSeats,
        confirmBooking,
        fetchUserBookings,
        setSelectedSeats,
        clearError,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
};
