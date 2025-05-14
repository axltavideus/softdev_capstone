import React from 'react';
import './Sidebar.css';

function Sidebar() {
  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li><button className="sidebar-button">Daftar Projek</button></li>
          <li>
            <div className="sidebar-section">Master Data</div>
            <ul>
              <li><button className="sidebar-button">Keluar</button></li>
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
