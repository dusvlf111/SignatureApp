// src/components/signature/SignaturePreview.js
import React, { useState } from 'react';
import './SignaturePreview.scss';

const SignaturePreview = ({ 
  imageData, 
  onDownload, 
  onSaveToGallery,
  showGalleryOption = true 
}) => {
  const [previewBackground, setPreviewBackground] = useState('transparent');

  const backgroundOptions = [
    { value: 'transparent', label: '투명', class: 'transparent' },
    { value: 'white', label: '흰색', class: 'white' },
    { value: 'dark', label: '어두운 배경', class: 'dark' },
    { value: 'pattern', label: '체크 패턴', class: 'pattern' }
  ];

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="signature-preview">
      <div className="signature-preview__container">
        {/* 미리보기 이미지 */}
        <div className="signature-preview__image-container">
          <div 
            className={`signature-preview__image signature-preview__image--${previewBackground}`}
          >
            <img 
              src={imageData.dataURL} 
              alt="서명 미리보기"
              className="signature-preview__img"
            />
          </div>
          
          {/* 배경 선택 */}
          <div className="signature-preview__background-selector">
            <span className="background-selector__label">배경:</span>
            <div className="background-selector__options">
              {backgroundOptions.map(option => (
                <button
                  key={option.value}
                  className={`background-option ${
                    previewBackground === option.value ? 'background-option--active' : ''
                  }`}
                  onClick={() => setPreviewBackground(option.value)}
                  title={option.label}
                >
                  <div className={`background-option__preview background-option__preview--${option.class}`}></div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 정보 패널 */}
        <div className="signature-preview__info">
          <div className="info-item">
            <span className="info-label">크기:</span>
            <span className="info-value">{imageData.width} × {imageData.height}px</span>
          </div>
          <div className="info-item">
            <span className="info-label">파일 크기:</span>
            <span className="info-value">{formatFileSize(imageData.size)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">형식:</span>
            <span className="info-value">PNG (투명 배경)</span>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="signature-preview__actions">
          <button 
            className="btn btn--primary"
            onClick={onDownload}
          >
            📥 다운로드
          </button>
          
          {showGalleryOption && (
            <button 
              className="btn btn--secondary"
              onClick={onSaveToGallery}
            >
              💾 갤러리에 저장
            </button>
          )}
          
          <button 
            className="btn btn--outline"
            onClick={() => {
              if (navigator.share && imageData.blob) {
                navigator.share({
                  title: '내 서명',
                  files: [new File([imageData.blob], 'signature.png', { type: 'image/png' })]
                }).catch(console.error);
              } else {
                // 폴백: 클립보드에 복사
                navigator.clipboard.write([
                  new ClipboardItem({
                    'image/png': imageData.blob
                  })
                ]).then(() => {
                  alert('클립보드에 복사되었습니다!');
                }).catch(() => {
                  alert('공유 기능을 지원하지 않는 브라우저입니다.');
                });
              }
            }}
          >
            📤 공유
          </button>
        </div>

        {/* 사용 팁 */}
        <div className="signature-preview__tips">
          <h4>💡 사용 팁</h4>
          <ul>
            <li>투명 배경으로 저장되어 어떤 문서에도 자연스럽게 삽입할 수 있습니다</li>
            <li>고해상도로 저장되어 인쇄 시에도 선명합니다</li>
            <li>갤러리에 저장하면 나중에 다시 사용할 수 있습니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SignaturePreview;