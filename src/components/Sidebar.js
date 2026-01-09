import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ sidebarOpen, setSidebarOpen, currentPath }) => {
  const menuItems = [
    { path: '/', icon: '🏠', label: 'Dashboard' },
    { path: '/employees', icon: '👥', label: 'Employees' },
    { path: '/add-employee', icon: '➕', label: 'Add Employee' },
    { path: '/attendance', icon: '🕒', label: 'Attendance' },
    { path: '/team', icon: '🤝', label: 'Team Formation' },
  ];

  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <h2>HR Panel</h2>
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={currentPath === item.path ? 'active' : ''}
                onClick={handleLinkClick}
              >
                <span className="icon">{item.icon}</span>
                <span className="label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
};

export default Sidebar;

