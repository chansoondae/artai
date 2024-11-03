// app/feed/page.js

"use client"

import { useEffect, useState } from 'react';
import ImageGrid from '../components/ImageGrid';
import ArtModal from '../components/ArtModal';
import app from '../firebaseConfig';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function FeedPage() {
  const [allArtworks, setAllArtworks] = useState([]);
  const [displayedArtworks, setDisplayedArtworks] = useState([]);
  const [selectedArt, setSelectedArt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [itemsToShow, setItemsToShow] = useState(15); // 처음에 보여줄 작품 수
  const db = getFirestore(app);

  // Firestore에서 모든 작품 데이터를 불러오기
  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "artworks"));
        const artworksData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllArtworks(artworksData);
        setDisplayedArtworks(artworksData.slice(0, itemsToShow));
      } catch (error) {
        console.error("Error fetching artworks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, []);

  // 무한 스크롤 처리
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100
      ) {
        loadMoreItems();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [displayedArtworks]);

  // 더 많은 아이템을 로드하는 함수
  const loadMoreItems = () => {
    if (loadingMore) return; // 이미 로딩 중이면 실행 안함
    setLoadingMore(true);
    const nextItems = allArtworks.slice(displayedArtworks.length, displayedArtworks.length + 9);
    setDisplayedArtworks(prevItems => [...prevItems, ...nextItems]);
    setLoadingMore(false);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      {loading ? (
        <div className="d-flex justify-content-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <ImageGrid artworks={displayedArtworks} onImageClick={(art) => setSelectedArt(art)} />
          {selectedArt && <ArtModal art={selectedArt} onClose={() => setSelectedArt(null)} />}
          {loadingMore && (
            <div className="d-flex justify-content-center mt-3">
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading more...</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
