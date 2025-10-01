import React from 'react';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="logo">
        Stil Keşfet
      </div>
      <nav className="nav-links">
        <a href="#" className="nav-link">Nasıl Çalışır?</a>
        <a href="#" className="nav-link">Stil Kartları</a>
        <a href="#" className="nav-link">Hakkımızda</a>
      </nav>
    </header>
  );
};

export default Header;