//app/admin/page.js

"use client";

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import app from "./../firebaseConfig";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const auth = getAuth(app);

  useEffect(() => {
    // 로그인 상태 확인
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // 로그인 되어 있다면 대시보드로 이동
        router.push("/admin/dashboard");
      } else {
        // 로그인이 되어 있지 않다면 로그인 페이지 표시
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // 로그인 성공 후 대시보드로 리디렉션
      router.push("/admin/dashboard");
    } catch (error) {
      console.error("Error during login:", error);
      alert("Failed to log in. Please try again.");
    }
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

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <h2 className="text-center">Admin Login</h2>
      <div className="text-center mt-4">
        <button onClick={handleGoogleLogin} className="btn btn-primary">
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
