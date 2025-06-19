# OpenCV.js 설정 가이드

## 1. OpenCV.js 파일 다운로드

### 옵션 1: 직접 다운로드 (권장)
```bash
# public/opencv 폴더 생성
mkdir public/opencv

# OpenCV.js 다운로드 (4.8.0 버전)
cd public/opencv
wget https://docs.opencv.org/4.8.0/opencv.js
wget https://docs.opencv.org/4.8.0/opencv_js.wasm
```

### 옵션 2: CDN 사용 (인터넷 연결 필요)
```html
<!-- public/index.html에 추가 -->
<script async src="https://docs.opencv.org/4.8.0/opencv.js"></script>
```

## 2. 프로젝트 구조 확인
```
public/
├── opencv/
│   ├── opencv.js
│   └── opencv_js.wasm
├── index.html
└── manifest.json
```

## 3. package.json 최종 설정

### 전체 package.json 내용:
```json
{
  "name": "stamp-maker-webapp",
  "version": "1.0.0",
  "private": true,
  "homepage": "https://yourusername.github.io/stamp-maker-webapp",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "react-scripts": "5.0.1",
    "fabric": "^5.3.0",
    "html2canvas": "^1.4.1",
    "jszip": "^3.10.1",
    "file-saver": "^2.0.5",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "sass": "^1.62.0",
    "gh-pages": "^5.0.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```

## 4. GitHub Pages 배포 설정

### GitHub Repository 설정:
1. GitHub에서 새 저장소 생성: `stamp-maker-webapp`
2. 로컬 프로젝트와 연결:
```bash
git remote add origin https://github.com/yourusername/stamp-maker-webapp.git
```

3. 배포 명령어:
```bash
# 첫 배포
npm run deploy

# 이후 업데이트
npm run build
npm run deploy
```

## 5. 필수 환경 변수 설정 (선택사항)

### .env 파일 생성:
```env
REACT_APP_OPENCV_URL=https://docs.opencv.org/4.8.0/opencv.js
REACT_APP_VERSION=1.0.0
```

## 6. 개발 환경 실행

### 로컬 개발 서버 시작:
```bash
npm start
```

### 프로덕션 빌드 테스트:
```bash
npm run build
npx serve -s build
```

## 7. 트러블슈팅

### OpenCV.js 로드 실패 시:
1. 브라우저 콘솔에서 오류 확인
2. CORS 정책 확인 (로컬 파일 사용 권장)
3. 파일 경로 확인: `/opencv/opencv.js`

### GitHub Pages 배포 실패 시:
1. Repository Settings > Pages에서 소스를 "gh-pages branch"로 설정
2. package.json의 homepage URL 확인
3. `npm run deploy` 재실행

## 8. 성능 최적화

### OpenCV.js 최적화:
- 필요한 모듈만 포함하는 커스텀 빌드 사용
- Web Workers에서 처리하여 UI 블로킹 방지
- 메모리 정리 철저히 수행

### 번들 크기 최적화:
```bash
# 번들 분석
npm install --save-dev webpack-bundle-analyzer
npm run build
npx webpack-bundle-analyzer build/static/js/*.js
```