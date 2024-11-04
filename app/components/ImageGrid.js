"use client";

import React, { useState } from 'react';

export default function ImageGrid({ artworks, onImageClick }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', padding: '20px' }}>
      {Array.isArray(artworks) && artworks.map((art, index) => (
        <ImageWithPlaceholder key={art.id || index} artwork={art} onClick={() => onImageClick(art)} />
      ))}
    </div>
  );
}

function ImageWithPlaceholder({ artwork, onClick }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div style={{ width: '100%', paddingTop: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* Placeholder or loading spinner */}
      {!isLoaded && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      {/* Image */}
      <img
        src={artwork.imageUrl}
        alt={artwork.title}
        onClick={onClick}
        onLoad={() => setIsLoaded(true)} // 이미지 로드 완료 시 상태 업데이트
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          cursor: 'pointer',
          opacity: isLoaded ? 1 : 0, // 로드되기 전에는 이미지가 보이지 않도록
          transition: 'opacity 0.3s ease-in-out', // 부드러운 전환 효과
        }}
      />
    </div>
  );
}
