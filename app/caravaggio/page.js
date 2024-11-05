// app/caravaggio/page.js

"use client"


import { useEffect, useState, useRef } from 'react';
import ImageGrid from '../components/ImageGrid';
import ArtModal from '../components/ArtModal';
import { fetchArtworks } from '../firebaseService'; // firebaseService에서 불러오기
import 'bootstrap/dist/css/bootstrap.min.css';

export default function CaravaggioPage() {
  const [allArtworks, setAllArtworks] = useState([]);
  const [displayedArtworks, setDisplayedArtworks] = useState([]);
  const [selectedArt, setSelectedArt] = useState(null);
  const [itemsToShow, setItemsToShow] = useState(15); // 처음에 보여줄 작품 수
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef(null);

  // 데이터를 불러오기 (카테고리: 'caravaggio')
  useEffect(() => {
    const loadArtworks = async () => {
      try {
        const artworksData = await fetchArtworks('caravaggio');
        setAllArtworks(artworksData);
        setDisplayedArtworks(artworksData.slice(0, itemsToShow));
        setLoading(false);
      } catch (error) {
        console.error("Error loading artworks: ", error);
        setLoading(false);
      }
    };

    loadArtworks();
  }, [itemsToShow]);

  // 더 많은 아이템을 로드하는 함수
  const loadMoreItems = () => {
    if (loadingMore || !allArtworks) return; // 이미 로딩 중이거나 데이터가 없으면 실행 안함
    setLoadingMore(true);
    const nextItems = allArtworks.slice(displayedArtworks.length, displayedArtworks.length + 9);
    setDisplayedArtworks((prevItems) => [...prevItems, ...nextItems]);
    setLoadingMore(false);
  };

  // IntersectionObserver를 사용하여 무한 스크롤 구현
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    const handleObserver = (entries) => {
      const target = entries[0];
      if (target.isIntersecting) {
        loadMoreItems();
      }
    };

    observerRef.current = new IntersectionObserver(handleObserver);
    if (document.querySelector('#load-more-trigger')) {
      observerRef.current.observe(document.querySelector('#load-more-trigger'));
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [displayedArtworks, allArtworks]);

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
          {/* 무한 스크롤 트리거 요소 */}
          <div id="load-more-trigger" style={{ height: '20px' }}></div>
        </>
      )}
    </div>
  );
}
