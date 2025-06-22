// src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Home.scss';

const Home = () => {
  const features = [
    {
      id: 'handwriting',
      title: '손글씨 서명',
      description: '화면에 직접 서명하여 투명 PNG로 변환',
      icon: '✏️',
      path: '/handwriting',
      color: 'primary'
    },
    {
      id: 'photo',
      title: '사진 서명 인식',
      description: 'A4 용지에 쓴 서명을 촬영하여 자동 추출',
      icon: '📷',
      path: '/photo',
      color: 'secondary'
    },
    {
      id: 'stamp',
      title: '커스텀 도장',
      description: '이름을 입력하여 전통 도장 스타일로 제작',
      icon: '🎨',
      path: '/stamp',
      color: 'accent'
    }
  ];

  const stats = [
    { label: '처리된 서명', value: '10,000+' },
    { label: '만족도', value: '98%' },
    { label: '처리 속도', value: '3초' }
  ];

  return (
    <div className="home">
      <div className="container">
        {/* 히어로 섹션 */}
        <section className="home__hero">
          <div className="home__hero-content">
            <h1 className="home__hero-title">
              전자 서명과 도장을<br />
              <span className="home__hero-highlight">쉽고 빠르게</span>
            </h1>
            <p className="home__hero-description">
              손글씨 서명부터 사진 인식, 커스텀 도장까지<br />
              모든 과정이 브라우저에서 안전하게 처리됩니다
            </p>
          </div>
          <div className="home__hero-illustration">
            <div className="home__hero-stamp">📋</div>
          </div>
        </section>

        {/* 통계 섹션 */}
        <section className="home__stats">
          {stats.map((stat, index) => (
            <div key={index} className="home__stat">
              <div className="home__stat-value">{stat.value}</div>
              <div className="home__stat-label">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* 기능 카드 섹션 */}
        <section className="home__features">
          <h2 className="home__features-title">어떤 방식을 선택하시겠어요?</h2>
          <div className="home__features-grid">
            {features.map((feature) => (
              <Link
                key={feature.id}
                to={feature.path}
                className={`home__feature-card home__feature-card--${feature.color}`}
              >
                <div className="home__feature-icon">{feature.icon}</div>
                <h3 className="home__feature-title">{feature.title}</h3>
                <p className="home__feature-description">{feature.description}</p>
                <div className="home__feature-arrow">→</div>
              </Link>
            ))}
          </div>
        </section>

        {/* 사용법 섹션 */}
        <section className="home__how-to">
          <h2 className="home__how-to-title">간단한 3단계</h2>
          <div className="home__steps">
            <div className="home__step">
              <div className="home__step-number">1</div>
              <h3 className="home__step-title">방식 선택</h3>
              <p className="home__step-description">
                손글씨, 사진, 또는 커스텀 도장 중 선택
              </p>
            </div>
            <div className="home__step">
              <div className="home__step-number">2</div>
              <h3 className="home__step-title">서명 생성</h3>
              <p className="home__step-description">
                화면에 그리거나 사진을 촬영
              </p>
            </div>
            <div className="home__step">
              <div className="home__step-number">3</div>
              <h3 className="home__step-title">다운로드</h3>
              <p className="home__step-description">
                투명 PNG 파일로 저장
              </p>
            </div>
          </div>
        </section>

        {/* 장점 섹션 */}
        <section className="home__benefits">
          <h2 className="home__benefits-title">왜 우리 서비스인가요?</h2>
          <div className="home__benefits-grid">
            <div className="home__benefit">
              <div className="home__benefit-icon">🔒</div>
              <h3 className="home__benefit-title">완전 보안</h3>
              <p className="home__benefit-description">
                모든 처리가 브라우저에서 이루어져 개인정보가 안전합니다
              </p>
            </div>
            <div className="home__benefit">
              <div className="home__benefit-icon">⚡</div>
              <h3 className="home__benefit-title">빠른 처리</h3>
              <p className="home__benefit-description">
                최신 웹 기술로 몇 초 안에 고품질 결과를 제공합니다
              </p>
            </div>
            <div className="home__benefit">
              <div className="home__benefit-icon">📱</div>
              <h3 className="home__benefit-title">모바일 최적화</h3>
              <p className="home__benefit-description">
                스마트폰에서도 편리하게 사용할 수 있습니다
              </p>
            </div>
            <div className="home__benefit">
              <div className="home__benefit-icon">💾</div>
              <h3 className="home__benefit-title">무료 사용</h3>
              <p className="home__benefit-description">
                기본 기능은 완전 무료로 제공됩니다
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;