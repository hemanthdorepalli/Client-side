import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css'; 

const NavBar: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <button className="menu-toggle" onClick={toggleMenu}>
          ☰
        </button>
        <ul className={`navbar-menu ${isMenuOpen ? 'open' : ''}`}>
          <li><Link to="/home">Home</Link></li>
          <li><Link to="/session">Upcoming Session</Link></li>
          <li><Link to="/admin">Admin</Link></li>
          <li className="logout-container">
            <Link to="/" onClick={(e) => {
              e.preventDefault(); // Prevent the default link behavior
              onLogout(); // Trigger the logout function
            }} className="logout-link">
              Logout
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
