import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import UploadPage from './components/UploadPage';
import ProjectPage from './components/ProjectPage';
import KeluarPage from './components/KeluarPage';
import MasterDataMasukPage from './components/MasterDataMasukPage';
import MasterData from './components/master_data';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAdmin(false);
        return;
      }
      try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setIsAdmin(response.data.isAdmin);
      } catch (error) {
        setIsAdmin(false);
      }
    };
    fetchCurrentUser();
  }, [isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  const handleSignup = () => {
    // Optionally redirect to login or auto-login after signup
  };

  return (
    <Router>
      <div className="app-container">
        {isAuthenticated && <Sidebar handleLogout={handleLogout} />}
        <main className="main-content">
          <Routes>
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} />}
            />
            <Route
              path="/signup"
              element={isAuthenticated ? <Navigate to="/" /> : <SignupPage onSignup={handleSignup} />}
            />
            <Route
              path="/"
              element={isAuthenticated ? <UploadPage onLogout={handleLogout} /> : <Navigate to="/login" />}
            />
            <Route path="/project/:id" element={<ProjectPage isAdmin={isAdmin} />} />
            <Route path="/keluar" element={<KeluarPage />} />
            <Route path="/masuk" element={<MasterDataMasukPage />} />
            <Route path="/master_data" element={<MasterData />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
