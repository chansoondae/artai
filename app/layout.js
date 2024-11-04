// app/layout.js
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import Header from './components/Header';
import BottomNav from './components/BottomNav';

export const metadata = {
  title: 'Art Friends - AI Docent',
  description: 'AI Docent web service for art exploration',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <link
          href="https://fonts.googleapis.com/css2?family=Sacramento&display=swap"
          rel="stylesheet"
        />
        <div style={styles.placeholder} /> {/* 헤더 높이만큼의 공간 추가 */}
        <div style={styles.container}>
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}

const styles = {
  placeholder: {
    height: '70px', // 고정된 헤더의 높이와 동일한 높이로 여백을 추가합니다.
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    width: '100%',
    paddingBottom: '60px', // Bottom navigation을 위한 여백 추가
  },
};
