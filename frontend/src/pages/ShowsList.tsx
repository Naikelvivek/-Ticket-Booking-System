import React, { useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import ShowCard from '../components/ShowCard';
import '../styles/ShowsList.css';

const ShowsList: React.FC = () => {
  const { shows, loading, error, fetchShows, clearError } = useBooking();

  useEffect(() => {
    fetchShows();
  }, [fetchShows]);

  return (
    <div className="shows-list-page">
      <div className="page-header">
        <h1>Available Shows</h1>
        <p>Browse and book your favorite shows</p>
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={clearError}>✕</button>
        </div>
      )}

      {loading && <div className="loading-spinner">Loading shows...</div>}

      {!loading && shows.length === 0 && (
        <div className="empty-state">
          <p>No shows available at the moment</p>
          <button onClick={() => fetchShows()}>Refresh</button>
        </div>
      )}

      {!loading && shows.length > 0 && (
        <div className="shows-grid">
          {shows.map((show) => (
            <ShowCard key={show.id} show={show} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ShowsList;
