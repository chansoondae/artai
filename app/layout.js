// app/layout.js
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Head from 'next/head';
import Script from 'next/script';

export const metadata = {
  title: 'Art Friends - AI Docent',
  description: 'AI Docent web service for art exploration',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        {/* 기본 메타 정보 */}
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />

        {/* Open Graph 메타 태그 */}
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:image" content="https://www.artfrnd.com/01.jpg" /> {/* 썸네일 이미지 URL */}
        <meta property="og:url" content="https://www.artfrnd.com" />
        <meta property="og:type" content="website" />

        {/* Twitter Card 메타 태그 */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content="https://www.artfrnd.com/01.jpg" /> {/* 썸네일 이미지 URL */}

        {/* 구글 폰트 링크 */}
        <link
          href="https://fonts.googleapis.com/css2?family=Sacramento&display=swap"
          rel="stylesheet"
        />
        {/* Google Analytics Script */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENTID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENTID}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </Head>
      <body>
        <Header />
        <div style={styles.container}>
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    width: '100%',
    paddingBottom: '60px', // Bottom navigation을 위한 여백 추가
    paddingTop: "70px", // 고정된 헤더의 높이만큼 여백 추가
    paddingBottom: "60px", // 하단의 BottomNav 여백 추가
  },
};
