// app/components/ImageGrid.js
"use client";

import React from 'react';

export default function ImageGrid({ artworks, onImageClick }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', padding: '20px' }}>
      {Array.isArray(artworks) && artworks.map((art, index) => (
        <div key={index} style={{ width: '100%', paddingTop: '100%', position: 'relative', overflow: 'hidden' }}>
          <img
            src={`/${art.image}`}
            alt={art.title}
            onClick={() => onImageClick(art)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              cursor: 'pointer',
            }}
          />
        </div>
      ))}
    </div>
  );
}
