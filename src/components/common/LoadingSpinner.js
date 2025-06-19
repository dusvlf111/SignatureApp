// src/components/common/LoadingSpinner.js
import React from 'react';
import './LoadingSpinner.scss';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  text = null,
  overlay = false 
}) => {
  const spinnerClasses = [
    'loading-spinner',
    `loading-spinner--${size}`,
    `loading-spinner--${color}`,
    overlay ? 'loading-spinner--overlay' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={spinnerClasses}>
      <div className="loading-spinner__spinner"></div>
      {text && <p className="loading-spinner__text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;