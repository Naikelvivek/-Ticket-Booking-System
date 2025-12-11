import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { Show, Seat } from '../types';
import SeatSelector from '../components/SeatSelector';
import '../styles/BookingPage.css';

const BookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { fetchShowById, bookSeats, confirmBooking, loading, error, clearError } = useBooking();
  const { userId } = useAuth();
  const [show, setShow] = useState<Show | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [numberOfSeats, setNumberOfSeats] = useState(1);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'booking' | 'confirming'>('idle');
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    const loadShow = async () => {
      if (id) {
        const showData = await fetchShowById(id);
        if (showData) {
          setShow(showData);
          setSeats(showData.seats || []);
        }
      }
    };
    loadShow();
  }, [id, fetchShowById]);

  const handleBooking = async () => {
    if (!id || !userId || selectedSeats.length === 0) return;

    setBookingStatus('booking');
    try {
      const booking = await bookSeats(id, selectedSeats.length, selectedSeats);
      if (booking) {
        setBookingId(booking.id);
        setBookingStatus('confirming');
      }
    } catch (err) {
      console.error('Booking error:', err);
      setBookingStatus('idle');
    }
  };

  const handleConfirmBooking = async () => {
    if (!bookingId) return;

    try {
      const success = await confirmBooking(bookingId);
      if (success) {
        alert('Booking confirmed successfully!');
        setSelectedSeats([]);
        setBookingId(null);
        setBookingStatus('idle');
      }
    } catch (err) {
      console.error('Confirmation error:', err);
    }
  };

  if (!show) {
    return <div className="booking-page loading">Loading show details...</div>;
  }

  return (
    <div className="booking-page">
      <div className="booking-header">
        <h1>{show.name}</h1>
        <p className="show-time">{new Date(show.start_time).toLocaleString()}</p>
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={clearError}>✕</button>
        </div>
      )}

      <div className="booking-container">
        <div className="seat-selection-area">
          <SeatSelector
            seats={seats}
            selectedSeats={selectedSeats}
            onSeatsSelect={setSelectedSeats}
            maxSeats={10}
          />
        </div>

        <div className="booking-summary">
          <h2>Booking Summary</h2>
          <div className="summary-item">
            <span>Show:</span>
            <span>{show.name}</span>
          </div>
          <div className="summary-item">
            <span>Selected Seats:</span>
            <span className="seats-list">{selectedSeats.join(', ') || 'None'}</span>
          </div>
          <div className="summary-item">
            <span>Number of Seats:</span>
            <span>{selectedSeats.length}</span>
          </div>

          {bookingStatus === 'idle' && (
            <button
              className="confirm-btn"
              onClick={handleBooking}
              disabled={selectedSeats.length === 0 || loading}
            >
              {loading ? 'Processing...' : 'Book Seats'}
            </button>
          )}

          {bookingStatus === 'confirming' && (
            <div className="pending-booking">
              <p className="warning">⏰ Booking pending - confirm within 2 minutes</p>
              <button
                className="confirm-btn primary"
                onClick={handleConfirmBooking}
                disabled={loading}
              >
                {loading ? 'Confirming...' : 'Confirm Booking'}
              </button>
              <button
                className="cancel-btn"
                onClick={() => {
                  setBookingStatus('idle');
                  setBookingId(null);
                  setSelectedSeats([]);
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
