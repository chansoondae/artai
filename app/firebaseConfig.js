// firebaseConfig.js

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
    apiKey: "AIzaSyBHOX2AcUYNlLka7nMQBMjvdq4LbgDH8ZQ",
    authDomain: "artai-c1229.firebaseapp.com",
    projectId: "artai-c1229",
    storageBucket: "artai-c1229.firebasestorage.app",
    messagingSenderId: "476230734880",
    appId: "1:476230734880:web:023887790af90543bd1845",
    measurementId: "G-F2V1P57Z4R"
  };
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics =
  app.name && typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
