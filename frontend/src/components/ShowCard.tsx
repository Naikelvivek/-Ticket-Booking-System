import React from 'react';
import { Link } from 'react-router-dom';
import { Show } from '../types';
import '../styles/ShowCard.css';

interface ShowCardProps {
  show: Show;
}

const ShowCard: React.FC<ShowCardProps> = ({ show }) => {
  const startTime = new Date(show.start_time);
  const isUpcoming = startTime > new Date();

  return (
    <div className={`show-card ${!isUpcoming ? 'past' : ''}`}>
      <div className="show-header">
        <h3>{show.name}</h3>
        <span className={`category-badge ${show.category}`}>{show.category}</span>
      </div>
      {show.description && <p className="show-description">{show.description}</p>}
      <div className="show-details">
        <div className="detail">
          <span className="label">Date & Time:</span>
          <span className="value">{startTime.toLocaleString()}</span>
        </div>
        <div className="detail">
          <span className="label">Total Seats:</span>
          <span className="value">{show.total_seats}</span>
        </div>
      </div>
      {isUpcoming ? (
        <Link to={`/booking/${show.id}`} className="book-btn">
          Book Now
        </Link>
      ) : (
        <button className="book-btn disabled" disabled>
          Event Passed
        </button>
      )}
    </div>
  );
};

export default ShowCard;
