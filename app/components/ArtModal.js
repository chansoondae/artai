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

  // messages 형식으로 변환하는 함수 추가
  const formatChatHistoryForMessages = (chatHistory) => {
    return chatHistory.map((chat) => ({
      role: chat.question ? "user" : "assistant",
      content: chat.question || chat.answer,
    }));
  };

  // AI를 시작하는 함수
  const handleStartAI = async () => {
    setIsAIStarted(true);
    const initialQuestion = `작가: ${art.artist}, 작품: ${art.title}에 대한 작품 해설을 부탁드립니다.`;

    // 초기 대화 추가
    setChatHistory([{ question: initialQuestion, answer: '생각중...', loading: true }]);

    // 메시지 형식으로 변환
    const formattedMessages = formatChatHistoryForMessages([{ question: initialQuestion }]);


    const { answer, questionExamples } = await fetchChatGPTResponse(initialQuestion, art.artist, art.title, formattedMessages);

    setChatHistory([{ question: initialQuestion, answer, loading: false }]);
    setQuestionExamples(questionExamples);

    saveChatHistory(initialQuestion, answer, questionExamples);
  };

  // 예시 클릭 시 호출되는 함수
  const handleExampleClick = async (example) => {
    const userQuestion = example;

    // 새로운 질문을 추가한 `chatHistory` 배열을 만들어서 최근 3개만 추출
    const updatedChatHistory = [...chatHistory, { question: example, answer: '생각중...', loading: true }];
    setChatHistory(updatedChatHistory);


    // 현재 chatHistory를 messages로 변환하여 전달
    const formattedMessages = formatChatHistoryForMessages(updatedChatHistory).slice(-3);
    const { answer, questionExamples } = await fetchChatGPTResponse(userQuestion, art.artist, art.title, formattedMessages);

    setChatHistory((prevHistory) =>
      prevHistory.map((chat, index) =>
        index === prevHistory.length - 1 ? { ...chat, answer, loading: false } : chat
      )
    );
    setQuestionExamples(questionExamples);

    saveChatHistory(example, answer, questionExamples);
  };

  // 질문 전송 시 호출되는 함수
  const handleSendQuestion = async () => {
    if (!chatInput.trim()) return;

    const userQuestion = chatInput.trim();
    console.log(userQuestion);
    setChatInput('');

    // 새로운 질문을 추가한 `chatHistory` 배열을 만들어서 최근 3개만 추출
    const updatedChatHistory = [...chatHistory, { question: userQuestion, answer: '생각중...', loading: true }];
    setChatHistory(updatedChatHistory);

    // 최근 3개 메시지로 제한하여 서버로 전송
    const formattedMessages = formatChatHistoryForMessages(updatedChatHistory).slice(-3);
  

    const { answer, questionExamples } = await fetchChatGPTResponse(userQuestion, art.artist, art.title, formattedMessages);

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
