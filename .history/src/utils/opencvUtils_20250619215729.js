// src/utils/opencvUtils.js

/**
 * OpenCV.js 로더 클래스 (CDN 방식)
 */
export class OpenCVLoader {
    static isLoaded = false;
    static loadingPromise = null;
  
    /**
     * OpenCV.js 라이브러리 로드
     * @returns {Promise<boolean>}
     */
    static async loadOpenCV() {
      if (this.isLoaded) return true;
      if (this.loadingPromise) return this.loadingPromise;
  
      this.loadingPromise = new Promise((resolve, reject) => {
        // 이미 로드된 경우
        if (window.cv && window.cv.Mat) {
          this.isLoaded = true;
          resolve(true);
          return;
        }
  
        // OpenCV 초기화 설정
        window.Module = {
          onRuntimeInitialized: () => {
            this.isLoaded = true;
            console.log('OpenCV.js loaded successfully from CDN');
            resolve(true);
          },
          printErr: function(text) {
            // 오류 출력 억제 (선택적)
            if (!text.includes('warning')) {
              console.warn('OpenCV:', text);
            }
          }
        };
        
        // 스크립트 로드 (중복 방지)
        if (!document.querySelector('script[src*="opencv.js"]')) {
          const script = document.createElement('script');
          script.src = 'https://docs.opencv.org/4.8.0/opencv.js';
          script.async = true;
          
          script.onerror = () => {
            reject(new Error('Failed to load OpenCV.js from CDN'));
          };
          
          document.head.appendChild(script);
        } else {
          // 이미 스크립트가 있으면 기다리기
          const checkReady = () => {
            if (window.cv && window.cv.Mat) {
              this.isLoaded = true;
              resolve(true);
            } else {
              setTimeout(checkReady, 100);
            }
          };
          checkReady();
        }
      });
  
      return this.loadingPromise;
    }
  }
  
  /**
   * OpenCV 유틸리티 클래스
   */
  export class OpenCVUtils {
    /**
     * 이미지 Element를 OpenCV Mat으로 변환
     * @param {HTMLImageElement} imageElement 
     * @returns {cv.Mat}
     */
    static imageToMat(imageElement) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = imageElement.width || imageElement.naturalWidth;
      canvas.height = imageElement.height || imageElement.naturalHeight;
      ctx.drawImage(imageElement, 0, 0);
      
      return window.cv.imread(canvas);
    }
  
    /**
     * File을 Mat으로 변환
     * @param {File} file 
     * @returns {Promise<cv.Mat>}
     */
    static fileToMat(file) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          try {
            const mat = this.imageToMat(img);
            URL.revokeObjectURL(img.src);
            resolve(mat);
          } catch (error) {
            reject(error);
          }
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
      });
    }
  
    /**
     * Mat을 Canvas로 변환
     * @param {cv.Mat} mat 
     * @param {string} canvasId 
     * @returns {HTMLCanvasElement}
     */
    static matToCanvas(mat, canvasId = 'opencv-canvas') {
      let canvas = document.getElementById(canvasId);
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = canvasId;
      }
      window.cv.imshow(canvas, mat);
      return canvas;
    }
  
    /**
     * Canvas를 Blob으로 변환
     * @param {HTMLCanvasElement} canvas 
     * @param {string} type 
     * @param {number} quality 
     * @returns {Promise<Blob>}
     */
    static canvasToBlob(canvas, type = 'image/png', quality = 0.9) {
      return new Promise((resolve) => {
        canvas.toBlob(resolve, type, quality);
      });
    }
  
    /**
     * 메모리 정리
     * @param {...cv.Mat} mats 
     */
    static cleanup(...mats) {
      mats.forEach(mat => {
        if (mat && typeof mat.delete === 'function') {
          mat.delete();
        }
      });
    }
  }
  
  /**
   * 이미지 전처리 클래스
   */
  export class ImagePreprocessor {
    /**
     * 이미지 밝기와 대비 조정
     * @param {cv.Mat} src 
     * @param {object} options 
     * @returns {cv.Mat}
     */
    static adjustBrightnessContrast(src, options = {}) {
      const { brightness = 0, contrast = 1.0 } = options;
      const dst = new window.cv.Mat();
      src.convertTo(dst, -1, contrast, brightness);
      return dst;
    }
  
    /**
     * 가우시안 블러 적용
     * @param {cv.Mat} src 
     * @param {number} kernelSize 
     * @returns {cv.Mat}
     */
    static gaussianBlur(src, kernelSize = 5) {
      const dst = new window.cv.Mat();
      const ksize = new window.cv.Size(kernelSize, kernelSize);
      window.cv.GaussianBlur(src, dst, ksize, 0, 0, window.cv.BORDER_DEFAULT);
      return dst;
    }
  
    /**
     * 이미지 샤프닝
     * @param {cv.Mat} src 
     * @returns {cv.Mat}
     */
    static sharpen(src) {
      const kernel = window.cv.matFromArray(3, 3, window.cv.CV_32FC1, [
        0, -1, 0,
        -1, 5, -1,
        0, -1, 0
      ]);
      const dst = new window.cv.Mat();
      window.cv.filter2D(src, dst, window.cv.CV_8U, kernel);
      kernel.delete();
      return dst;
    }
  
    /**
     * 그레이스케일 변환
     * @param {cv.Mat} src 
     * @returns {cv.Mat}
     */
    static toGrayScale(src) {
      const dst = new window.cv.Mat();
      window.cv.cvtColor(src, dst, window.cv.COLOR_RGBA2GRAY);
      return dst;
    }
  }
  
  /**
   * 배경 제거 클래스
   */
  export class BackgroundRemover {
    /**
     * 서명/도장 배경 제거 (메인 함수)
     * @param {cv.Mat} src 
     * @param {object} options 
     * @returns {cv.Mat}
     */
    static removeBackground(src, options = {}) {
      const {
        blurSize = 5,
        thresholdValue = 127,
        morphKernelSize = 3,
        contourMinArea = 100,
        useAdaptiveThreshold = false
      } = options;
  
      // 1. 그레이스케일 변환
      const gray = ImagePreprocessor.toGrayScale(src);
  
      // 2. 블러 적용
      const blurred = ImagePreprocessor.gaussianBlur(gray, blurSize);
  
      // 3. 임계값 처리
      const thresh = new window.cv.Mat();
      if (useAdaptiveThreshold) {
        window.cv.adaptiveThreshold(
          blurred,
          thresh,
          255,
          window.cv.ADAPTIVE_THRESH_GAUSSIAN_C,
          window.cv.THRESH_BINARY_INV,
          11,
          2
        );
      } else {
        window.cv.threshold(blurred, thresh, thresholdValue, 255, window.cv.THRESH_BINARY_INV);
      }
  
      // 4. 모폴로지 연산
      const morphed = this.morphologyOperation(thresh, morphKernelSize);
  
      // 5. 윤곽선 기반 마스크 생성
      const mask = this.createContourMask(morphed, contourMinArea);
  
      // 6. 결과 생성
      const result = this.applyMask(src, mask);
  
      // 메모리 정리
      OpenCVUtils.cleanup(gray, blurred, thresh, morphed, mask);
  
      return result;
    }
  
    /**
     * 모폴로지 연산 수행
     * @param {cv.Mat} src 
     * @param {number} kernelSize 
     * @returns {cv.Mat}
     */
    static morphologyOperation(src, kernelSize) {
      const kernel = window.cv.getStructuringElement(
        window.cv.MORPH_ELLIPSE,
        new window.cv.Size(kernelSize, kernelSize)
      );
      const dst = new window.cv.Mat();
      window.cv.morphologyEx(src, dst, window.cv.MORPH_CLOSE, kernel);
      kernel.delete();
      return dst;
    }
  
    /**
     * 윤곽선 기반 마스크 생성
     * @param {cv.Mat} src 
     * @param {number} minArea 
     * @returns {cv.Mat}
     */
    static createContourMask(src, minArea) {
      const contours = new window.cv.MatVector();
      const hierarchy = new window.cv.Mat();
      
      window.cv.findContours(
        src,
        contours,
        hierarchy,
        window.cv.RETR_EXTERNAL,
        window.cv.CHAIN_APPROX_SIMPLE
      );
  
      // 마스크 초기화
      const mask = window.cv.Mat.zeros(src.rows, src.cols, window.cv.CV_8UC1);
  
      // 유효한 윤곽선들로 마스크 생성
      const validContours = new window.cv.MatVector();
      for (let i = 0; i < contours.size(); i++) {
        const contour = contours.get(i);
        const area = window.cv.contourArea(contour);
        if (area > minArea) {
          validContours.push_back(contour);
        }
      }
  
      if (validContours.size() > 0) {
        const color = new window.cv.Scalar(255);
        window.cv.fillPoly(mask, validContours, color);
      }
  
      contours.delete();
      hierarchy.delete();
      validContours.delete();
  
      return mask;
    }
  
    /**
     * 마스크 적용
     * @param {cv.Mat} src 
     * @param {cv.Mat} mask 
     * @returns {cv.Mat}
     */
    static applyMask(src, mask) {
      const result = new window.cv.Mat();
      src.copyTo(result, mask);
      return result;
    }
  
    /**
     * 투명 PNG 생성
     * @param {cv.Mat} src 
     * @param {cv.Mat} mask 
     * @returns {cv.Mat}
     */
    static createTransparentPNG(src, mask = null) {
      const channels = new window.cv.MatVector();
      
      // 원본이 RGBA인 경우
      if (src.channels() === 4) {
        window.cv.split(src, channels);
      } else {
        // RGB를 RGBA로 변환
        window.cv.cvtColor(src, src, window.cv.COLOR_RGB2RGBA);
        window.cv.split(src, channels);
      }
  
      // 알파 채널 생성
      let alpha;
      if (mask) {
        alpha = mask.clone();
      } else {
        // 그레이스케일 기반 알파 채널 생성
        const gray = new window.cv.Mat();
        window.cv.cvtColor(src, gray, window.cv.COLOR_RGBA2GRAY);
        alpha = new window.cv.Mat();
        window.cv.threshold(gray, alpha, 1, 255, window.cv.THRESH_BINARY);
        gray.delete();
      }
  
      // RGBA 채널 재구성
      const rgbaChannels = new window.cv.MatVector();
      if (channels.size() >= 3) {
        rgbaChannels.push_back(channels.get(0)); // R
        rgbaChannels.push_back(channels.get(1)); // G
        rgbaChannels.push_back(channels.get(2)); // B
      }
      rgbaChannels.push_back(alpha); // A
  
      const result = new window.cv.Mat();
      window.cv.merge(rgbaChannels, result);
  
      channels.delete();
      rgbaChannels.delete();
      alpha.delete();
  
      return result;
    }
  }
  
  /**
   * 이미지 회전 보정 클래스
   */
  export class RotationCorrector {
    /**
     * 문서 회전 보정
     * @param {cv.Mat} src 
     * @param {object} options 
     * @returns {cv.Mat}
     */
    static correctRotation(src, options = {}) {
      const { 
        cannyLow = 50, 
        cannyHigh = 150,
        houghThreshold = 100,
        angleRange = 45 
      } = options;
  
      // 그레이스케일 변환
      const gray = ImagePreprocessor.toGrayScale(src);
  
      // 엣지 감지
      const edges = new window.cv.Mat();
      window.cv.Canny(gray, edges, cannyLow, cannyHigh, 3, false);
  
      // 허프 변환으로 직선 감지
      const lines = new window.cv.Mat();
      window.cv.HoughLines(edges, lines, 1, Math.PI / 180, houghThreshold);
  
      // 각도 계산
      const angle = this.calculateRotationAngle(lines, angleRange);
  
      let result;
      if (Math.abs(angle) > 0.5) { // 0.5도 이상 기울어진 경우만 보정
        result = this.rotateImage(src, angle);
      } else {
        result = src.clone();
      }
  
      OpenCVUtils.cleanup(gray, edges, lines);
      return result;
    }
  
    /**
     * 회전 각도 계산
     * @param {cv.Mat} lines 
     * @param {number} angleRange 
     * @returns {number}
     */
    static calculateRotationAngle(lines, angleRange) {
      const angles = [];
      
      for (let i = 0; i < lines.rows; i++) {
        const rho = lines.data32F[i * 2];
        const theta = lines.data32F[i * 2 + 1];
        const angle = (theta * 180 / Math.PI) - 90;
        
        // 지정된 범위 내의 각도만 고려
        if (Math.abs(angle) < angleRange) {
          angles.push(angle);
        }
      }
  
      if (angles.length === 0) return 0;
  
      // 각도의 중앙값 계산 (이상치 제거)
      angles.sort((a, b) => a - b);
      const mid = Math.floor(angles.length / 2);
      return angles.length % 2 === 0 
        ? (angles[mid - 1] + angles[mid]) / 2 
        : angles[mid];
    }
  
    /**
     * 이미지 회전
     * @param {cv.Mat} src 
     * @param {number} angle 
     * @returns {cv.Mat}
     */
    static rotateImage(src, angle) {
      const center = new window.cv.Point2f(src.cols / 2, src.rows / 2);
      const rotMat = window.cv.getRotationMatrix2D(center, angle, 1.0);
      const dst = new window.cv.Mat();
      
      window.cv.warpAffine(
        src,
        dst,
        rotMat,
        new window.cv.Size(src.cols, src.rows),
        window.cv.INTER_LINEAR,
        window.cv.BORDER_CONSTANT,
        new window.cv.Scalar(255, 255, 255, 0)
      );
  
      rotMat.delete();
      return dst;
    }
  }
  
  /**
   * 스탬프 프로세서 메인 클래스
   */
  export class StampProcessor {
    constructor() {
      this.isReady = false;
      this.processingOptions = {
        // 전처리 옵션
        brightness: 10,
        contrast: 1.2,
        sharpen: true,
        
        // 배경 제거 옵션
        blurSize: 5,
        thresholdValue: 127,
        morphKernelSize: 3,
        contourMinArea: 100,
        useAdaptiveThreshold: false,
        
        // 회전 보정 옵션
        correctRotation: true,
        cannyLow: 50,
        cannyHigh: 150,
        houghThreshold: 100,
        angleRange: 45
      };
    }
  
    /**
     * 초기화
     */
    async init() {
      try {
        await OpenCVLoader.loadOpenCV();
        this.isReady = true;
        console.log('StampProcessor initialized successfully');
      } catch (error) {
        console.error('Failed to initialize StampProcessor:', error);
        throw error;
      }
    }
  
    /**
     * 처리 옵션 설정
     * @param {object} options 
     */
    setOptions(options) {
      this.processingOptions = { ...this.processingOptions, ...options };
    }
  
    /**
     * 이미지 파일 처리 (메인 함수)
     * @param {File} imageFile 
     * @param {object} customOptions 
     * @returns {Promise<object>}
     */
    async processImage(imageFile, customOptions = {}) {
      if (!this.isReady) {
        throw new Error('StampProcessor not initialized');
      }
  
      const options = { ...this.processingOptions, ...customOptions };
  
      try {
        // 1. 파일을 Mat으로 변환
        const originalMat = await OpenCVUtils.fileToMat(imageFile);
  
        // 2. 전처리
        const preprocessed = ImagePreprocessor.adjustBrightnessContrast(originalMat, {
          brightness: options.brightness,
          contrast: options.contrast
        });
  
        let processed = preprocessed;
  
        // 3. 샤프닝 (선택적)
        if (options.sharpen) {
          const sharpened = ImagePreprocessor.sharpen(processed);
          if (processed !== preprocessed) processed.delete();
          processed = sharpened;
        }
  
        // 4. 회전 보정 (선택적)
        if (options.correctRotation) {
          const corrected = RotationCorrector.correctRotation(processed, options);
          if (processed !== preprocessed) processed.delete();
          processed = corrected;
        }
  
        // 5. 배경 제거
        const backgroundRemoved = BackgroundRemover.removeBackground(processed, options);
  
        // 6. 투명 PNG 생성
        const transparent = BackgroundRemover.createTransparentPNG(backgroundRemoved);
  
        // 7. Canvas 및 Blob 생성
        const canvas = OpenCVUtils.matToCanvas(transparent);
        const blob = await OpenCVUtils.canvasToBlob(canvas);
  
        // 8. 메모리 정리
        OpenCVUtils.cleanup(
          originalMat,
          preprocessed,
          processed !== preprocessed ? processed : null,
          backgroundRemoved,
          transparent
        );
  
        return {
          blob,
          canvas: canvas.cloneNode(),
          dataURL: canvas.toDataURL('image/png'),
          width: canvas.width,
          height: canvas.height,
          size: blob.size
        };
  
      } catch (error) {
        console.error('Error processing image:', error);
        throw error;
      }
    }
  
    /**
     * 여러 이미지 일괄 처리
     * @param {File[]} imageFiles 
     * @param {object} options 
     * @param {function} progressCallback 
     * @returns {Promise<object[]>}
     */
    async processMultipleImages(imageFiles, options = {}, progressCallback = null) {
      const results = [];
      const total = imageFiles.length;
  
      for (let i = 0; i < total; i++) {
        try {
          const result = await this.processImage(imageFiles[i], options);
          results.push({
            success: true,
            originalFile: imageFiles[i],
            result
          });
        } catch (error) {
          results.push({
            success: false,
            originalFile: imageFiles[i],
            error: error.message
          });
        }
  
        if (progressCallback) {
          progressCallback((i + 1) / total * 100, i + 1, total);
        }
      }
  
      return results;
    }
  
    /**
     * 처리 결과 미리보기 생성
     * @param {File} imageFile 
     * @returns {Promise<string>} DataURL
     */
    async createPreview(imageFile) {
      try {
        const result = await this.processImage(imageFile);
        return result.dataURL;
      } catch (error) {
        console.error('Error creating preview:', error);
        throw error;
      }
    }
  }