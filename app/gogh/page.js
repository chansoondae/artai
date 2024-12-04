"use client";

import { useEffect, useState, useRef } from "react";
import ImageGrid from "./../components/ImageGrid";
import ArtModal from "./../components/ArtModal";
import DescriptionComponent from "./../components/DescriptionComponent";
import { fetchArtworks } from "./../firebaseService"; // firebaseService에서 불러오기
import "bootstrap/dist/css/bootstrap.min.css";
import { AiOutlineRobot, AiOutlineSend } from "react-icons/ai";
import { fetchChatGPTResponse } from './../api/chatGPT';
import app from './../firebaseConfig';
import { collection, addDoc, serverTimestamp, getFirestore } from "firebase/firestore";
import styles from './page.module.css';

// AI Chatting Modal Component
function AIChatModal({ art, onClose }) {
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const db = getFirestore(app);

  const saveChatHistory = async (question, answer, examples = []) => {
    try {
      const dataToSave = {
        timestamp: serverTimestamp(),
        imageUrl: art.imageUrl,
        title: art.title,
        artist: art.artist,
        question,
        answer,
        // examples: examples.slice(0, 3),
      };

      if (art.imageID) {
        dataToSave.imageID = art.imageID;
      }

      await addDoc(collection(db, "chatHistory"), dataToSave);
    } catch (error) {
      console.error("Error saving chat history:", error);
    }
  };

  // const scrollToBottom = () => {
  //   const modalContent = document.getElementById("modalContent");
  //   modalContent.scrollTop = modalContent.scrollHeight;
  // };

  // art.description을 초기 대화로 설정
  useEffect(() => {
    if (art && art.description) {
      setChatHistory([
        { 
          question: `${art.artist} 작가의 ${art.title} 작품에 대한 작품 설명을 해 줘?`, 
          answer:art.description, 
          loading: false }
      ]);
    }
    // scrollToBottom();
  }, [art]); 


    // messages 형식으로 변환하는 함수 추가
    const formatChatHistoryForMessages = (chatHistory) => {
      return chatHistory.map((chat) => ({
        role: chat.question ? "user" : "assistant",
        content: chat.question || chat.answer,
      }));
    };

    
  const handleSendChat = async () => {
    if (!chatInput.trim()) return;

    const userQuestion = chatInput.trim();
    setChatInput('');

    // 새로운 질문을 추가한 `chatHistory` 배열을 만들어서 최근 3개만 추출
    const updatedChatHistory = [
      ...chatHistory, 
      { question: userQuestion, answer: '생각중...', loading: true }
    ];
    setChatHistory(updatedChatHistory);
    console.log(chatHistory);

    // 최근 3개 메시지로 제한하여 서버로 전송
    const formattedMessages = formatChatHistoryForMessages(updatedChatHistory).slice(-3);
    const { answer, questionExamples } = await fetchChatGPTResponse(userQuestion, art.artist, art.title, formattedMessages);

    setChatHistory((prevHistory) =>
      prevHistory.map((chat, index) =>
        index === prevHistory.length - 1 ? { ...chat, answer, loading: false } : chat
      )
    );

    // setQuestionExamples(questionExamples);

    saveChatHistory(userQuestion, answer, questionExamples);
  
  };

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalBackground} onClick={handleBackgroundClick}>
      <div id="modalContent" className={styles.modalContent}>
      <button onClick={onClose} className={styles.closeButton}>
          ✖
        </button>
        <h3>{art.title} 물어보기</h3>
        {chatHistory.map((chat, idx) => (
                <div key={idx}>
                  <div className={styles.userMessage}>
                    <p className="mb-1">{chat.question}</p>
                  </div>
                  <div className={styles.aiMessage}>
                    <AiOutlineRobot className={styles.icon} />
                    <p className="mb-1">
                      {chat.answer}
                      {chat.loading && <span className={styles.spinner} />}
                    </p>
                  </div>
                </div>
              ))}
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="질문 입력해주세요"
          />
          <button className="btn btn-info" onClick={handleSendChat}>
            <AiOutlineSend />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [allArtworks, setAllArtworks] = useState([]);
  const [displayedArtworks, setDisplayedArtworks] = useState([]);
  const [selectedArt, setSelectedArt] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false); // New state for AI Chat modal
  const [itemsToShow, setItemsToShow] = useState(15); // 처음에 보여줄 작품 수
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // "grid" 또는 "list"
  const [expandedArt, setExpandedArt] = useState(null); // 확장된 작품 ID
  const observerRef = useRef(null);

  useEffect(() => {
    const loadArtworks = async () => {
      try {
        const artworksData = await fetchArtworks("gogh", "asc");
        setAllArtworks(artworksData);
        setDisplayedArtworks(artworksData.slice(0, itemsToShow));
        setLoading(false);
      } catch (error) {
        console.error("Error loading artworks: ", error);
        setLoading(false);
      }
    };

    loadArtworks();
  }, [itemsToShow]);

    const loadMoreItems = () => {
    if (loadingMore || displayedArtworks.length >= allArtworks.length) return;

    setLoadingMore(true);

    const nextItems = allArtworks.slice(
      displayedArtworks.length,
      displayedArtworks.length + 9
    );

    setDisplayedArtworks((prev) => [...prev, ...nextItems]);
    setLoadingMore(false);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
          loadMoreItems();
        }
      },
      { threshold: 0.1 }
    );

    const target = document.querySelector("#load-more-trigger");
    if (target) observer.observe(target);

    return () => observer.disconnect();
  }, [displayedArtworks, allArtworks]);

  const renderList = () => (
    <div>
      {displayedArtworks.map((art) => (
        <div key={art.id} className="d-flex flex-column border p-2 mb-3">
          <div className="d-flex align-items-center">
          <div className={styles.thumbnail}>
              {art.imageUrl ? (
                <img
                  src={art.imageUrl}
                  alt={art.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div className={styles.thumbnailPlaceholder}>
                  <span>No Image</span>
                </div>
              )}
            </div>
            <div className="flex-grow-1 m-3">
              <h5 className="mb-1">{art.title}</h5>
              <p className="mb-1 text-muted">{art.artist}</p>
              <p className="mb-1">🗓️ Year: {art.year}</p>
              <p className="mb-1">
                🎤 Voice:{" "}
                <span style={{ fontWeight: "bold", color: "#ff5733" }}>
                  {art.voice}
                </span>{" "}
                님
              </p>
            </div>
          </div>
          <button
            className="btn btn-outline-info btn-sm mt-1"
            onClick={() => {
              setSelectedArt(art); // 선택된 작품 정보를 설정
              setIsChatModalOpen(true); // AI Chatting 모달 열기
            }}
          >
            {art.title} 작품에 대해 질문
          </button>
          <button
            className="btn btn-outline-warning btn-sm mt-1"
            onClick={() =>
              setExpandedArt((prev) => (prev === art.id ? null : art.id))
            }
            style={{ fontSize: "14px" }}
          >
            {expandedArt === art.id ? "오디오 닫기 ▲" : "오디오 열기 ▼"}
          </button>

          {expandedArt === art.id && (
            <div className="mt-3">
              {art.youtube && (
                <iframe
                  width="100%"
                  height="315"
                  // src="https://www.youtube.com/embed/dD38WNGcdWM"
                  src={art.youtube}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              )}

              {art.description && (
                <div>
                  <DescriptionComponent description={art.description} />
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", width: "100%" }}>
      <div className="d-flex justify-content-center my-3">
        <div className="form-check me-3">
          <input
            type="radio"
            className="form-check-input"
            id="listView"
            name="viewMode"
            value="list"
            checked={viewMode === "list"}
            onChange={() => setViewMode("list")}
          />
          <label className="form-check-label" htmlFor="listView">
            List View
          </label>
        </div>
        <div className="form-check">
          <input
            type="radio"
            className="form-check-input"
            id="gridView"
            name="viewMode"
            value="grid"
            checked={viewMode === "grid"}
            onChange={() => setViewMode("grid")}
          />
          <label className="form-check-label" htmlFor="gridView">
            Grid View
          </label>
        </div>
      </div>
      {loading ? (
        <div className="d-flex justify-content-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <ImageGrid
              artworks={displayedArtworks}
              onImageClick={(art) => setSelectedArt(art)}
            />
          ) : (
            renderList()
          )}
          {/* 조건부 렌더링: viewMode에 따라 모달 선택 */}
          {viewMode === "list" && isChatModalOpen && selectedArt && (
            <AIChatModal
              art={selectedArt}
              onClose={() => {
                setIsChatModalOpen(false); // 모달 닫기
                setSelectedArt(null); // 선택된 작품 정보 초기화
              }}
            />
          )}
          {viewMode === "grid" && selectedArt && (
            <ArtModal
              art={selectedArt}
              onClose={() => setSelectedArt(null)} // 선택된 작품 정보 초기화
            />
          )}

          {loadingMore && (
            <div className="d-flex justify-content-center mt-3">
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading more...</span>
              </div>
            </div>
          )}
          <div id="load-more-trigger" style={{ height: "20px" }}></div>
        </>
      )}
    </div>
  );
}
