// src/pages/HandwritingSignature.js
import React, { useState, useRef } from 'react';
import HandwritingCanvas from '../components/signature/HandwritingCanvas';
import SignaturePreview from '../components/signature/SignaturePreview';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { saveAs } from 'file-saver';
import { v4 as uuidv4 } from 'uuid';
import './HandwritingSignature.scss';

const HandwritingSignature = ({ isOpenCVLoaded }) => {
  const [canvasData, setCanvasData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);
  const [canvasSettings, setCanvasSettings] = useState({
    strokeColor: '#000000',
    strokeWidth: 3,
    smoothing: true
  });
  const canvasRef = useRef(null);

  const handleCanvasChange = (imageData) => {
    setCanvasData(imageData);
    setProcessedImage(null); // 새로 그릴 때 이전 결과 초기화
  };

  const handleClear = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
    }
    setCanvasData(null);
    setProcessedImage(null);
  };

  const handleUndo = () => {
    if (canvasRef.current) {
      canvasRef.current.undo();
    }
  };

  const handleRedo = () => {
    if (canvasRef.current) {
      canvasRef.current.redo();
    }
  };

  const processSignature = async () => {
    if (!canvasData) {
      alert('먼저 서명을 작성해주세요.');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Canvas에서 투명 배경의 PNG 생성
      const canvas = canvasRef.current.getCanvas();
      
      // 새로운 캔버스 생성하여 투명 배경 처리
      const processCanvas = document.createElement('canvas');
      const processCtx = processCanvas.getContext('2d');
      
      processCanvas.width = canvas.width;
      processCanvas.height = canvas.height;
      
      // 원본 이미지 데이터 가져오기
      const imageData = canvasRef.current.getImageData();
      const data = imageData.data;
      
      // 픽셀 데이터를 수정하여 흰색 배경을 투명하게 만들기
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // 흰색에 가까운 픽셀을 투명하게 처리
        if (r > 240 && g > 240 && b > 240) {
          data[i + 3] = 0; // 알파값을 0으로 설정
        } else {
          // 검은색 스트로크는 완전 불투명
          data[i + 3] = 255;
        }
      }
      
      processCtx.putImageData(imageData, 0, 0);
      
      // Blob 생성
      const blob = await new Promise(resolve => {
        processCanvas.toBlob(resolve, 'image/png');
      });
      
      const dataURL = processCanvas.toDataURL('image/png');
      
      setProcessedImage({
        blob,
        dataURL,
        canvas: processCanvas,
        width: processCanvas.width,
        height: processCanvas.height
      });
      
    } catch (error) {
      console.error('서명 처리 중 오류:', error);
      alert('서명 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedImage) {
      alert('먼저 서명을 처리해주세요.');
      return;
    }

    const filename = `signature_${new Date().toISOString().slice(0, 10)}_${uuidv4().slice(0, 8)}.png`;
    saveAs(processedImage.blob, filename);
  };

  const handleSaveToGallery = () => {
    if (!processedImage) {
      alert('먼저 서명을 처리해주세요.');
      return;
    }

    try {
      const savedImages = JSON.parse(localStorage.getItem('stampMaker_gallery') || '[]');
      const newImage = {
        id: uuidv4(),
        type: 'handwriting',
        name: `손글씨 서명 ${new Date().toLocaleDateString()}`,
        dataURL: processedImage.dataURL,
        createdAt: new Date().toISOString(),
        size: processedImage.blob.size,
        dimensions: {
          width: processedImage.width,
          height: processedImage.height
        }
      };

      savedImages.push(newImage);
      localStorage.setItem('stampMaker_gallery', JSON.stringify(savedImages));
      alert('갤러리에 저장되었습니다!');
    } catch (error) {
      console.error('갤러리 저장 오류:', error);
      alert('갤러리 저장 중 오류가 발생했습니다.');
    }
  };

  const updateCanvasSettings = (newSettings) => {
    setCanvasSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <div className="handwriting-signature">
      <div className="container">
        <div className="handwriting-signature__header">
          <h1 className="handwriting-signature__title">손글씨 서명</h1>
          <p className="handwriting-signature__description">
            화면에 직접 서명을 작성하세요. 자동으로 투명 배경의 PNG 파일로 변환됩니다.
          </p>
        </div>

        <div className="handwriting-signature__content">
          {/* 설정 패널 */}
          <div className="handwriting-signature__settings">
            <div className="settings-group">
              <label className="settings-label">펜 색상</label>
              <input
                type="color"
                value={canvasSettings.strokeColor}
                onChange={(e) => updateCanvasSettings({ strokeColor: e.target.value })}
                className="color-picker"
              />
            </div>
            
            <div className="settings-group">
              <label className="settings-label">펜 굵기</label>
              <input
                type="range"
                min="1"
                max="10"
                value={canvasSettings.strokeWidth}
                onChange={(e) => updateCanvasSettings({ strokeWidth: parseInt(e.target.value) })}
                className="range-slider"
              />
              <span className="range-value">{canvasSettings.strokeWidth}px</span>
            </div>

            <div className="settings-group">
              <label className="settings-checkbox">
                <input
                  type="checkbox"
                  checked={canvasSettings.smoothing}
                  onChange={(e) => updateCanvasSettings({ smoothing: e.target.checked })}
                />
                <span className="checkmark"></span>
                부드러운 선
              </label>
            </div>
          </div>

          {/* 캔버스 영역 */}
          <div className="handwriting-signature__canvas-area">
            <HandwritingCanvas
              ref={canvasRef}
              onChange={handleCanvasChange}
              settings={canvasSettings}
            />
            
            <div className="canvas-controls">
              <button 
                className="btn btn--outline btn--small"
                onClick={handleUndo}
                disabled={!canvasData}
              >
                ↶ 되돌리기
              </button>
              <button 
                className="btn btn--outline btn--small"
                onClick={handleRedo}
                disabled={!canvasData}
              >
                ↷ 다시하기
              </button>
              <button 
                className="btn btn--secondary btn--small"
                onClick={handleClear}
                disabled={!canvasData}
              >
                🗑️ 지우기
              </button>
            </div>
          </div>

          {/* 처리 버튼 */}
          <div className="handwriting-signature__actions">
            <button
              className="btn btn--primary btn--large"
              onClick={processSignature}
              disabled={!canvasData || isProcessing}
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner size="small" color="white" />
                  처리중...
                </>
              ) : (
                '서명 처리하기'
              )}
            </button>
          </div>

          {/* 미리보기 및 다운로드 */}
          {processedImage && (
            <div className="handwriting-signature__result">
              <h3 className="result-title">처리 결과</h3>
              <SignaturePreview
                imageData={processedImage}
                onDownload={handleDownload}
                onSaveToGallery={handleSaveToGallery}
              />
            </div>
          )}
        </div>

        {/* 도움말 */}
        <div className="handwriting-signature__help">
          <h3>📝 사용 팁</h3>
          <ul>
            <li>터치 기기에서는 손가락이나 스타일러스를 사용하세요</li>
            <li>데스크톱에서는 마우스로 서명할 수 있습니다</li>
            <li>실수했을 때는 되돌리기 버튼을 활용하세요</li>
            <li>처리된 서명은 투명 배경의 PNG 파일로 저장됩니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HandwritingSignature;