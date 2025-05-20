import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li><Link to="/" className="sidebar-button">Daftar Projek</Link></li>
          <li>
            <div className="sidebar-section">Master Data</div>
            <ul>
              <li><Link to="/keluar" className="sidebar-button">Keluar</Link></li>
              <li><button className="sidebar-button">Masuk</button></li>
            </ul>
          </li>
        </ul>
      </nav>
      <button className="logout-button">Logout</button>
    </aside>
  );
}

export default Sidebar;
