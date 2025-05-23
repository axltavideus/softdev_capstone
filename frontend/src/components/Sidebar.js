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
          <li><Link to="/master_data" className="sidebar-button">Master Data</Link></li>
            <ul>
              <li><Link to="/keluar" className="sidebar-button">Keluar</Link></li>
              <li><Link to="/masuk" className="sidebar-button">Masuk</Link></li>
            </ul>
          </li>
        </ul>
      </nav>
      <button className="logout-button">Logout</button>
    </aside>
  );
}

export default Sidebar;
