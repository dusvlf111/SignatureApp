// src/components/common/Header.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.scss';

const Header = () => {
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return '도장 메이커';
      case '/handwriting':
        return '손글씨 서명';
      case '/photo':
        return '사진 서명';
      case '/stamp':
        return '커스텀 도장';
      case '/gallery':
        return '갤러리';
      default:
        return '도장 메이커';
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header__content">
          <Link to="/" className="header__logo">
            <span className="header__logo-icon">📋</span>
            <span className="header__logo-text">StampMaker</span>
          </Link>
          
          <h1 className="header__title">{getPageTitle()}</h1>
          
          <div className="header__actions">
            <Link to="/gallery" className="header__gallery-btn">
              <span className="header__gallery-icon">🗂️</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;