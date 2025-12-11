import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import '../styles/MyBookings.css';

const MyBookings: React.FC = () => {
  const { userId } = useAuth();
  const { bookings, loading, error, fetchUserBookings, clearError } = useBooking();

  useEffect(() => {
    if (userId) {
      fetchUserBookings(userId);
    }
  }, [userId, fetchUserBookings]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'FAILED':
        return 'error';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="my-bookings-page">
      <div className="page-header">
        <h1>My Bookings</h1>
        <p>Track your ticket bookings</p>
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={clearError}>✕</button>
        </div>
      )}

      {loading && <div className="loading-spinner">Loading your bookings...</div>}

      {!loading && bookings.length === 0 && (
        <div className="empty-state">
          <p>No bookings found</p>
          <a href="/" className="link-btn">
            Browse Shows
          </a>
        </div>
      )}

      {!loading && bookings.length > 0 && (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <div className="booking-header">
                <h3>Booking #{booking.id.substring(0, 8)}</h3>
                <span className={`status-badge ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
              <div className="booking-details">
                <div className="detail">
                  <span className="label">Show ID:</span>
                  <span className="value">{booking.show_id.substring(0, 8)}...</span>
                </div>
                <div className="detail">
                  <span className="label">Seats:</span>
                  <span className="value">
                    {Array.isArray(booking.booked_seats)
                      ? booking.booked_seats.join(', ')
                      : (typeof booking.booked_seats === 'string' ? (() => { try { return JSON.parse(booking.booked_seats).join(', '); } catch { return booking.booked_seats; } })() : '')}
                  </span>
                </div>
                <div className="detail">
                  <span className="label">Number of Seats:</span>
                  <span className="value">{booking.number_of_seats}</span>
                </div>
                <div className="detail">
                  <span className="label">Booked On:</span>
                  <span className="value">{new Date(booking.created_at).toLocaleString()}</span>
                </div>
                {booking.expires_at && booking.status === 'PENDING' && (
                  <div className="detail warning">
                    <span className="label">Expires:</span>
                    <span className="value">
                      {new Date(booking.expires_at).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
