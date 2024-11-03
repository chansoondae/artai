// app/search/page.js
"use client";

import { useState, useEffect } from 'react';
import { AiOutlineSearch } from 'react-icons/ai'; // 검색 아이콘 추가
import ArtModal from '../components/ArtModal'; // ArtModal 컴포넌트 추가
import artworks from '../components/data';

export default function SearchPage() {
  const [query, setQuery] = useState(''); // 검색어 상태
  const [results, setResults] = useState([]); // 필터링된 결과
  const [selectedArt, setSelectedArt] = useState(null); // 선택된 작품
  const [relatedArtworks, setRelatedArtworks] = useState([]); // 같은 작가의 다른 작품들
  const [showModal, setShowModal] = useState(false); // 모달 표시 상태

  useEffect(() => {
    // 검색어가 변경될 때마다 자동 완성 결과 필터링
    if (query) {
      const filtered = artworks.filter(
        (art) =>
          art.title.toLowerCase().includes(query.toLowerCase()) ||
          art.artist.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]); // 검색어가 없으면 결과를 비웁니다.
    }
  }, [query]);

  // 자동 완성 리스트에서 항목을 클릭했을 때
  const handleSelectArt = (selectedArt) => {
    setSelectedArt(selectedArt); // 선택된 작품 설정
    setQuery(''); // 검색어 입력 필드를 빈 칸으로 초기화

    // 동일한 작가의 다른 작품들 필터링
    const related = artworks.filter(
      (art) => art.artist === selectedArt.artist && art.title !== selectedArt.title
    );

    setRelatedArtworks(related); // 같은 작가의 작품 설정
    setResults([]); // 자동 완성 결과 리스트를 비웁니다.
  };

  // 카드 클릭 시 모달 열기
  const handleCardClick = (art) => {
    setSelectedArt(art);
    setShowModal(true); // 모달 열기
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setShowModal(false); // 모달 닫기
  };

  return (
    <div className="container mt-5">
      {/* 검색 입력 필드 */}
      <div className="row justify-content-center mb-4">
        <div className="col-md-8 col-lg-6">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <AiOutlineSearch style={{ fontSize: '1.2rem', color: '#6c757d' }} />
            </span>
            <input
              type="text"
              placeholder="Search by title or artist"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="form-control border-start-0 rounded-end"
              style={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}
            />
          </div>
          {/* 자동 완성 결과 리스트 */}
          {results.length > 0 && (
            <ul className="list-group mt-3">
              {results.map((art, index) => (
                <li
                  key={index}
                  className="list-group-item"
                  onClick={() => handleSelectArt(art)}
                  style={{ cursor: 'pointer' }}
                >
                  <strong>{art.title}</strong> <br />
                  <span className="text-muted">{art.artist}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 선택된 작품 및 관련 작품 */}
      {selectedArt && (
        <>
          {/* 선택된 작품 Card */}
          <div className="row justify-content-center mt-4">
            <div className="col-md-8">
              <div
                className="card mb-4"
                onClick={() => handleCardClick(selectedArt)}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={`/${selectedArt.image}`}
                  alt={selectedArt.title}
                  className="card-img-top"
                  style={{ height: '400px', objectFit: 'cover' }}
                />
                <div className="card-body">
                  <h5 className="card-title">{selectedArt.title}</h5>
                  <p className="card-text text-muted">{selectedArt.artist}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 같은 작가의 다른 작품들 */}
          <div className="row mt-4">
            {relatedArtworks.map((art, index) => (
              <div key={index} className="col-md-4 mb-4">
                <div
                  className="card"
                  onClick={() => handleCardClick(art)}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src={`/${art.image}`}
                    alt={art.title}
                    className="card-img-top"
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  <div className="card-body">
                    <h5 className="card-title text-truncate">{art.title}</h5>
                    <p className="card-text text-muted text-truncate">{art.artist}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 모달 창 */}
      {showModal && selectedArt && (
        <ArtModal art={selectedArt} onClose={handleCloseModal} /> // 모달 컴포넌트
      )}
    </div>
  );
}