import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import '../styles/LoginPage.css';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password');
      return;
    }
    try {
      const data = await apiClient.register(username, password);
      if (data && data.user) {
        setSuccess('Registration successful! Logging you in...');
        login(data.user.id, false);
        setTimeout(() => navigate('/'), 800);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch {
      setError('Registration failed');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Register</h1>
        <form onSubmit={handleRegister} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter username"
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              className="form-input"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <button type="submit" className="login-btn">Register</button>
        </form>
        <div className="divider">OR</div>
        <button className="login-btn" onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    </div>
  );
};

export default RegisterPage;
