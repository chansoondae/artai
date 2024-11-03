// firebaseConfig.js

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { signOut } from "firebase/auth";


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

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    console.log("User logged in:", user);
    return user;
  } catch (error) {
    console.error("Error during Google login:", error);
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    console.log("User logged out");
  } catch (error) {
    console.error("Error during logout:", error);
  }
};