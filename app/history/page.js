// app/my/page.js

"use client";

import React, { useEffect, useState } from 'react';
import app from './../firebaseConfig';
import { collection, getDocs, orderBy, query, getFirestore } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import ArtModal from '../components/ArtModal';

export default function HistoryPage() {
  const [historyData, setHistoryData] = useState([]);
  const [selectedArt, setSelectedArt] = useState(null);
  const db = getFirestore(app);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const q = query(collection(db, "chatHistory"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setHistoryData(data);
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };

    fetchHistory();
  }, []);

  // Firestore 타임스탬프를 한국 시간대에 맞게 변환하고, 상대 시간을 계산하는 함수
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Unknown time";

    const date = timestamp.toDate();
    // const koreaDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);

    return formatDistanceToNow(date, { addSuffix: true, locale: ko });
  };

  const handleEntryClick = (entry) => {
    const art = {
      image: entry.imageUrl.replace(/^\//, ''),
      title: entry.title,
      artist: entry.artist,
    };
    setSelectedArt(art);
  };

  const handleCloseModal = () => {
    setSelectedArt(null);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>History</h2>
      {historyData.length > 0 ? (
        historyData.map((entry) => (
          <HistoryEntry
            key={entry.id}
            entry={entry}
            onClick={() => handleEntryClick(entry)}
            formatTimestamp={formatTimestamp} // formatTimestamp 함수를 prop으로 전달
          />
        ))
      ) : (
        <p>Now lodaing....</p>
      )}

      {/* ArtModal 컴포넌트 */}
      {selectedArt && (
        <ArtModal art={selectedArt} onClose={handleCloseModal} />
      )}
    </div>
  );
}

// 개별 기록 컴포넌트
function HistoryEntry({ entry, onClick, formatTimestamp }) { // formatTimestamp를 prop으로 받기
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <div style={styles.historyEntry} onClick={onClick}>
      {/* 이미지 로드 전 기본 이미지 표시 */}
      <div style={styles.imageContainer}>
        <img
          src={isImageLoaded ? entry.imageUrl : "/loading-placeholder.png"}
          alt={entry.title}
          style={styles.image}
          onLoad={() => setIsImageLoaded(true)}
        />
      </div>
      <h3 style={styles.title}>{entry.title}</h3>
      <p style={styles.artist}>Artist: {entry.artist}</p>
      <p style={styles.timestamp}>Written: {formatTimestamp(entry.timestamp)}</p>
      <p style={styles.question}><strong>Question:</strong> {entry.question}</p>
      <p style={styles.answer}><strong>Answer:</strong> {entry.answer}</p>
      {entry.examples && entry.examples.length > 0 && (
        <div style={styles.examples}>
          <p><strong>Related Questions:</strong></p>
          <ul style={{ listStyleType: 'none'}}>
            {entry.examples.map((example, idx) => (
              <li key={idx}>{example}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const styles = {
  historyEntry: {
    padding: '15px',
    margin: '15px 0',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
    cursor: 'pointer',
    transition: 'transform 0.3s, box-shadow 0.3s',
  },
  imageContainer: {
    width: '100%',
    height: '200px',
    overflow: 'hidden',
    borderRadius: '8px',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  artist: {
    fontSize: '1.1rem',
    color: '#666',
    marginBottom: '10px',
  },
  timestamp: {
    fontSize: '0.9rem',
    color: '#888',
    marginBottom: '10px',
  },
  question: {
    fontSize: '1rem',
    marginBottom: '5px',
  },
  answer: {
    fontSize: '1rem',
    color: '#333',
    marginBottom: '10px',
  },
  examples: {
    fontSize: '0.9rem',
    color: '#555',
  },
};
