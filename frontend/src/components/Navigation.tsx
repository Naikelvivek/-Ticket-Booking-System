import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navigation.css';

const Navigation: React.FC = () => {
  const { userId, isAdmin, logout } = useAuth();

  if (!userId) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          🎫 Ticket Booking System
        </Link>
        <div className="navbar-menu">
          <Link to="/" className="nav-link">
            Browse Shows
          </Link>
          <Link to="/my-bookings" className="nav-link">
            My Bookings
          </Link>
          {isAdmin && (
            <Link to="/admin" className="nav-link admin-link">
              Admin Dashboard
            </Link>
          )}
          <div className="user-info">
            <span className="user-id">User: {userId.substring(0, 8)}...</span>
            {isAdmin && <span className="admin-badge">Admin</span>}
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
