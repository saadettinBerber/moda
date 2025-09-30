import React from 'react';

type Page = 'analysis' | 'chat' | 'results';

interface HeaderProps {
  activePage: Page;
  onPageChange: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ activePage, onPageChange }) => {
  return (
    <header className="kibbe-header">
      <div className="kibbe-header__content">
        <div className="kibbe-header__brand">
          <div className="kibbe-header__logo">
            K
          </div>
          <div className="kibbe-header__title">
            Kibbe Sistemi
          </div>
        </div>
        
        <nav className="kibbe-header__nav">
          <a href="#" className="kibbe-header__nav-link">Hakkımızda</a>
          <a href="#" className="kibbe-header__nav-link">Anket</a>
          <a href="#" className="kibbe-header__nav-link">İletişim</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;