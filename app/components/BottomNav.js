// app/components/BottomNav.js
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AiOutlineHome, AiOutlineSearch, AiOutlineHistory } from 'react-icons/ai';

export default function BottomNav() {
  const currentPath = usePathname();

  return (
    <div style={styles.navContainer}>
      <nav style={styles.nav}>
        <NavLink href="/" icon={<AiOutlineHome />} label="Home" isActive={currentPath === '/'} />
        <NavLink href="/search" icon={<AiOutlineSearch />} label="Search" isActive={currentPath === '/search'} />
        <NavLink href="/history" icon={<AiOutlineHistory />} label="History" isActive={currentPath === '/history'} />
      </nav>
    </div>
  );
}

function NavLink({ href, icon, label, isActive }) {
  return (
    <Link href={href} style={{ ...styles.link, ...(isActive ? styles.activeLink : {}) }}>
      <div style={styles.icon}>{icon}</div>
      <span style={styles.label}>{label}</span>
    </Link>
  );
}

const styles = {
  navContainer: {
    position: 'fixed',
    bottom: 0,
    width: '100%',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #ccc',
    boxShadow: '0 -1px 5px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    justifyContent: 'center',
  },
  nav: {
    maxWidth: '900px', // layout.js의 container와 동일한 너비 설정
    width: '100%',
    display: 'flex',
    justifyContent: 'space-around',
  },
  link: {
    textAlign: 'center',
    color: '#555',
    textDecoration: 'none',
    flex: 1,
    padding: '5px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transition: 'background-color 0.3s',
  },
  activeLink: {
    backgroundColor: '#f0f0f0',
    color: '#ee7975',
  },
  icon: {
    fontSize: '24px',
    marginBottom: '4px',
  },
  label: {
    fontSize: '12px',
  },
};
