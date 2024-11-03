// app/components/Header.js
import React from 'react';

export default function Header() {
  return (
    <header style={styles.header}>
      <h1 style={styles.title}>Art Friends</h1>
    </header>
  );
}

const styles = {
  header: {
    padding: '10px 20px', // 상하 여백을 줄여 컴팩트하게
    textAlign: 'center',
    borderBottom: '1px solid #ccc',
  },
  title: {
    fontFamily: 'Brush Script MT, cursive',
    fontSize: '2rem', // 폰트 크기를 줄여 높이 절약
    color: '#333',
    margin: 0, // 제목의 기본 여백 제거
  },
};
