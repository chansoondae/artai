"use client";

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import app from "./../../firebaseConfig";
import { getFirestore, collection, getDocs, doc, deleteDoc, updateDoc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function AdminDashboard() {
  const [allArtworks, setAllArtworks] = useState([]);
  const [filteredArtworks, setFilteredArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categoryEdit, setCategoryEdit] = useState(null);
  const [editArtworkId, setEditArtworkId] = useState(null); // 현재 편집 중인 작품 ID
  const [editedArtwork, setEditedArtwork] = useState({}); // 편집 중인 작품 정보
  const router = useRouter();
  const db = getFirestore(app);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/admin");
      } else {
        const adminRef = doc(db, "admins", user.uid);
        const adminDoc = await getDoc(adminRef);

        if (adminDoc.exists()) {
          setIsAdmin(true);
          fetchArtworks();
        } else {
          alert("관리자 권한이 없습니다.");
          router.push("/");
        }
      }
    });

    return () => unsubscribe();
  }, [auth, db, router]);

  const fetchArtworks = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "artworks"));
      const artworksData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllArtworks(artworksData);
      setFilteredArtworks(artworksData);
    } catch (error) {
      console.error("Error fetching artworks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilterChange = (e) => {
    const selectedCategoryFilter = e.target.value;
    setCategoryFilter(selectedCategoryFilter);
    if (selectedCategoryFilter === "all") {
      setFilteredArtworks(allArtworks);
    } else {
      setFilteredArtworks(allArtworks.filter((artwork) => artwork.category === selectedCategoryFilter));
    }
  };


  const handleDeleteArtwork = async (artworkId) => {
    const userConfirmed = window.confirm("Are you sure you want to delete this artwork?");
    if (!userConfirmed) {
      return;
    }

    try {
      const docRef = doc(db, "artworks", artworkId);
      await deleteDoc(docRef);
      alert("Artwork deleted successfully!");
      setAllArtworks((prevArtworks) => prevArtworks.filter((artwork) => artwork.id !== artworkId));
      setFilteredArtworks((prevArtworks) => prevArtworks.filter((artwork) => artwork.id !== artworkId));
    } catch (error) {
      console.error("Error deleting artwork:", error);
      alert("Failed to delete artwork.");
    }
  };

  // Edit 버튼 눌렀을 때,
  const handleEditArtwork = (artwork) => {
    setEditArtworkId(artwork.id);
    setEditedArtwork({ ...artwork });
    setCategoryEdit(artwork.category);
  };

  //Edit 누르면 나오는 input text 변할때,
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedArtwork((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //Edit 누르면 나오는 radiobutton 변할때,
  const handleCategoryEditChange = (e) => {
    const selectedCategoryEdit = e.target.value;
    setCategoryEdit(selectedCategoryEdit);
    setEditedArtwork((prev) => ({
      ...prev,
      category: selectedCategoryEdit,
    }));
  };

  // Save 버튼 눌렀을 때,
  const handleSaveChanges = async () => {
    if (!editedArtwork) return;

    const userConfirmed = window.confirm("Are you sure you want to save the changes?");
    if (!userConfirmed) {
      return;
    }

    try {
      const docRef = doc(db, "artworks", editedArtwork.id);
      const { title, artist, year, location, category, youtube } = editedArtwork;
      await updateDoc(docRef, { title, artist, year, location, category, youtube });
      alert("Artwork updated successfully!");

      setAllArtworks((prevArtworks) =>
        prevArtworks.map((artwork) =>
          artwork.id === editedArtwork.id ? { ...artwork, title, artist, year, location, category, youtube } : artwork
        )
      );
      setFilteredArtworks((prevArtworks) =>
        prevArtworks.map((artwork) =>
          artwork.id === editedArtwork.id ? { ...artwork, title, artist, year, location, category, youtube } : artwork
        )
      );

      setEditArtworkId(null);
    } catch (error) {
      console.error("Error updating artwork:", error);
      alert("Failed to update artwork.");
    }
  };

  const handleCancelEdit = () => {
    setEditArtworkId(null);
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

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mt-5">
      <h1>Admin Dashboard</h1>

      <div className="d-flex justify-content-end mb-4">
        <button className="btn btn-primary" onClick={() => router.push("/upload")}>
          Upload New Artwork
        </button>
      </div>

      {/* 카테고리 필터링 라디오 버튼 */}
      <div className="mb-4">
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name="categoryFilter"
            value="all"
            checked={categoryFilter === "all"}
            onChange={handleCategoryFilterChange}
          />
          <label className="form-check-label">All</label>
        </div>
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name="categoryFilter"
            value="main"
            checked={categoryFilter === "main"}
            onChange={handleCategoryFilterChange}
          />
          <label className="form-check-label">Main</label>
        </div>
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name="categoryFilter"
            value="caravaggio"
            checked={categoryFilter === "caravaggio"}
            onChange={handleCategoryFilterChange}
          />
          <label className="form-check-label">Caravaggio</label>
        </div>
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name="categoryFilter"
            value="gogh"
            checked={categoryFilter === "gogh"}
            onChange={handleCategoryFilterChange}
          />
          <label className="form-check-label">Gogh</label>
        </div>
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name="categoryFilter"
            value="leopold"
            checked={categoryFilter === "leopold"}
            onChange={handleCategoryFilterChange}
          />
          <label className="form-check-label">Leopold</label>
        </div>
      </div>

      <div className="mb-3">
        <h5>총 작품 수: {filteredArtworks.length}</h5>
      </div>

      <div className="list-group">
        {filteredArtworks.map((artwork) => (
          <div
            key={artwork.id}
            className="list-group-item d-flex align-items-center"
            // onClick={() => handleEditArtwork(artwork)} // 클릭 시 편집 모드로 변경
            style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f0f0f0"} // Hover 시 배경색 변경
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ""} // Hover 해제 시 원래대로
          >
            <div className="me-3" style={{ width: "150px", height: "150px", overflow: "hidden", borderRadius: "8px", backgroundColor: "#f0f0f0" }}>
              {artwork.imageUrl ? (
                <img
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div className="d-flex justify-content-center align-items-center h-100" style={{ color: "#ccc" }}>
                  <span>No Image</span>
                </div>
              )}
            </div>

            {editArtworkId === artwork.id ? (
              <div className="flex-grow-1">
                <input
                  type="text"
                  className="form-control mb-1"
                  name="title"
                  value={editedArtwork.title}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  className="form-control mb-1"
                  name="artist"
                  value={editedArtwork.artist}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  className="form-control mb-1"
                  name="location"
                  value={editedArtwork.location}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  className="form-control mb-1"
                  name="year"
                  value={editedArtwork.year}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  className="form-control mb-1"
                  name="youtube"
                  value={editedArtwork.youtube || ""}
                  onChange={handleInputChange}
                />
                <div className="mb-2">
                  <label className="form-check form-check-inline me-3">
                    <input
                      type="radio"
                      className="form-check-input"
                      name="categoryEdit"
                      value="main"
                      checked={editedArtwork.category === "main"}
                      onChange={handleCategoryEditChange}
                    />
                    Main
                  </label>
                  <label className="form-check form-check-inline me-3">
                    <input
                      type="radio"
                      className="form-check-input"
                      name="categoryEdit"
                      value="caravaggio"
                      checked={editedArtwork.category === "caravaggio"}
                      onChange={handleCategoryEditChange}
                    />
                    Caravaggio
                  </label>
                  <label className="form-check form-check-inline me-3">
                    <input
                      type="radio"
                      className="form-check-input"
                      name="categoryEdit"
                      value="gogh"
                      checked={editedArtwork.category === "gogh"}
                      onChange={handleCategoryEditChange}
                    />
                    Gogh
                  </label>
                  <label className="form-check form-check-inline">
                    <input
                      type="radio"
                      className="form-check-input"
                      name="categoryEdit"
                      value="leopold"
                      checked={editedArtwork.category === "leopold"}
                      onChange={handleCategoryEditChange}
                    />
                    Leopold
                  </label>
                </div>
              </div>
            ) : (
              <div className="flex-grow-1">
                <h5 className="mb-1">{artwork.title}</h5>
                <p className="mb-1">👤 Artist: {artwork.artist}</p>
                <p className="mb-1">📍 Location: {artwork.location}</p>
                <p className="mb-1">🗓️ Year: {artwork.year}</p>
                <p className="mb-1">📂 Category: {artwork.category}</p>
                {artwork.youtube && (
                  <p className="mb-1">🎥 유튜브: {artwork.youtube}</p>
                )}
              </div>
            )}

            <div className="d-flex flex-column ms-3">
              {editArtworkId === artwork.id ? (
                <>
                  <button className="btn btn-success mb-2" onClick={handleSaveChanges}>
                    Save
                  </button>
                  <button className="btn btn-secondary" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn-warning mb-2" onClick={(e) => { e.stopPropagation(); handleEditArtwork(artwork); }}>
                    Edit
                  </button>
                  <button className="btn btn-danger" onClick={(e) => { e.stopPropagation(); handleDeleteArtwork(artwork.id); }}>
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
