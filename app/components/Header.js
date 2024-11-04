// app/components/Header.js
import React from 'react';
import Link from 'next/link'; // Link 컴포넌트 추가
// import { signInWithGoogle, logout } from '../firebaseConfig'; // 로그인 관련 코드 비활성화
// import { AiOutlineLogin } from 'react-icons/ai'; // 로그인 아이콘 비활성화

export default function Header() {
  // 로그인 상태 관리 관련 코드 비활성화
  // const [user, setUser] = useState(null);
  // const [showDropdown, setShowDropdown] = useState(false);

  // const handleGoogleLogin = async () => {
  //   const loggedInUser = await signInWithGoogle();
  //   setUser(loggedInUser);
  // };

  // const handleLogout = async () => {
  //   await logout();
  //   setUser(null);
  //   setShowDropdown(false);
  // };

  return (
    <header style={styles.header}>
      <div style={styles.headerContent}>
        <div style={styles.titleContainer}>
          <Link href="/" passHref style={styles.title}>
            Art Friends
          </Link>
        </div>
        {/* 로그인 버튼 및 프로필 사진 UI 비활성화 */}
        {/* <div style={styles.userContainer}>
          {!user ? (
            <AiOutlineLogin onClick={handleGoogleLogin} style={styles.loginIcon} title="Sign in" />
          ) : (
            <div style={styles.profileContainer} onClick={() => setShowDropdown(!showDropdown)}>
              <img src={user.photoURL} alt="User Profile" style={styles.profileImage} />
              {showDropdown && (
                <div style={styles.dropdownMenu}>
                  <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
                </div>
              )}
            </div>
          )}
        </div> */}
      </div>
    </header>
  );
}

const styles = {
  header: {
    position: 'fixed', // 헤더를 고정시킵니다.
    top: 0, // 화면 상단에 고정
    left: 0,
    right: 0,
    height: '70px', // 고정된 헤더의 높이를 설정합니다.
    padding: '10px 20px',
    borderBottom: '1px solid #ccc',
    backgroundColor: '#fff', // 배경색을 추가해 가독성을 높입니다.
    zIndex: 1000, // 다른 콘텐츠보다 위에 보이도록 설정
  },
  headerContent: {
    maxWidth: '900px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center', // 타이틀을 가운데 정렬
  },
  titleContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Sacramento, cursive',
    fontSize: '2.5rem',
    color: '#333',
    margin: 0,
    cursor: 'pointer',
    textDecoration: 'none',
  },
  // 로그인 관련 스타일 비활성화
  // userContainer: {
  //   display: 'flex',
  //   alignItems: 'center',
  //   position: 'relative',
  // },
  // loginIcon: {
  //   fontSize: '1.8rem',
  //   color: '#333',
  //   cursor: 'pointer',
  // },
  // profileContainer: {
  //   position: 'relative',
  //   cursor: 'pointer',
  // },
  // profileImage: {
  //   width: '40px',
  //   height: '40px',
  //   borderRadius: '50%',
  //   cursor: 'pointer',
  // },
  // dropdownMenu: {
  //   position: 'absolute',
  //   top: '50px',
  //   right: 0,
  //   backgroundColor: '#fff',
  //   boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  //   borderRadius: '4px',
  //   zIndex: 1,
  // },
  // logoutButton: {
  //   padding: '8px 16px',
  //   fontSize: '1rem',
  //   backgroundColor: 'transparent',
  //   border: 'none',
  //   cursor: 'pointer',
  //   textAlign: 'left',
  //   width: '100%',
  // },
};
