// src/components/common/Navigation.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.scss';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    {
      path: '/',
      icon: '🏠',
      label: '홈',
      exact: true
    },
    {
      path: '/handwriting',
      icon: '✏️',
      label: '손글씨'
    },
    {
      path: '/photo',
      icon: '📷',
      label: '사진'
    },
    {
      path: '/stamp',
      icon: '🎨',
      label: '도장'
    }
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="navigation">
      <div className="navigation__container">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`navigation__item ${
              isActive(item.path, item.exact) ? 'navigation__item--active' : ''
            }`}
          >
            <span className="navigation__icon">{item.icon}</span>
            <span className="navigation__label">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;