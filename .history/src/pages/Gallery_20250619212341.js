// src/pages/Gallery.js
import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import './Gallery.scss';

const Gallery = () => {
  const [savedImages, setSavedImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, name, type

  useEffect(() => {
    loadSavedImages();
  }, []);

  const loadSavedImages = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('stampMaker_gallery') || '[]');
      setSavedImages(saved);
    } catch (error) {
      console.error('갤러리 로드 오류:', error);
      setSavedImages([]);
    }
  };

  const sortImages = (images) => {
    const sorted = [...images];
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'type':
        return sorted.sort((a, b) => a.type.localeCompare(b.type));
      default:
        return sorted;
    }
  };

  const handleImageSelect = (imageId) => {
    setSelectedImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  const handleSelectAll = () => {
    if (selectedImages.length === savedImages.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(savedImages.map(img => img.id));
    }
  };

  const handleDownload = (image) => {
    try {
      // dataURL을 blob으로 변환
      const byteCharacters = atob(image.dataURL.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });
      
      const filename = `${image.name.replace(/[^a-zA-Z0-9가-힣]/g, '_')}.png`;
      saveAs(blob, filename);
    } catch (error) {
      console.error('다운로드 오류:', error);
      alert('다운로드 중 오류가 발생했습니다.');
    }
  };

  const handleBulkDownload = () => {
    selectedImages.forEach(imageId => {
      const image = savedImages.find(img => img.id === imageId);
      if (image) {
        setTimeout(() => handleDownload(image), 100); // 순차 다운로드
      }
    });
  };

  const handleDelete = (imageId) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      const updated = savedImages.filter(img => img.id !== imageId);
      setSavedImages(updated);
      localStorage.setItem('stampMaker_gallery', JSON.stringify(updated));
      setSelectedImages(prev => prev.filter(id => id !== imageId));
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`선택된 ${selectedImages.length}개 항목을 삭제하시겠습니까?`)) {
      const updated = savedImages.filter(img => !selectedImages.includes(img.id));
      setSavedImages(updated);
      localStorage.setItem('stampMaker_gallery', JSON.stringify(updated));
      setSelectedImages([]);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'handwriting': return '✏️';
      case 'photo': return '📷';
      case 'stamp': return '🎨';
      default: return '📄';
    }
  };

  const getTypeName = (type) => {
    switch (type) {
      case 'handwriting': return '손글씨';
      case 'photo': return '사진';
      case 'stamp': return '도장';
      default: return '기타';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const sortedImages = sortImages(savedImages);

  return (
    <div className="gallery">
      <div className="container">
        <div className="gallery__header">
          <h1 className="gallery__title">갤러리</h1>
          <p className="gallery__description">
            저장된 서명과 도장을 관리하세요.
          </p>
        </div>

        {savedImages.length === 0 ? (
          <div className="gallery__empty">
            <div className="empty-icon">🗂️</div>
            <h3>저장된 항목이 없습니다</h3>
            <p>서명이나 도장을 만들어 갤러리에 저장해보세요.</p>
          </div>
        ) : (
          <>
            <div className="gallery__controls">
              <div className="controls-left">
                <button
                  className="btn btn--outline btn--small"
                  onClick={handleSelectAll}
                >
                  {selectedImages.length === savedImages.length ? '전체 해제' : '전체 선택'}
                </button>
                
                {selectedImages.length > 0 && (
                  <>
                    <button
                      className="btn btn--primary btn--small"
                      onClick={handleBulkDownload}
                    >
                      선택 다운로드 ({selectedImages.length})
                    </button>
                    <button
                      className="btn btn--secondary btn--small"
                      onClick={handleBulkDelete}
                    >
                      선택 삭제
                    </button>
                  </>
                )}
              </div>

              <div className="controls-right">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="newest">최신순</option>
                  <option value="oldest">오래된순</option>
                  <option value="name">이름순</option>
                  <option value="type">타입순</option>
                </select>

                <div className="view-toggle">
                  <button
                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                  >
                    ⊞
                  </button>
                  <button
                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    ☰
                  </button>
                </div>
              </div>
            </div>

            <div className={`gallery__content gallery__content--${viewMode}`}>
              {sortedImages.map((image) => (
                <div
                  key={image.id}
                  className={`gallery-item ${selectedImages.includes(image.id) ? 'selected' : ''}`}
                >
                  <div className="gallery-item__checkbox">
                    <input
                      type="checkbox"
                      checked={selectedImages.includes(image.id)}
                      onChange={() => handleImageSelect(image.id)}
                    />
                  </div>

                  <div className="gallery-item__preview">
                    <img
                      src={image.dataURL}
                      alt={image.name}
                      className="gallery-item__image"
                    />
                  </div>

                  <div className="gallery-item__info">
                    <div className="item-header">
                      <span className="item-type">
                        {getTypeIcon(image.type)} {getTypeName(image.type)}
                      </span>
                      <span className="item-date">{formatDate(image.createdAt)}</span>
                    </div>
                    
                    <h3 className="item-name">{image.name}</h3>
                    
                    <div className="item-details">
                      <span>{image.dimensions.width} × {image.dimensions.height}px</span>
                      <span>{formatFileSize(image.size)}</span>
                    </div>
                  </div>

                  <div className="gallery-item__actions">
                    <button
                      className="action-btn action-btn--download"
                      onClick={() => handleDownload(image)}
                      title="다운로드"
                    >
                      📥
                    </button>
                    <button
                      className="action-btn action-btn--delete"
                      onClick={() => handleDelete(image.id)}
                      title="삭제"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Gallery;