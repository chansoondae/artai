// app/my/page.js

"use client";

import React, { useEffect, useState, useCallback } from 'react';
import app from './../firebaseConfig';
import { collection, getDocs, orderBy, query, getFirestore, startAfter, limit, doc, getDoc } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import ArtModal from '../components/ArtModal';

export default function HistoryPage() {
  const [historyData, setHistoryData] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEnd, setIsEnd] = useState(false);
  const [selectedArt, setSelectedArt] = useState(null);
  const db = getFirestore(app);

  // Firestore에서 데이터 불러오기 함수
  const fetchHistory = useCallback(async () => {
    if (loading || isEnd) return;

    setLoading(true);
    try {
      let q = query(
        collection(db, "chatHistory"),
        orderBy("timestamp", "desc"),
        limit(5)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setIsEnd(true);
        return;
      }

      const data = await Promise.all(
        querySnapshot.docs.map(async (docSnap) => {
          const chatData = docSnap.data();
          
          // 작품의 제목과 작가 이름을 가져오기 위해 artworks 컬렉션에서 imageID 기반으로 데이터 조회
          if (chatData.imageID) {
            const artworkRef = doc(db, "artworks", chatData.imageID); // 여기에서 db를 사용하여 doc을 호출
            const artworkSnap = await getDoc(artworkRef);
            
            if (artworkSnap.exists()) {
              const artworkData = artworkSnap.data();
              return {
                id: docSnap.id,
                ...chatData,
                title: artworkData.title,
                artist: artworkData.artist,
              };
            }
          }
          
          // artwork 데이터를 찾지 못한 경우 기본 데이터만 사용
          return {
            id: docSnap.id,
            ...chatData,
          };
        })
      );

      setHistoryData(prevData => [...prevData, ...data]);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    } finally {
      setLoading(false);
    }
  }, [db, lastDoc, loading, isEnd]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleScroll = () => {
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100) {
      fetchHistory();
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Unknown time";
    const date = timestamp.toDate();
    return formatDistanceToNow(date, { addSuffix: true, locale: ko });
  };

  const handleEntryClick = (entry) => {
    const art = {
      imageUrl: entry.imageUrl,
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
        historyData.map((entry, index) => (
          <HistoryEntry
            key={`${entry.id}-${index}`}
            entry={entry}
            onClick={() => handleEntryClick(entry)}
            formatTimestamp={formatTimestamp}
          />
        ))
      ) : (
        <p>No history available.</p>
      )}

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {selectedArt && <ArtModal art={selectedArt} onClose={handleCloseModal} />}
    </div>
  );
}

// 개별 기록 컴포넌트
function HistoryEntry({ entry, onClick, formatTimestamp }) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <div style={styles.historyEntry} onClick={onClick}>
      <div style={styles.imageContainer}>
        <img
          src={isImageLoaded ? entry.imageUrl : "/loading-placeholder.png"}
          alt={entry.title}
          style={styles.image}
          onLoad={() => setIsImageLoaded(true)}
        />
      </div>
      <h3 style={styles.title}>{entry.title || "Untitled"}</h3>
      <p style={styles.artist}>Artist: {entry.artist || "Unknown"}</p>
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
