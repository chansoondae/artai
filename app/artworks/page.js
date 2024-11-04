"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import app from "./../firebaseConfig";
import { fetchArtworks } from "./../firebaseService";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function ArtworksPage() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all"); // 기본적으로 "all" 선택

  useEffect(() => {
    const loadArtworks = async () => {
      try {
        setLoading(true);
        const artworksData = category === "all" ? await fetchArtworks() : await fetchArtworks(category);
        setArtworks(artworksData);
      } catch (error) {
        console.error("Error fetching artworks:", error);
      } finally {
        setLoading(false);
      }
    };

    loadArtworks();
  }, [category]);

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <div className="mb-4">
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name="category"
            value="all"
            checked={category === "all"}
            onChange={handleCategoryChange}
          />
          <label className="form-check-label">All</label>
        </div>
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name="category"
            value="main"
            checked={category === "main"}
            onChange={handleCategoryChange}
          />
          <label className="form-check-label">Main</label>
        </div>
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name="category"
            value="caravaggio"
            checked={category === "caravaggio"}
            onChange={handleCategoryChange}
          />
          <label className="form-check-label">Caravaggio</label>
        </div>
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name="category"
            value="gogh"
            checked={category === "gogh"}
            onChange={handleCategoryChange}
          />
          <label className="form-check-label">Gogh</label>
        </div>
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name="category"
            value="leopold"
            checked={category === "leopold"}
            onChange={handleCategoryChange}
          />
          <label className="form-check-label">Leopold</label>
        </div>
      </div>

      {/* 총 작품 수 표시 */}
      <div className="mb-3">
        <h5>총 작품 수: {artworks.length}</h5>
      </div>

      <div className="list-group">
        {artworks.map((artwork) => (
          <Link
            key={artwork.id}
            href={`/artworks/${artwork.id}`}
            className="list-group-item list-group-item-action d-flex align-items-center"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              className="me-3"
              style={{
                width: "100px",
                height: "100px",
                overflow: "hidden",
                flexShrink: 0,
                borderRadius: "8px",
                backgroundColor: "#f0f0f0",
              }}
            >
              {artwork.imageUrl ? (
                <img
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div className="d-flex justify-content-center align-items-center h-100" style={{ color: "#ccc" }}>
                  <span>No Image</span>
                </div>
              )}
            </div>
            <div>
              <h5 className="mb-1">
                {artwork.title ? artwork.title : <span style={{ color: 'red' }}>undefined</span>}
              </h5>
              <p className="mb-0">
                👤 Artist: {artwork.artist ? artwork.artist : <span style={{ color: 'red' }}>undefined</span>}
              </p>
              <p className="mb-0">
                📍 Location: {artwork.location ? artwork.location : <span style={{ color: 'red' }}>undefined</span>}
              </p>
              <p className="mb-0">
                🗓️ Year: {artwork.year ? artwork.year : <span style={{ color: 'red' }}>undefined</span>}
              </p>
              {/* <p className="mb-0">
                Category: {artwork.category ? artwork.category : <span style={{ color: 'red' }}>undefined</span>}
              </p> */}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    maxWidth: "900px",
    margin: "0 auto",
    width: "100%",
    paddingTop: "20px",
    paddingBottom: "60px", // 하단의 BottomNav 여백 추가
  },
};
