// app/components/Header.js
import React from 'react';

export default function Header() {
  return (
    <header style={styles.header}>
      <h1 style={{ ...styles.title }}>Art Friends</h1>
    </header>
  );
}

const styles = {
  header: {
    padding: '10px 20px',
    textAlign: 'center',
    borderBottom: '1px solid #ccc',
  },
  title: {
    fontFamily: 'Sacramento, cursive', // Sacramento 폰트 적용
    fontSize: '2.5rem', // 폰트 크기 조정
    color: '#333',
    margin: 0,
  },
};
