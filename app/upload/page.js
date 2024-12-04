"use client";

import React, { useState, useEffect } from 'react';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp, getFirestore, doc, getDoc } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import DOMPurify from 'dompurify'; // Input sanitization을 위해 사용
import app from './../firebaseConfig';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function UploadPage() {
  const [filePreview, setFilePreview] = useState(null);
  const [artist, setArtist] = useState('');
  const [title, setTitle] = useState('');
  const [titleENG, setTitleENG] = useState('');
  const [year, setYear] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('main'); // 기본적으로 "main"이 선택됨
  const [priority, setPriority] = useState(0);
  const [voice, setVoice] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);

  useEffect(() => {
    // 로그인 상태 확인
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        // Firestore에서 관리자 여부 확인
        const adminRef = doc(db, "admins", user.uid);
        const adminDoc = await getDoc(adminRef);
        
        if (adminDoc.exists()) {
          setIsAdmin(true);
        } else {
          alert("관리자 권한이 없습니다.");
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, [auth, db]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === "image/jpeg" || selectedFile.type === "image/png")) {
      resizeImage(selectedFile, 1000, 1000).then((resizedBlob) => {
        const resizedUrl = URL.createObjectURL(resizedBlob);
        setFilePreview(resizedUrl);
      }).catch((error) => {
        console.error("Error resizing image:", error);
        alert("이미지 리사이즈 중 오류가 발생했습니다.");
      });
    } else {
      alert("jpg 또는 png 형식의 파일만 업로드할 수 있습니다.");
    }
  };

  const resizeImage = (file, maxWidth, maxHeight) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          resolve(blob);
        }, file.type, 0.8);
      };
      img.onerror = () => reject(new Error("Image load error"));
    });
  };

  const handleUpload = async () => {
    if (!filePreview || !artist || !title) {
      alert("이미지 파일, 작가 이름, 작품 제목을 입력해 주세요.");
      return;
    }

    setIsUploading(true);

    try {
      // Input sanitization using DOMPurify to prevent XSS
      const sanitizedArtist = DOMPurify.sanitize(artist);
      const sanitizedTitle = DOMPurify.sanitize(title);
      const sanitizedTitleENG = DOMPurify.sanitize(titleENG);
      const sanitizedYear = DOMPurify.sanitize(year);
      const sanitizedLocation = DOMPurify.sanitize(location);
      const sanitizedVoice = DOMPurify.sanitize(voice);
      const sanitizedDescription = DOMPurify.sanitize(description);

      const uniqueId = uuidv4();
      const storageRef = ref(storage, `artworks/${uniqueId}.jpg`);
      const blob = await fetch(filePreview).then(r => r.blob());
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      // Firestore에 데이터 추가 (timestamp, lastModified, read, likes, priority 필드 추가)
      await addDoc(collection(db, "artworks"), {
        artist: sanitizedArtist,
        title: sanitizedTitle,
        titleENG: sanitizedTitleENG,
        year: sanitizedYear || null,
        location: sanitizedLocation || null,
        imageUrl: downloadURL,
        timestamp: serverTimestamp(),
        voice: sanitizedVoice,
        description: sanitizedDescription,
        lastModified: serverTimestamp(),
        read: 0,           // 초기 조회수 0
        likes: 0,          // 초기 좋아요 수 0
        priority,// 초기 우선 순위 0
        category,          // 선택한 카테고리를 저장
      });

      alert("작품이 성공적으로 업로드되었습니다.");
      setFilePreview(null);
      setArtist('');
      setTitle('');
      setTitleENG('');
      setYear('');
      setLocation('');
      setCategory('main');
      setPriority(0);
      setVoice('');
      setDescription('');
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("업로드 중 오류가 발생했습니다.");
    }

    setIsUploading(false);
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error during login:", error);
      alert("Failed to log in. Please try again.");
    }
  };

  if (!user) {
    return (
      <div className="container mt-5 p-4 shadow-sm rounded bg-light" style={{ maxWidth: '600px' }}>
        <h2 className="text-center mb-4">로그인이 필요합니다</h2>
        <div className="text-center">
          <button onClick={handleGoogleLogin} className="btn btn-primary">Sign in with Google</button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mt-5 p-4 shadow-sm rounded bg-light" style={{ maxWidth: '600px' }}>
        <h2 className="text-center mb-4" style={{ color: "red" }}>관리자 권한이 없습니다</h2>
      </div>
    );
  }

  return (
    <div className="container mt-5 p-4 shadow-sm rounded bg-light" style={{ maxWidth: '600px' }}>
      <h2 className="text-center mb-4">작품 업로드</h2>
      <form>
        <div className="mb-3">
          <label className="form-label">이미지 파일 (jpg 또는 png)</label>
          <input type="file" className="form-control" accept="image/jpeg, image/png" onChange={handleFileChange} />
          {filePreview && (
            <img src={filePreview} alt="미리보기" className="img-thumbnail mt-3 w-100" />
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">작가 이름</label>
          <input 
            type="text" 
            className="form-control" 
            value={artist} 
            onChange={(e) => setArtist(e.target.value)} 
            placeholder="작가 이름을 입력하세요" 
          />
        </div>

        <div className="mb-3">
          <label className="form-label">작품 제목</label>
          <input 
            type="text" 
            className="form-control" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="작품 제목을 입력하세요" 
          />
        </div>
        <div className="mb-3">
          <label className="form-label">작품 영문 제목</label>
          <input 
            type="text" 
            className="form-control" 
            value={titleENG} 
            onChange={(e) => setTitleENG(e.target.value)} 
            placeholder="작품 제목(영문)을 입력하세요" 
          />
        </div>
        <div className="mb-3">
          <label className="form-label">제작 연도 (선택 사항)</label>
          <input 
            type="text" 
            className="form-control" 
            value={year} 
            onChange={(e) => setYear(e.target.value)} 
            placeholder="제작 연도를 입력하세요" 
          />
        </div>

        <div className="mb-3">
          <label className="form-label">소장처 (선택 사항)</label>
          <input 
            type="text" 
            className="form-control" 
            value={location} 
            onChange={(e) => setLocation(e.target.value)} 
            placeholder="소장처를 입력하세요" 
          />
        </div>
        <div className="mb-3">
          <label className="form-label">우선 순위 (선택 사항)</label>
          <input 
            type="number" 
            className="form-control" 
            value={priority} 
            onChange={(e) => setPriority(Number(e.target.value))}
            min="0"
            max="100" 
          />
        </div>
        <div className="mb-3">
          <label className="form-label">나레이션</label>
          <input 
            type="text" 
            className="form-control" 
            value={voice} 
            onChange={(e) => setVoice(e.target.value)} 
            placeholder="나레이션 닉네임 입력하세요" 
          />
        </div>
        <div className="mb-3">
          <label className="form-label">작품 해설</label>
          <textarea
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="작품해설"
            rows="5" // 원하는 높이 (줄 수)
            style={{ width: "100%" }} // CSS 스타일 적용
          />
        </div>

        <div className="mb-3">
          <label className="form-label">카테고리 선택</label>
          <div>
            <div className="form-check">
              <input 
                className="form-check-input" 
                type="radio" 
                name="category" 
                value="main" 
                checked={category === 'main'} 
                onChange={(e) => setCategory(e.target.value)} 
              />
              <label className="form-check-label">Main</label>
            </div>
            <div className="form-check">
              <input 
                className="form-check-input" 
                type="radio" 
                name="category" 
                value="caravaggio" 
                checked={category === 'caravaggio'} 
                onChange={(e) => setCategory(e.target.value)} 
              />
              <label className="form-check-label">Caravaggio</label>
            </div>
            <div className="form-check">
              <input 
                className="form-check-input" 
                type="radio" 
                name="category" 
                value="gogh" 
                checked={category === 'gogh'} 
                onChange={(e) => setCategory(e.target.value)} 
              />
              <label className="form-check-label">Gogh</label>
            </div>
            <div className="form-check">
              <input 
                className="form-check-input" 
                type="radio" 
                name="category" 
                value="leopold" 
                checked={category === 'leopold'} 
                onChange={(e) => setCategory(e.target.value)} 
              />
              <label className="form-check-label">Leopold</label>
            </div>
          </div>
        </div>

        <button 
          type="button" 
          className="btn btn-primary w-100" 
          onClick={handleUpload} 
          disabled={isUploading}
        >
          {isUploading ? (
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Uploading...</span>
            </div>
          ) : (
            "업로드"
          )}
        </button>
      </form>
    </div>
  );
}
