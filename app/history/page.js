// app/history/page.js

"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import app from './../firebaseConfig';
import { 
  collection, 
  getDocs, 
  orderBy, 
  query, 
  getFirestore, 
  startAfter, 
  limit, 
  doc, 
  getDocs as batchedGetDocs // 변경: 데이터 배치로 가져오기
} from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import ArtModal from '../components/ArtModal';

export default function HistoryPage() {
  const [historyData, setHistoryData] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEnd, setIsEnd] = useState(false);
  const [selectedArt, setSelectedArt] = useState(null);
  const observerRef = useRef(null);
  const db = getFirestore(app);

  // Fetch chat history and associated artwork details
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

      // Batched get artwork details for each chat history entry
      const data = await Promise.all(
        querySnapshot.docs.map(async (docSnap) => {
          const chatData = docSnap.data();

          // Fetch artwork data if imageID is available in a batched way
          if (chatData.imageID) {
            try {
              const artworksRef = collection(db, "artworks");
              const artworkQuery = query(artworksRef, limit(10)); // 데이터 배치로 가져오기
              const artworkSnapshot = await batchedGetDocs(artworkQuery);
              const artworkData = artworkSnapshot.docs.map((artDoc) => artDoc.data());
              const matchedArtwork = artworkData.find((art) => art.imageID === chatData.imageID);

              if (matchedArtwork) {
                return {
                  id: docSnap.id,
                  ...chatData,
                  title: matchedArtwork.title,
                  artist: matchedArtwork.artist,
                  imageUrl: matchedArtwork.imageUrl,
                  imageID: chatData.imageID,
                };
              }
            } catch (error) {
              console.error("Error fetching artwork data:", error);
            }
          }

          // If artwork data not found, return chat data as is
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
  }, [fetchHistory]);

  // IntersectionObserver를 사용하여 무한 스크롤 구현
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    const handleObserver = (entries) => {
      const target = entries[0];
      if (target.isIntersecting) {
        fetchHistory();
      }
    };

    observerRef.current = new IntersectionObserver(handleObserver);
    const triggerElement = document.querySelector('#load-more-trigger');
    if (triggerElement) {
      observerRef.current.observe(triggerElement);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [fetchHistory]);

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

      {/* 무한 스크롤 트리거 요소 */}
      <div id="load-more-trigger" style={{ height: '20px' }}></div>
    </div>
  );
}

// History entry component
function HistoryEntry({ entry, onClick, formatTimestamp }) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <div style={styles.historyEntry} onClick={onClick}>
      <div style={styles.imageContainer}>
        <img
          src={isImageLoaded ? entry.imageUrl : "/loading-placeholder.png"}
          alt={entry.title || "Untitled"}
          style={styles.image}
          onLoad={() => setIsImageLoaded(true)}
        />
      </div>
      <h3 style={styles.title}>{entry.title || "Untitled"}</h3>
      <p style={styles.artist}>{entry.artist || "Unknown"}</p>
      <p style={styles.timestamp}>Written: {formatTimestamp(entry.timestamp)}</p>
      <p style={styles.question}><strong>Question:</strong> {entry.question}</p>
      <p style={styles.answer}><strong>Answer:</strong> {entry.answer}</p>
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
    padding: '10px',
    backgroundColor: '#e7f3fe', // Question 배경색
    borderRadius: '5px',
    borderLeft: '4px solid #007bff', // 왼쪽 색 강조
  },
  answer: {
    fontSize: '1rem',
    color: '#333',
    marginBottom: '10px',
    padding: '10px',
    backgroundColor: '#f1f1f1', // Answer 배경색
    borderRadius: '5px',
    borderLeft: '4px solid #28a745', // 왼쪽 색 강조
  },
  
};

