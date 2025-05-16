import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li>
            <NavLink to="/" className={({ isActive }) => isActive ? 'sidebar-button active' : 'sidebar-button'}>
              Daftar Projek
            </NavLink>
          </li>
          <li>
            <div className="sidebar-section">Master Data</div>
            <ul>
              <li>
                <NavLink to="/masterdata/keluar" className={({ isActive }) => isActive ? 'sidebar-button active' : 'sidebar-button'}>
                  Keluar
                </NavLink>
              </li>
              <li>
                <NavLink to="/masterdata/masuk" className={({ isActive }) => isActive ? 'sidebar-button active' : 'sidebar-button'}>
                  Masuk
                </NavLink>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
      <button className="logout-button">Logout</button>
    </aside>
  );
}

export default Sidebar;
