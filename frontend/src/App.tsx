import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import Navigation from './components/Navigation';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import ShowsList from './pages/ShowsList';
import BookingPage from './pages/BookingPage';
import MyBookings from './pages/MyBookings';
import './App.css';

const AppRoutes: React.FC = () => {
  const { userId, isAdmin } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      {userId ? (
        <>
          {isAdmin ? (
            <Route path="/admin" element={<AdminDashboard />} />
          ) : null}
          <Route path="/" element={<ShowsList />} />
          <Route path="/booking/:id" element={<BookingPage />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BookingProvider>
        <Router>
          <div className="app">
            <Navigation />
            <main className="main-content">
              <AppRoutes />
            </main>
            <footer className="footer">
              <p>&copy; 2024 Ticket Booking System. All rights reserved.</p>
            </footer>
          </div>
        </Router>
      </BookingProvider>
    </AuthProvider>
  );
};

export default App;
