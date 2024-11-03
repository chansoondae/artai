// app/components/ArtModal.js
"use client";

import React, { useState, useEffect } from 'react';
import { AiOutlineRobot } from 'react-icons/ai';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './ArtModal.module.css'; // CSS 모듈 가져오기
import { fetchChatGPTResponse } from '../api/chatGPT';

export default function ArtModal({ art, onClose }) {
  const [chatHistory, setChatHistory] = useState([]); // AI 응답 히스토리
  const [questionExamples, setQuestionExamples] = useState([]); // 질문 예시
  const [isAIStarted, setIsAIStarted] = useState(false); // AI 시작 상태

  const handleStartAI = async () => {
    setIsAIStarted(true);

    // 첫 질문을 chatHistory에 추가하여 "생각중..." + 로딩 스피너 표시
    const initialQuestion = `작가: ${art.artist}, 작품: ${art.title}에 대한 전시해설을 해주세요.`;
    setChatHistory([...chatHistory, { question: initialQuestion, answer: '생각중...', loading: true }]);

    // API 호출로 실제 응답 및 관련 질문 예시 받기
    const { answer, questionExamples } = await fetchChatGPTResponse(initialQuestion, art.artist, art.title);

    // 실제 AI 응답과 관련 질문 예시 설정
    setChatHistory((prevHistory) =>
      prevHistory.map((chat, index) =>
        index === prevHistory.length - 1 ? { ...chat, answer, loading: false } : chat
      )
    );
    setQuestionExamples(questionExamples);
  };

  const handleExampleClick = async (example) => {
    // 클릭된 질문을 chatHistory에 추가 후 "생각중..." + 로딩 스피너 표시
    const newChatHistory = [...chatHistory, { question: example, answer: '생각중...', loading: true }];
    setChatHistory(newChatHistory);

    // API 호출로 AI 응답 및 새로운 질문 예시 가져오기
    const { answer, questionExamples } = await fetchChatGPTResponse(example, art.artist, art.title);

    // 새로운 AI 답변 및 관련 질문 예시 업데이트
    setChatHistory((prevHistory) =>
      prevHistory.map((chat, index) =>
        index === prevHistory.length - 1 ? { ...chat, answer, loading: false } : chat
      )
    );
    setQuestionExamples(questionExamples);
  };

  // 모달이 처음 열릴 때 스크롤을 맨 아래로 이동
  useEffect(() => {
    const modalContent = document.getElementById("modalContent");
    modalContent.scrollTop = modalContent.scrollHeight;
  }, []); // 빈 의존성 배열로 처음 렌더링 시 한 번만 실행

  useEffect(() => {
    if (isAIStarted || chatHistory.length > 0) {
      const modalContent = document.getElementById("modalContent");
      modalContent.scrollTop = modalContent.scrollHeight;
    }
  }, [isAIStarted, chatHistory]);

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div style={modalStyles.modalBackground} onClick={handleBackgroundClick}>
      <div id="modalContent" style={modalStyles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={modalStyles.closeButton}>✖</button>
        <img src={`/${art.image}`} alt={art.title} style={modalStyles.image} />
        <h2 style={modalStyles.title}>{art.title}</h2>
        <p style={modalStyles.artist}>{art.artist}</p>

        {isAIStarted ? (
          <div style={modalStyles.chatContainer}>
            {/* Chat history */}
            {chatHistory.map((chat, idx) => (
              <div key={idx}>
                <div style={modalStyles.userMessage}>
                  <p className="mb-1">{chat.question}</p>
                </div>
                <div style={modalStyles.aiMessage}>
                  <AiOutlineRobot style={modalStyles.icon} />
                  <p className="mb-1">
                    {chat.answer}
                    {chat.loading && <span className={styles.spinner} />} {/* 로딩 스피너 추가 */}
                  </p>
                </div>
              </div>
            ))}

            {/* Question examples (2nd to 4th only, with Bootstrap button style) */}
            <div style={modalStyles.exampleButtons}>
              {questionExamples.slice(1, 4).map((example, idx) => (
                <button key={idx + 1} className="btn btn-outline-secondary" onClick={() => handleExampleClick(example)}>
                  {example}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button onClick={handleStartAI} className="btn btn-outline-secondary">
            AI 시작
          </button>
        )}
      </div>
    </div>
  );
}

const modalStyles = {
  modalBackground: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: '20px',
    width: '80%',
    maxWidth: '600px',
    maxHeight: '80%',
    borderRadius: '10px',
    position: 'relative',
    overflowY: 'auto', // 전체 모달에 스크롤
  },
  closeButton: {
    position: 'absolute', // 모달 창의 오른쪽 상단에 고정
    top: '10px',
    right: '10px',
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#333',
  },
  image: {
    width: '100%',
    borderRadius: '10px',
  },
  title: {
    fontFamily: 'Georgia, serif',
    fontSize: '1.8rem',
    fontWeight: 'bold',
    fontStyle: 'italic',
    margin: '20px 0 10px',
    color: '#333',
  },
  artist: {
    fontFamily: 'Arial, sans-serif',
    fontSize: '1.2rem',
    color: '#666',
    marginBottom: '20px',
  },
  chatContainer: {
    marginTop: '20px',
  },
  userMessage: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#e0f7fa',
    padding: '10px',
    borderRadius: '15px',
    marginBottom: '8px',
  },
  aiMessage: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f0f4c3',
    padding: '10px',
    borderRadius: '15px',
    marginBottom: '8px',
  },
  icon: {
    marginRight: '8px',
    fontSize: '1.5rem',
  },
  exampleButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '10px',
  },
};
