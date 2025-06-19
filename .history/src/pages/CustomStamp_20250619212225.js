// src/pages/CustomStamp.js
import React, { useState } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './CustomStamp.scss';

const CustomStamp = ({ isOpenCVLoaded }) => {
  const [stampText, setStampText] = useState('');
  const [stampSettings, setStampSettings] = useState({
    shape: 'circle',
    size: 200,
    fontSize: 24,
    fontFamily: 'serif',
    color: '#dc143c',
    borderWidth: 3
  });

  const handleTextChange = (e) => {
    setStampText(e.target.value);
  };

  const updateSettings = (newSettings) => {
    setStampSettings(prev => ({ ...prev, ...newSettings }));
  };

  if (!isOpenCVLoaded) {
    return (
      <div className="custom-stamp">
        <div className="container">
          <div className="custom-stamp__loading">
            <LoadingSpinner size="large" />
            <p>도장 생성 도구를 로딩 중입니다...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="custom-stamp">
      <div className="container">
        <div className="custom-stamp__header">
          <h1 className="custom-stamp__title">커스텀 도장 만들기</h1>
          <p className="custom-stamp__description">
            이름이나 텍스트를 입력하여 전통적인 도장 스타일로 제작해보세요.
          </p>
        </div>

        <div className="custom-stamp__content">
          <div className="stamp-creator">
            <div className="text-input-section">
              <label htmlFor="stamp-text">도장에 들어갈 텍스트</label>
              <input
                id="stamp-text"
                type="text"
                value={stampText}
                onChange={handleTextChange}
                placeholder="이름이나 텍스트를 입력하세요"
                className="input"
                maxLength={10}
              />
            </div>

            <div className="settings-panel">
              <div className="setting-group">
                <label>모양</label>
                <select 
                  value={stampSettings.shape}
                  onChange={(e) => updateSettings({ shape: e.target.value })}
                  className="input"
                >
                  <option value="circle">원형</option>
                  <option value="square">사각형</option>
                  <option value="oval">타원형</option>
                </select>
              </div>

              <div className="setting-group">
                <label>크기</label>
                <input
                  type="range"
                  min="100"
                  max="300"
                  value={stampSettings.size}
                  onChange={(e) => updateSettings({ size: parseInt(e.target.value) })}
                  className="range-slider"
                />
                <span>{stampSettings.size}px</span>
              </div>

              <div className="setting-group">
                <label>색상</label>
                <input
                  type="color"
                  value={stampSettings.color}
                  onChange={(e) => updateSettings({ color: e.target.value })}
                  className="color-picker"
                />
              </div>
            </div>

            <div className="stamp-preview">
              <div className="preview-container">
                {stampText ? (
                  <div 
                    className={`stamp-preview__stamp stamp-preview__stamp--${stampSettings.shape}`}
                    style={{
                      width: stampSettings.size,
                      height: stampSettings.size,
                      color: stampSettings.color,
                      borderColor: stampSettings.color,
                      borderWidth: stampSettings.borderWidth,
                      fontSize: stampSettings.fontSize
                    }}
                  >
                    {stampText}
                  </div>
                ) : (
                  <div className="preview-placeholder">
                    텍스트를 입력하면 미리보기가 표시됩니다
                  </div>
                )}
              </div>
            </div>

            <div className="action-buttons">
              <button 
                className="btn btn--primary"
                disabled={!stampText.trim()}
              >
                도장 생성하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomStamp;