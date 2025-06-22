// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { OpenCVLoader } from './utils/opencvUtils';
import Header from './components/common/Header';
import Navigation from './components/common/Navigation';
import LoadingSpinner from './components/common/LoadingSpinner';
import Home from './pages/Home';
import HandwritingSignature from './pages/HandwritingSignature';
import PhotoSignature from './pages/PhotoSignature';
import CustomStamp from './pages/CustomStamp';
import Gallery from './pages/Gallery';
import './styles/App.scss';

function App() {
  const [isOpenCVLoaded, setIsOpenCVLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        await OpenCVLoader.loadOpenCV();
        setIsOpenCVLoaded(true);
      } catch (error) {
        console.error('Failed to load OpenCV:', error);
        // OpenCV 로드 실패해도 앱은 계속 실행
        setIsOpenCVLoaded(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <div className="app-loading">
        <LoadingSpinner size="large" />
        <p>앱 초기화 중...</p>
      </div>
    );
  }

  return (
    <Router basename={process.env.NODE_ENV === 'production' ? '/SignatureApp' : ''}>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/handwriting" 
              element={<HandwritingSignature isOpenCVLoaded={isOpenCVLoaded} />} 
            />
            <Route 
              path="/photo" 
              element={<PhotoSignature isOpenCVLoaded={isOpenCVLoaded} />} 
            />
            <Route 
              path="/stamp" 
              element={<CustomStamp isOpenCVLoaded={isOpenCVLoaded} />} 
            />
            <Route path="/gallery" element={<Gallery />} />
          </Routes>
        </main>
        <Navigation />
      </div>
    </Router>
  );
}

export default App;