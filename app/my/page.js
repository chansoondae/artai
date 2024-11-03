// app/my/page.js

"use client"

import { useState } from 'react';
import ImageGrid from '../components/ImageGrid';
import ArtModal from '../components/ArtModal';
import artworks from '../components/data';

// 좋아요한 작품만 필터링
const likedArtworks = artworks.filter((art) => art.liked);

export default function MyPage() {
  const [selectedArt, setSelectedArt] = useState(null); // 선택한 작품 상태

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      <ImageGrid artworks={likedArtworks} onImageClick={(art) => setSelectedArt(art)} />
      {selectedArt && (
        <ArtModal art={selectedArt} onClose={() => setSelectedArt(null)} />
      )}
    </div>
  );
}
