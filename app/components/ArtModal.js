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

  const saveChatHistory = async (question, answer, examples = []) => {
    try {
      const dataToSave = {
        timestamp: serverTimestamp(),
        imageUrl: art.imageUrl,
        title: art.title,
        artist: art.artist,
        question,
        answer,
        examples: examples.slice(0, 3),
      };

      if (art.imageID) {
        dataToSave.imageID = art.imageID;
      }

      await addDoc(collection(db, "chatHistory"), dataToSave);
    } catch (error) {
      console.error("Error saving chat history:", error);
    }
  };

  const handleStartAI = async () => {
    setIsAIStarted(true);
    const initialQuestion = `작가: ${art.artist}, 작품: ${art.title}에 대한 작품 해설을 부탁드립니다.`;
    setChatHistory([{ question: initialQuestion, answer: '생각중...', loading: true }]);

    const { answer, questionExamples } = await fetchChatGPTResponse(initialQuestion, art.artist, art.title);

    setChatHistory([{ question: initialQuestion, answer, loading: false }]);
    setQuestionExamples(questionExamples);

    saveChatHistory(initialQuestion, answer, questionExamples);
  };

  const handleExampleClick = async (example) => {
    const userQuestion = `작가: ${art.artist}, 작품: ${art.title}과 관련된 질문입니다. 다음에 나올 질문에 대한 답변만 해주세요.: ${example}`;
    setChatHistory([...chatHistory, { question: example, answer: '생각중...', loading: true }]);

    const { answer, questionExamples } = await fetchChatGPTResponse(userQuestion, art.artist, art.title);

    setChatHistory((prevHistory) =>
      prevHistory.map((chat, index) =>
        index === prevHistory.length - 1 ? { ...chat, answer, loading: false } : chat
      )
    );
    setQuestionExamples(questionExamples);

    saveChatHistory(example, answer, questionExamples);
  };

  const handleSendQuestion = async () => {
    if (!chatInput.trim()) return;

    const userQuestion = chatInput.trim();
    const fullUserQuestion = `작가: ${art.artist}, 작품: ${art.title}과 관련된 질문입니다. 다음에 나올 질문에 대한 답변만 해주세요.: ${userQuestion}`;
    setChatHistory([...chatHistory, { question: userQuestion, answer: '생각중...', loading: true }]);
    setChatInput('');

    const { answer, questionExamples } = await fetchChatGPTResponse(fullUserQuestion, art.artist, art.title);

    setChatHistory((prevHistory) =>
      prevHistory.map((chat, index) =>
        index === prevHistory.length - 1 ? { ...chat, answer, loading: false } : chat
      )
    );
    setQuestionExamples(questionExamples);

    saveChatHistory(userQuestion, answer, questionExamples);
  };

  const scrollToBottom = () => {
    const modalContent = document.getElementById("modalContent");
    modalContent.scrollTop = modalContent.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
  }, [isAIStarted, chatHistory]);

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalBackground} onClick={handleBackgroundClick}>
      <div className={styles.modalContentContainer}>
        <button onClick={onClose} className={styles.closeButton}>✖</button>
        <div id="modalContent" className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <img src={art.imageUrl} alt={art.title} className={styles.image} />
          <h2 className={styles.title}>{art.title}</h2>
          <p className={styles.artist}>{art.artist}</p>

          {isAIStarted ? (
            <div className={styles.chatContainer}>
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
              {questionExamples.length > 0 && (
                <>
                  <div className={styles.exampleButtons}>
                    {questionExamples.slice(0, 3).map((example, idx) => (
                      <button key={idx} className="btn btn-outline-secondary" onClick={() => handleExampleClick(example)}>
                        {example}
                      </button>
                    ))}
                  </div>
                  <div className={styles.inputContainer}>
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
