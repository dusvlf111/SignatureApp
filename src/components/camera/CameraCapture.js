// src/components/camera/CameraCapture.js
import React, { useRef, useState, useEffect } from 'react';
import './CameraCapture.scss';

const CameraCapture = ({ onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 후면 카메라
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    // 카메라 지원 여부 확인
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsSupported(false);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      setError(null);
      
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: facingMode
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('카메라 접근 오류:', err);
      setHasPermission(false);
      
      if (err.name === 'NotAllowedError') {
        setError('카메라 접근 권한이 필요합니다. 브라우저 설정에서 카메라 권한을 허용해주세요.');
      } else if (err.name === 'NotFoundError') {
        setError('카메라를 찾을 수 없습니다.');
      } else {
        setError('카메라를 시작할 수 없습니다.');
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // 캔버스 크기를 비디오 크기에 맞춤
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 비디오 프레임을 캔버스에 그리기
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 캔버스를 Blob으로 변환
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `capture_${Date.now()}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        
        onCapture(file);
      }
      setIsCapturing(false);
    }, 'image/jpeg', 0.9);
  };

  const retryCamera = () => {
    startCamera();
  };

  if (!isSupported) {
    return (
      <div className="camera-capture">
        <div className="camera-capture__error">
          <div className="error-icon">📷</div>
          <h3>카메라 지원 안함</h3>
          <p>이 브라우저에서는 카메라 기능을 지원하지 않습니다.</p>
          <p>최신 브라우저를 사용해주세요.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="camera-capture">
        <div className="camera-capture__error">
          <div className="error-icon">⚠️</div>
          <h3>카메라 오류</h3>
          <p>{error}</p>
          <button className="btn btn--primary" onClick={retryCamera}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="camera-capture">
        <div className="camera-capture__permission">
          <div className="permission-icon">🔐</div>
          <h3>카메라 권한 필요</h3>
          <p>서명을 촬영하기 위해 카메라 접근 권한이 필요합니다.</p>
          <button className="btn btn--primary" onClick={startCamera}>
            카메라 허용하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="camera-capture">
      <div className="camera-capture__container">
        <div className="camera-capture__video-container">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="camera-capture__video"
          />
          
          {/* 가이드 오버레이 */}
          <div className="camera-capture__overlay">
            <div className="capture-guide">
              <div className="guide-frame">
                <div className="guide-corner guide-corner--top-left"></div>
                <div className="guide-corner guide-corner--top-right"></div>
                <div className="guide-corner guide-corner--bottom-left"></div>
                <div className="guide-corner guide-corner--bottom-right"></div>
              </div>
              <div className="guide-text">
                서명/도장을 프레임 안에 맞춰주세요
              </div>
            </div>
          </div>
        </div>

        <div className="camera-capture__controls">
          {/* 카메라 전환 버튼 */}
          <button
            className="control-btn control-btn--secondary"
            onClick={switchCamera}
            title="카메라 전환"
          >
            🔄
          </button>

          {/* 촬영 버튼 */}
          <button
            className={`capture-btn ${isCapturing ? 'capture-btn--capturing' : ''}`}
            onClick={capturePhoto}
            disabled={isCapturing}
          >
            <div className="capture-btn__inner">
              {isCapturing ? '📸' : '⚪'}
            </div>
          </button>

          {/* 플래시 버튼 (향후 구현) */}
          <button
            className="control-btn control-btn--secondary"
            disabled
            title="플래시 (준비중)"
          >
            💡
          </button>
        </div>

        {/* 히든 캔버스 */}
        <canvas
          ref={canvasRef}
          className="camera-capture__canvas"
          style={{ display: 'none' }}
        />
      </div>

      {/* 촬영 팁 */}
      <div className="camera-capture__tips">
        <div className="tip-item">
          <span className="tip-icon">💡</span>
          <span className="tip-text">밝은 곳에서 촬영하세요</span>
        </div>
        <div className="tip-item">
          <span className="tip-icon">📏</span>
          <span className="tip-text">카메라를 용지와 평행하게 맞춰주세요</span>
        </div>
        <div className="tip-item">
          <span className="tip-icon">🎯</span>
          <span className="tip-text">서명이 프레임 중앙에 오도록 해주세요</span>
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;