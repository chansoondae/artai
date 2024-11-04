"use client";

import React, { useState } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp, getFirestore } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import app from './../firebaseConfig';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function UploadPage() {
  const [filePreview, setFilePreview] = useState(null);
  const [artist, setArtist] = useState('');
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('main'); // 기본적으로 "main"이 선택됨
  const [isUploading, setIsUploading] = useState(false);
  const db = getFirestore(app);
  const storage = getStorage(app);

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
      const uniqueId = uuidv4();
      const storageRef = ref(storage, `artworks/${uniqueId}.jpg`);
      const blob = await fetch(filePreview).then(r => r.blob());
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      // Firestore에 데이터 추가 (timestamp, lastModified, read, likes, priority 필드 추가)
      await addDoc(collection(db, "artworks"), {
        artist,
        title,
        year: year || null,
        location: location || null,
        imageUrl: downloadURL,
        timestamp: serverTimestamp(),
        lastModified: serverTimestamp(),
        read: 0,           // 초기 조회수 0
        likes: 0,          // 초기 좋아요 수 0
        priority: 0,       // 초기 우선 순위 0
        category,          // 선택한 카테고리를 저장
      });

      alert("작품이 성공적으로 업로드되었습니다.");
      setFilePreview(null);
      setArtist('');
      setTitle('');
      setYear('');
      setLocation('');
      setCategory('main');
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("업로드 중 오류가 발생했습니다.");
    }

    setIsUploading(false);
  };

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
