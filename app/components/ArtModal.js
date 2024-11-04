// app/components/ArtModal.js
"use client";

import React, { useState, useEffect } from 'react';
import { AiOutlineRobot, AiOutlineSend } from 'react-icons/ai';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './ArtModal.module.css';
import { fetchChatGPTResponse } from '../api/chatGPT';
import app from './../firebaseConfig';
import { collection, addDoc, serverTimestamp, getFirestore } from "firebase/firestore";

export default function ArtModal({ art, onClose }) {
  const [chatHistory, setChatHistory] = useState([]);
  const [questionExamples, setQuestionExamples] = useState([]);
  const [isAIStarted, setIsAIStarted] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const db = getFirestore(app);

  // Firestore에 대화 저장 함수
  const saveChatHistory = async (question, answer, examples) => {
    try {
      const dataToSave = {
        timestamp: serverTimestamp(),
        imageUrl: art.imageUrl, // Firebase에서 전달받은 이미지 URL로 저장
        title: art.title,
        artist: art.artist,
        question: question,
        answer: answer,
        examples: examples.slice(1, 4),
      };

      // Only include imageID if it's defined
      if (art.imageID) {
        dataToSave.imageID = art.imageID;
      }

      await addDoc(collection(db, "chatHistory"), dataToSave);
    } catch (error) {
      console.error("Error saving chat history:", error);
    }
  };
  // AI 시작 버튼 클릭 시
  const handleStartAI = async () => {
    setIsAIStarted(true);
    const initialQuestion = `작가: ${art.artist}, 작품: ${art.title}에 대한 전시해설을 부탁드립니다.`;
    setChatHistory([...chatHistory, { question: initialQuestion, answer: '생각중...', loading: true }]);

    const { answer, questionExamples } = await fetchChatGPTResponse({
      role: "system",
      content: "You are a knowledgeable exhibition docent. Provide detailed responses in Korean, aiming for 5 to 20 sentences. Include exactly three related questions as examples, without any introductory text, numbering, or leading characters.",
    }, initialQuestion);

    setChatHistory((prevHistory) =>
      prevHistory.map((chat, index) =>
        index === prevHistory.length - 1 ? { ...chat, answer, loading: false } : chat
      )
    );
    setQuestionExamples(questionExamples);

    // Firestore에 대화 저장
    saveChatHistory(initialQuestion, answer, questionExamples);
  };

  // 예시 질문 클릭 시
  const handleExampleClick = async (example) => {
    const fullExample = `작가: ${art.artist}, 작품: ${art.title}과 관련된 질문입니다: ${example}`;
    setChatHistory([...chatHistory, { question: example, answer: '생각중...', loading: true }]);

    const { answer, questionExamples } = await fetchChatGPTResponse({
      role: "system",
      content: "You are a knowledgeable exhibition docent. Provide detailed responses in Korean, aiming for 5 to 20 sentences. Include exactly three related questions as examples, without any introductory text, numbering, or leading characters.",
    }, fullExample);

    setChatHistory((prevHistory) =>
      prevHistory.map((chat, index) =>
        index === prevHistory.length - 1 ? { ...chat, answer, loading: false } : chat
      )
    );
    setQuestionExamples(questionExamples);

    // Firestore에 대화 저장
    saveChatHistory(example, answer, questionExamples);
  };

  // 직접 입력한 질문 처리
  const handleSendQuestion = async () => {
    if (chatInput.trim() === '') return;

    const userQuestion = chatInput.trim();
    const fullUserQuestion = `작가: ${art.artist}, 작품: ${art.title}과 관련된 질문입니다: ${chatInput.trim()}`;
    setChatHistory([...chatHistory, { question: userQuestion, answer: '생각중...', loading: true }]);
    setChatInput('');

    const { answer, questionExamples } = await fetchChatGPTResponse({
      role: "system",
      content: "You are a knowledgeable exhibition docent. Provide detailed responses in Korean, aiming for 5 to 20 sentences. Include exactly three related questions as examples, without any introductory text, numbering, or leading characters.",
    }, fullUserQuestion);

    setChatHistory((prevHistory) =>
      prevHistory.map((chat, index) =>
        index === prevHistory.length - 1 ? { ...chat, answer, loading: false } : chat
      )
    );
    setQuestionExamples(questionExamples);

    // Firestore에 대화 저장
    saveChatHistory(userQuestion, answer, questionExamples);
  };

  useEffect(() => {
    const modalContent = document.getElementById("modalContent");
    modalContent.scrollTop = modalContent.scrollHeight;
  }, []);

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
      <div style={modalStyles.modalContentContainer}>
        <button onClick={onClose} style={modalStyles.closeButton}>✖</button>
        <div id="modalContent" style={modalStyles.modalContent} onClick={(e) => e.stopPropagation()}>
          <img src={art.imageUrl} alt={art.title} style={modalStyles.image} /> {/* Firebase imageUrl로 변경 */}
          <h2 style={modalStyles.title}>{art.title}</h2>
          <p style={modalStyles.artist}>{art.artist}</p>

          {isAIStarted ? (
            <div style={modalStyles.chatContainer}>
              {chatHistory.map((chat, idx) => (
                <div key={idx}>
                  <div style={modalStyles.userMessage}>
                    <p className="mb-1">{chat.question}</p>
                  </div>
                  <div style={modalStyles.aiMessage}>
                    <AiOutlineRobot style={modalStyles.icon} />
                    <p className="mb-1">
                      {chat.answer}
                      {chat.loading && <span className={styles.spinner} />}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* 관련 질문 예시와 직접 질문 입력 필드 */}
              {questionExamples.length > 0 && (
                <>
                  <div style={modalStyles.exampleButtons}>
                    {questionExamples.slice(1, 4).map((example, idx) => (
                      <button key={idx + 1} className="btn btn-outline-secondary" onClick={() => handleExampleClick(example)}>
                        {example}
                      </button>
                    ))}
                  </div>
                  <div style={modalStyles.inputContainer}>
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="질문을 입력하세요"
                      className="form-control"
                    />
                    <button onClick={handleSendQuestion} className="btn btn-secondary">
                      <AiOutlineSend />
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button onClick={handleStartAI} className="btn btn-outline-secondary">
              AI 시작
            </button>
          )}
        </div>
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
  modalContentContainer: {
    position: 'relative',
    width: '80%',
    maxWidth: '600px',
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#333',
    zIndex: 1,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '10px',
    maxHeight: '80vh',
    overflowY: 'auto',
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
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '10px',
  },
};
