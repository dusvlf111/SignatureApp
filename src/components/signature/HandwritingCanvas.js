// src/components/signature/HandwritingCanvas.js
import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import './HandwritingCanvas.scss';

const HandwritingCanvas = forwardRef(({ onChange, settings }, ref) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [strokes, setStrokes] = useState([]);
  const [currentStroke, setCurrentStroke] = useState([]);
  const [undoStack, setUndoStack] = useState([]);

  useImperativeHandle(ref, () => ({
    clear: () => clearCanvas(),
    undo: () => undo(),
    redo: () => redo(),
    getCanvas: () => canvasRef.current,
    getImageData: () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      return ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // 캔버스 크기 설정
    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      const rect = container.getBoundingClientRect();
      
      // 디바이스 픽셀 비율 고려
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width;
      const height = Math.min(400, rect.width * 0.6); // 비율 유지
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      
      ctx.scale(dpr, dpr);
      
      // 캔버스 설정
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);
      
      redrawStrokes();
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  useEffect(() => {
    redrawStrokes();
  }, [strokes, settings]);

  const getEventPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const pos = getEventPos(e);
    setLastPos(pos);
    setCurrentStroke([{ ...pos, pressure: 1 }]);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const currentPos = getEventPos(e);

    // 현재 스트로크에 점 추가
    const newPoint = { ...currentPos, pressure: 1 };
    setCurrentStroke(prev => [...prev, newPoint]);

    // 실시간 그리기
    ctx.strokeStyle = settings.strokeColor;
    ctx.lineWidth = settings.strokeWidth;
    ctx.globalCompositeOperation = 'source-over';

    if (settings.smoothing && currentStroke.length > 2) {
      // 베지어 곡선을 사용한 부드러운 선
      const prevPoint = currentStroke[currentStroke.length - 2];
      const controlPoint = {
        x: (lastPos.x + currentPos.x) / 2,
        y: (lastPos.y + currentPos.y) / 2
      };

      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, controlPoint.x, controlPoint.y);
      ctx.stroke();
    } else {
      // 직선
      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();
    }

    setLastPos(currentPos);
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    setIsDrawing(false);
    
    if (currentStroke.length > 0) {
      // 현재 스트로크를 저장
      const newStroke = {
        points: [...currentStroke],
        color: settings.strokeColor,
        width: settings.strokeWidth,
        smoothing: settings.smoothing
      };
      
      setStrokes(prev => {
        const newStrokes = [...prev, newStroke];
        // onChange 콜백 호출
        if (onChange) {
          onChange(getCanvasImageData());
        }
        return newStrokes;
      });
      
      setCurrentStroke([]);
      // Undo 스택 초기화 (새로운 액션이므로)
      setUndoStack([]);
    }
  };

  const redrawStrokes = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // 캔버스 클리어
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
    
    // 모든 스트로크 다시 그리기
    strokes.forEach(stroke => {
      drawStroke(ctx, stroke);
    });
  };

  const drawStroke = (ctx, stroke) => {
    if (stroke.points.length < 2) return;

    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

    if (stroke.smoothing && stroke.points.length > 2) {
      // 부드러운 곡선 그리기
      for (let i = 1; i < stroke.points.length - 1; i++) {
        const currentPoint = stroke.points[i];
        const nextPoint = stroke.points[i + 1];
        const controlPoint = {
          x: (currentPoint.x + nextPoint.x) / 2,
          y: (currentPoint.y + nextPoint.y) / 2
        };
        ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, controlPoint.x, controlPoint.y);
      }
      // 마지막 점
      const lastPoint = stroke.points[stroke.points.length - 1];
      ctx.lineTo(lastPoint.x, lastPoint.y);
    } else {
      // 직선으로 연결
      stroke.points.forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
    }

    ctx.stroke();
  };

  const clearCanvas = () => {
    setStrokes([]);
    setCurrentStroke([]);
    setUndoStack([]);
    redrawStrokes();
    if (onChange) {
      onChange(null);
    }
  };

  const undo = () => {
    if (strokes.length === 0) return;
    
    const lastStroke = strokes[strokes.length - 1];
    setUndoStack(prev => [...prev, lastStroke]);
    setStrokes(prev => prev.slice(0, -1));
    
    if (onChange) {
      onChange(strokes.length > 1 ? getCanvasImageData() : null);
    }
  };

  const redo = () => {
    if (undoStack.length === 0) return;
    
    const strokeToRedo = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setStrokes(prev => [...prev, strokeToRedo]);
    
    if (onChange) {
      onChange(getCanvasImageData());
    }
  };

  const getCanvasImageData = () => {
    const canvas = canvasRef.current;
    return canvas.toDataURL('image/png');
  };

  // 터치 이벤트에서 스크롤 방지
  const preventDefault = (e) => {
    e.preventDefault();
  };

  return (
    <div className="handwriting-canvas">
      <canvas
        ref={canvasRef}
        className="handwriting-canvas__canvas"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        onTouchCancel={stopDrawing}
        style={{ touchAction: 'none' }}
      />
      <div className="handwriting-canvas__placeholder">
        {strokes.length === 0 && (
          <div className="placeholder-text">
            여기에 서명을 작성하세요
          </div>
        )}
      </div>
    </div>
  );
});

HandwritingCanvas.displayName = 'HandwritingCanvas';

export default HandwritingCanvas;