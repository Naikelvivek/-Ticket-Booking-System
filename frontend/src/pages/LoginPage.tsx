import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import '../styles/LoginPage.css';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password');
      return;
    }
    try {
      const data = await apiClient.login(username, password);
      if (data && data.user) {
        login(data.user.id, isAdmin);
        navigate('/');
      } else {
        setError(data.error || 'Login failed. Please try again.');
      }
    } catch {
      setError('Login failed. Please try again.');
    }
  };

  const handleDemoLogin = async (adminFlag: boolean) => {
    setError('');
    const demoUsername = adminFlag ? 'demo-admin' : 'demo-user';
    const demoPassword = 'demo123';
    try {
      // Try to register demo user; if exists, ignore error and login
      await apiClient.register(demoUsername, demoPassword);
    } catch {
      // ignore
    }
    try {
      const data = await apiClient.login(demoUsername, demoPassword);
      if (data && data.user) {
        login(data.user.id, adminFlag);
        navigate('/');
      } else {
        setError('Demo login failed');
      }
    } catch {
      setError('Demo login failed');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>🎫 Ticket Booking System</h1>
        <p className="subtitle">Book your favorite shows, concerts, and more!</p>

        <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                placeholder="Enter your username"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="form-input"
              />
            </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
              />
              <span>Login as Admin</span>
            </label>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        <div className="divider">OR</div>

        <div className="divider">OR</div>
        <div className="demo-section">
          <p>Try with demo account:</p>
          <div className="demo-buttons">
            <button className="demo-btn user-demo" onClick={() => handleDemoLogin(false)}>
              👤 Login as User
            </button>
            <button className="demo-btn admin-demo" onClick={() => handleDemoLogin(true)}>
              👨‍💼 Login as Admin
            </button>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <button className="login-btn" onClick={() => navigate('/register')}>Register</button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
