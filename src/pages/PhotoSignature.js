// src/pages/PhotoSignature.js
import React, { useState, useRef } from 'react';
import CameraCapture from '../components/camera/CameraCapture';
import ImageProcessor from '../components/camera/ImageProcessor';
import SignaturePreview from '../components/signature/SignaturePreview';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { StampProcessor } from '../utils/opencvUtils';
import { saveAs } from 'file-saver';
import { v4 as uuidv4 } from 'uuid';
import './PhotoSignature.scss';

const PhotoSignature = ({ isOpenCVLoaded }) => {
  const [currentStep, setCurrentStep] = useState('capture'); // capture, process, result
  const [capturedImage, setCapturedImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingOptions, setProcessingOptions] = useState({
    brightness: 10,
    contrast: 1.2,
    threshold: 127,
    morphKernel: 3,
    useAdaptiveThreshold: false,
    correctRotation: true
  });
  const [error, setError] = useState(null);
  const stampProcessorRef = useRef(null);

  // StampProcessor 초기화
  React.useEffect(() => {
    if (isOpenCVLoaded && !stampProcessorRef.current) {
      stampProcessorRef.current = new StampProcessor();
      stampProcessorRef.current.init().catch(console.error);
    }
  }, [isOpenCVLoaded]);

  const handleImageCapture = (imageFile) => {
    setCapturedImage(imageFile);
    setCurrentStep('process');
    setError(null);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setCapturedImage(file);
      setCurrentStep('process');
      setError(null);
    }
  };

  const processImage = async () => {
    if (!capturedImage || !stampProcessorRef.current) {
      setError('이미지가 없거나 처리기가 준비되지 않았습니다.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await stampProcessorRef.current.processImage(
        capturedImage,
        processingOptions
      );

      setProcessedImage(result);
      setCurrentStep('result');
    } catch (error) {
      console.error('이미지 처리 오류:', error);
      setError('이미지 처리 중 오류가 발생했습니다. 다른 이미지로 시도해보세요.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedImage) return;
    
    const filename = `photo_signature_${new Date().toISOString().slice(0, 10)}_${uuidv4().slice(0, 8)}.png`;
    saveAs(processedImage.blob, filename);
  };

  const handleSaveToGallery = () => {
    if (!processedImage) return;

    try {
      const savedImages = JSON.parse(localStorage.getItem('stampMaker_gallery') || '[]');
      const newImage = {
        id: uuidv4(),
        type: 'photo',
        name: `사진 서명 ${new Date().toLocaleDateString()}`,
        dataURL: processedImage.dataURL,
        createdAt: new Date().toISOString(),
        size: processedImage.size,
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

  const resetProcess = () => {
    setCurrentStep('capture');
    setCapturedImage(null);
    setProcessedImage(null);
    setError(null);
  };

  const updateProcessingOptions = (newOptions) => {
    setProcessingOptions(prev => ({ ...prev, ...newOptions }));
  };

  if (!isOpenCVLoaded) {
    return (
      <div className="photo-signature">
        <div className="container">
          <div className="photo-signature__loading">
            <LoadingSpinner size="large" />
            <p>이미지 처리 엔진을 로딩 중입니다...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="photo-signature">
      <div className="container">
        <div className="photo-signature__header">
          <h1 className="photo-signature__title">사진 서명 인식</h1>
          <p className="photo-signature__description">
            A4 용지에 작성한 서명이나 도장을 촬영하면 자동으로 배경을 제거하여 투명 PNG로 변환합니다.
          </p>
        </div>

        {/* 진행 단계 표시 */}
        <div className="photo-signature__progress">
          <div className={`progress-step ${currentStep === 'capture' ? 'active' : currentStep !== 'capture' ? 'completed' : ''}`}>
            <div className="progress-step__number">1</div>
            <div className="progress-step__label">사진 촬영</div>
          </div>
          <div className={`progress-step ${currentStep === 'process' ? 'active' : currentStep === 'result' ? 'completed' : ''}`}>
            <div className="progress-step__number">2</div>
            <div className="progress-step__label">이미지 처리</div>
          </div>
          <div className={`progress-step ${currentStep === 'result' ? 'active' : ''}`}>
            <div className="progress-step__number">3</div>
            <div className="progress-step__label">결과 확인</div>
          </div>
        </div>

        <div className="photo-signature__content">
          {/* 1단계: 이미지 캡처 */}
          {currentStep === 'capture' && (
            <div className="capture-step">
              <div className="photo-signature__tips">
                <h3>📷 촬영 가이드</h3>
                <ul>
                  <li>A4 용지를 1/4로 접어서 서명 또는 도장을 찍어주세요</li>
                  <li>조명이 밝고 그림자가 없는 곳에서 촬영하세요</li>
                  <li>카메라를 용지와 평행하게 맞춰주세요</li>
                  <li>서명/도장이 화면 중앙에 오도록 해주세요</li>
                </ul>
              </div>

              <CameraCapture onCapture={handleImageCapture} />

              <div className="photo-signature__divider">
                <span>또는</span>
              </div>

              <div className="file-upload-section">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="file-input"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="file-upload-button">
                  📁 갤러리에서 선택
                </label>
              </div>
            </div>
          )}

          {/* 2단계: 이미지 처리 */}
          {currentStep === 'process' && (
            <div className="process-step">
              <ImageProcessor
                image={capturedImage}
                options={processingOptions}
                onOptionsChange={updateProcessingOptions}
              />

              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}

              <div className="process-actions">
                <button
                  className="btn btn--secondary"
                  onClick={resetProcess}
                >
                  ← 다시 촬영
                </button>
                <button
                  className="btn btn--primary btn--large"
                  onClick={processImage}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <LoadingSpinner size="small" color="white" />
                      처리중...
                    </>
                  ) : (
                    '배경 제거하기'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 3단계: 결과 */}
          {currentStep === 'result' && processedImage && (
            <div className="result-step">
              <h3 className="result-title">처리 완료!</h3>
              
              <SignaturePreview
                imageData={processedImage}
                onDownload={handleDownload}
                onSaveToGallery={handleSaveToGallery}
              />

              <div className="result-actions">
                <button
                  className="btn btn--outline"
                  onClick={resetProcess}
                >
                  새로운 이미지 처리
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoSignature;