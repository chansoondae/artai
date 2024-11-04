"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from 'next/navigation';
import app from "./../../firebaseConfig";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function ArtworkDetailPage() {
  const [artwork, setArtwork] = useState({
    title: '',
    artist: '',
    location: '',
    year: '',
    imageUrl: '',
    category: 'main', // 기본 카테고리 설정
  });
  const [loading, setLoading] = useState(true);
  const db = getFirestore(app);
  const { artworkId } = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetchArtwork = async () => {
      if (!artworkId) {
        console.error("No artworkId provided.");
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "artworks", artworkId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setArtwork({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.error("No such document exists with ID:", artworkId);
        }
      } catch (error) {
        console.error("Error fetching artwork:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [artworkId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setArtwork((prevArtwork) => ({
      ...prevArtwork,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    const userConfirmed = window.confirm("Are you sure you want to save the changes?");
    if (!userConfirmed) {
      return; // 사용자가 저장을 취소한 경우 처리 중단
    }

    try {
      const docRef = doc(db, "artworks", artworkId);
      await updateDoc(docRef, {
        title: artwork.title,
        artist: artwork.artist,
        location: artwork.location,
        year: artwork.year,
        category: artwork.category,
      });
      alert("Artwork updated successfully!");
    } catch (error) {
      console.error("Error updating artwork:", error);
      alert("Failed to update artwork.");
    }
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

  if (!artwork) {
    return (
      <div className="alert alert-danger mt-5" role="alert">
        Artwork not found!
        <div className="mt-3">
          <button onClick={() => router.push('/artworks')} className="btn btn-secondary w-100">
            Back to Artworks List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-1" style={{ paddingBottom: "10px" }}>
      <div className="mt-3" style={{ maxWidth: "800px", margin: "0 auto" }}>
        <button onClick={() => router.push('/artworks')} className="btn btn-secondary w-100">
          Back to Artworks List
        </button>
      </div>
      <div className="card mt-4" style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div className="card-body">
          {artwork.imageUrl && (
            <div className="text-center mb-4">
              <img
                src={artwork.imageUrl}
                alt={artwork.title}
                style={{
                  width: "150px",
                  height: "150px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
          )}
          <h5 className="card-text mb-4">
            Artwork ID: {artwork.id ? artwork.id : <span style={{ color: 'red' }}>undefined</span>}
          </h5>
          <div className="mb-3">
            <label htmlFor="title" className="form-label">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={artwork.title}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="artist" className="form-label">Artist</label>
            <input
              type="text"
              id="artist"
              name="artist"
              value={artwork.artist}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="location" className="form-label">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={artwork.location}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="year" className="form-label">Year</label>
            <input
              type="text"
              id="year"
              name="year"
              value={artwork.year}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Category</label>
            <div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="category"
                  value="main"
                  checked={artwork.category === 'main'}
                  onChange={handleInputChange}
                />
                <label className="form-check-label">Main</label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="category"
                  value="caravaggio"
                  checked={artwork.category === 'caravaggio'}
                  onChange={handleInputChange}
                />
                <label className="form-check-label">Caravaggio</label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="category"
                  value="gogh"
                  checked={artwork.category === 'gogh'}
                  onChange={handleInputChange}
                />
                <label className="form-check-label">Gogh</label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="category"
                  value="leopold"
                  checked={artwork.category === 'leopold'}
                  onChange={handleInputChange}
                />
                <label className="form-check-label">Leopold</label>
              </div>
            </div>
          </div>
          <button onClick={handleSaveChanges} className="btn btn-primary w-100">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
