import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ handleLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {!isOpen && (
        <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">
          &#9776;
        </button>
      )}
      {isOpen && (
        <aside className={`sidebar open`}>
          <nav>
            <ul>
              <li><Link to="/" className="sidebar-button" onClick={() => setIsOpen(false)}>Daftar Projek</Link></li>
              <li>
              <li><Link to="/master_data" className="sidebar-button" onClick={() => setIsOpen(false)}>Master Data</Link></li>
                <ul>
                  <li><Link to="/keluar" className="sidebar-button" onClick={() => setIsOpen(false)}>Keluar</Link></li>
                  <li><Link to="/masuk" className="sidebar-button" onClick={() => setIsOpen(false)}>Masuk</Link></li>
                </ul>
              </li>
            </ul>
          </nav>
          <button className="logout-button" onClick={() => { setIsOpen(false); handleLogout(); }}>Logout</button>
        </aside>
      )}
    </>
  );
}

export default Sidebar;
