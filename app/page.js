// app/page.js

"use client"

import { useState } from 'react';
import ImageGrid from './components/ImageGrid';
import ArtModal from './components/ArtModal';
import artworks from './components/data';

export default function HomePage() {
  const [selectedArt, setSelectedArt] = useState(null);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      <ImageGrid artworks={artworks} onImageClick={(art) => setSelectedArt(art)} />
      {selectedArt && <ArtModal art={selectedArt} onClose={() => setSelectedArt(null)} />}
    </div>
  );
}
