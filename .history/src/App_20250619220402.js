// src/App.js
import React from 'react';

function App() {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center'
    }}>
      <h1>🎯 React 앱 테스트</h1>
      <p>이 메시지가 보이면 React 앱이 정상적으로 동작하고 있습니다.</p>
      <div style={{ 
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#f0f0f0',
        borderRadius: '10px'
      }}>
        <h2>다음 단계</h2>
        <p>이 화면이 보이면 기본 React 설정은 정상입니다.</p>
        <p>이제 컴포넌트를 하나씩 추가해보겠습니다.</p>
      </div>
    </div>
  );
}

export default App;