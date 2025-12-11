import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import { Show } from '../types';
import '../styles/AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const { userId } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_time: '',
    total_seats: 100,
    category: 'show' as 'show' | 'bus' | 'doctor',
  });
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    fetchShows();
    fetchBookings();
  }, []);

  const fetchShows = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getShows();
      setShows(data);
    } catch (err: any) {
      setError('Failed to fetch shows');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const data = await apiClient.getAllBookings();
      setBookings(data || []);
    } catch (err: any) {
      // ignore for now
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'total_seats' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await apiClient.createShow(
        formData.name,
        formData.description,
        new Date(formData.start_time).toISOString(),
        formData.total_seats,
        formData.category
      );
      setMessage('Show created successfully!');
      setFormData({
        name: '',
        description: '',
        start_time: '',
        total_seats: 100,
        category: 'show',
      });
      await fetchShows();
    } catch (err: any) {
      setError(err.message || 'Failed to create show');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage shows, trips, and bookings</p>
      </div>

      <div className="admin-container">
        <section className="create-show-section">
          <h2>Create New Show/Trip/Slot</h2>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <form onSubmit={handleSubmit} className="create-show-form">
            <div className="form-group">
              <label>Show Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Concert Night, Bus to Mumbai"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter show description"
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date & Time *</label>
                <input
                  type="datetime-local"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Total Seats *</label>
                <input
                  type="number"
                  name="total_seats"
                  value={formData.total_seats}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="show">Show</option>
                  <option value="bus">Bus</option>
                  <option value="doctor">Doctor Appointment</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Creating...' : 'Create Show'}
            </button>
          </form>
        </section>

        <section className="shows-list-section">
          <h2>All Shows/Trips</h2>

          {loading && <p>Loading shows...</p>}

          {shows.length === 0 ? (
            <p className="empty-text">No shows created yet</p>
          ) : (
            <div className="shows-table-wrapper">
              <table className="shows-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Date & Time</th>
                    <th>Total Seats</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {shows.map((show) => (
                    <tr key={show.id}>
                      <td>{show.name}</td>
                      <td>
                        <span className={`badge ${show.category}`}>{show.category}</span>
                      </td>
                      <td>{new Date(show.start_time).toLocaleString()}</td>
                      <td>{show.total_seats}</td>
                      <td>
                        <span className={`status ${new Date(show.start_time) > new Date() ? 'upcoming' : 'past'}`}>
                          {new Date(show.start_time) > new Date() ? 'Upcoming' : 'Passed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <section className="bookings-section">
          <h2>All Bookings</h2>
          {bookings.length === 0 ? (
            <p className="empty-text">No bookings yet</p>
          ) : (
            <div className="bookings-table-wrapper">
              <table className="shows-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>User</th>
                    <th>Show ID</th>
                    <th>Seats</th>
                    <th>Status</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td>{b.id}</td>
                      <td>{b.username || b.user_id}</td>
                      <td>{b.show_id}</td>
                      <td>{typeof b.booked_seats === 'string' ? JSON.parse(b.booked_seats).join(', ') : (b.booked_seats || []).join(', ')}</td>
                      <td>{b.status}</td>
                      <td>{new Date(b.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
