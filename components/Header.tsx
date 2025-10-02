import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      <Link to="/" className="logo" aria-label="Kibbe Sistemi Ana Sayfa">
        <span className="logo-icon">🔮</span>
        Kibbe Sistemi
      </Link>
      <nav className="nav-links">
        <NavLink to="/analiz" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Anket
        </NavLink>
        <NavLink to="/sonuclarim" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Sonuçlarım
        </NavLink>
        <a href="#oneriler" className="nav-link">
          Öneriler
        </a>
      </nav>
      <div className="profile-placeholder" aria-hidden>
        <span>👩‍🎨</span>
      </div>
    </header>
  );
};

export default Header;
