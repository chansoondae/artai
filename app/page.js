"use client";

import { useEffect, useState } from 'react';
import ImageGrid from './components/ImageGrid';
import ArtModal from './components/ArtModal';
import { fetchArtworks } from './firebaseService'; // firebaseService에서 불러오기
import 'bootstrap/dist/css/bootstrap.min.css';

export default function HomePage() {
  const [allArtworks, setAllArtworks] = useState([]);
  const [displayedArtworks, setDisplayedArtworks] = useState([]);
  const [selectedArt, setSelectedArt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [itemsToShow, setItemsToShow] = useState(15); // 처음에 보여줄 작품 수

  // Firestore에서 카테고리가 "main"인 작품 데이터를 불러오기
  useEffect(() => {
    const loadArtworks = async () => {
      // "main" 카테고리의 작품만 가져오기 위해 fetchArtworks 함수 호출 시 "main" 전달
      const artworksData = await fetchArtworks("main");
      setAllArtworks(artworksData);
      setDisplayedArtworks(artworksData.slice(0, itemsToShow));
      setLoading(false);
    };

    loadArtworks();
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
