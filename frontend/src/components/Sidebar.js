import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ handleLogout }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {isMobile && !isOpen && (
        <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">
          <span className="hamburger-icon">&#9776;</span>
        </button>
      )}

      <div className={`sidebar-container ${isOpen ? 'open' : ''} ${isMobile ? 'mobile' : ''}`}>
        {isOpen && (
          <aside className="sidebar">
            <div className="sidebar-header">
              <h3>Menu</h3>
              {isMobile && (
                <button className="close-btn" onClick={toggleSidebar}>&times;</button>
              )}
            </div>
            <nav>
              <ul className="sidebar-menu">
                <li>
                  <Link to="/" className="sidebar-button" onClick={() => isMobile && setIsOpen(false)}>
                    <span className="icon">📋</span>
                    <span className="text">Daftar Projek</span>
                  </Link>
                </li>
                
                <li className="menu-section">
                  <Link to="/master_data" className="sidebar-button" onClick={() => isMobile && setIsOpen(false)}>
                    <span className="icon">📊</span>
                    <span className="text">Master Data</span>
                  </Link>
                  <ul className="submenu">
                    <li>
                      <Link to="/keluar" className="sidebar-button" onClick={() => isMobile && setIsOpen(false)}>
                        <span className="icon">↩️</span>
                        <span className="text">Keluar</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/masuk" className="sidebar-button" onClick={() => isMobile && setIsOpen(false)}>
                        <span className="icon">↪️</span>
                        <span className="text">Masuk</span>
                      </Link>
                    </li>
                  </ul>
                </li>
              </ul>
            </nav>
            <div className="sidebar-footer">
              <button 
                className="logout-button" 
                onClick={() => { 
                  isMobile && setIsOpen(false); 
                  handleLogout(); 
                }}
              >
                <span className="icon"></span>
                <span className="text">Logout</span>
              </button>
            </div>
          </aside>
        )}
      </div>

      {isOpen && isMobile && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}
    </>
  );
}

export default Sidebar;