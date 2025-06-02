import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import UploadPage from './components/UploadPage';
import ProjectPage from './components/ProjectPage';
import KeluarPage from './components/KeluarPage';
import MasterDataMasukPage from './components/MasterDataMasukPage';
import MasterData from './components/master_data';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
  };

  const handleSignup = () => {
    // Optionally redirect to login or auto-login after signup
  };

  return (
    <Router>
      <div className="app-container">
        <Sidebar handleLogout={handleLogout} />
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
            <Route path="/project/:id" element={<ProjectPage />} />
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
