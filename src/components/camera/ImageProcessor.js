// src/components/camera/ImageProcessor.js
import React, { useState, useEffect } from 'react';
import './ImageProcessor.scss';

const ImageProcessor = ({ image, options, onOptionsChange }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (image) {
      const url = URL.createObjectURL(image);
      setPreviewUrl(url);
      setImageLoaded(true);

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [image]);

  const handleOptionChange = (key, value) => {
    onOptionsChange({ [key]: value });
  };

  const resetToDefaults = () => {
    onOptionsChange({
      brightness: 2,
      contrast: 1.1,
      threshold: 200,
      morphKernel: 2,
      useAdaptiveThreshold: false,
      correctRotation: true
    });
  };

  if (!image || !imageLoaded) {
    return (
      <div className="image-processor">
        <div className="image-processor__placeholder">
          <div className="placeholder-icon">🖼️</div>
          <p>이미지를 선택해주세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="image-processor">
      <div className="image-processor__container">
        {/* 이미지 미리보기 */}
        <div className="image-processor__preview">
          <div className="preview-container">
            <img
              src={previewUrl}
              alt="원본 이미지"
              className="preview-image"
            />
            <div className="preview-overlay">
              <div className="image-info">
                <span className="image-name">{image.name}</span>
                <span className="image-size">
                  {(image.size / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 처리 옵션 */}
        <div className="image-processor__options">
          <div className="options-header">
            <h3>이미지 처리 설정</h3>
            <button
              className="btn btn--outline btn--small"
              onClick={resetToDefaults}
            >
              기본값으로 초기화
            </button>
          </div>

          <div className="options-grid">
            {/* 밝기 조정 */}
            <div className="option-group">
              <label className="option-label">
                밝기
                <span className="option-value">{options.brightness}</span>
              </label>
              <input
                type="range"
                min="-50"
                max="50"
                value={options.brightness}
                onChange={(e) => handleOptionChange('brightness', parseInt(e.target.value))}
                className="option-slider"
              />
              <div className="option-description">
                값이 클수록 이미지가 밝아집니다
              </div>
            </div>

            {/* 대비 조정 */}
            <div className="option-group">
              <label className="option-label">
                대비
                <span className="option-value">{options.contrast.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={options.contrast}
                onChange={(e) => handleOptionChange('contrast', parseFloat(e.target.value))}
                className="option-slider"
              />
              <div className="option-description">
                값이 클수록 명암 차이가 커집니다
              </div>
            </div>

            {/* 임계값 */}
            <div className="option-group">
              <label className="option-label">
                임계값
                <span className="option-value">{options.threshold}</span>
              </label>
              <input
                type="range"
                min="50"
                max="200"
                value={options.threshold}
                onChange={(e) => handleOptionChange('threshold', parseInt(e.target.value))}
                className="option-slider"
                disabled={options.useAdaptiveThreshold}
              />
              <div className="option-description">
                배경과 전경을 구분하는 기준값
              </div>
            </div>

            {/* 모폴로지 커널 크기 */}
            <div className="option-group">
              <label className="option-label">
                노이즈 제거 강도
                <span className="option-value">{options.morphKernel}</span>
              </label>
              <input
                type="range"
                min="1"
                max="7"
                value={options.morphKernel}
                onChange={(e) => handleOptionChange('morphKernel', parseInt(e.target.value))}
                className="option-slider"
              />
              <div className="option-description">
                값이 클수록 더 많은 노이즈가 제거됩니다
              </div>
            </div>

            {/* 적응형 임계값 사용 */}
            <div className="option-group option-group--checkbox">
              <label className="option-checkbox">
                <input
                  type="checkbox"
                  checked={options.useAdaptiveThreshold}
                  onChange={(e) => handleOptionChange('useAdaptiveThreshold', e.target.checked)}
                />
                <span className="checkmark"></span>
                적응형 임계값 사용
              </label>
              <div className="option-description">
                조명이 고르지 않은 경우 체크하세요
              </div>
            </div>

            {/* 회전 보정 */}
            <div className="option-group option-group--checkbox">
              <label className="option-checkbox">
                <input
                  type="checkbox"
                  checked={options.correctRotation}
                  onChange={(e) => handleOptionChange('correctRotation', e.target.checked)}
                />
                <span className="checkmark"></span>
                자동 회전 보정
              </label>
              <div className="option-description">
                기울어진 이미지를 자동으로 보정합니다
              </div>
            </div>
          </div>

          {/* 처리 팁 */}
          <div className="processing-tips">
            <h4>💡 처리 팁</h4>
            <ul>
              <li><strong>밝기</strong>: 그림자가 있거나 어두운 이미지는 밝기를 높이세요</li>
              <li><strong>대비</strong>: 흐릿한 이미지는 대비를 높여 선명하게 만드세요</li>
              <li><strong>임계값</strong>: 배경 제거가 잘 안되면 값을 조정해보세요</li>
              <li><strong>적응형 임계값</strong>: 조명이 고르지 않은 경우 사용하세요</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageProcessor;