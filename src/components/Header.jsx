import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './Header.css';

function Header() {
  const { user, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="app-header">
      <div className="header-inner container">
        <div className="brand">
          <h1>⚓ Pirate Games Finder 🏴‍☠️</h1>
          <p className="tagline">Embark on a journey to discover your favorite games!</p>
        </div>
        <nav>
          <Link to="/">⚓ Home</Link>
          {isLoading ? (
            <div className="user-info">Cargando...</div>
          ) : user ? (
            <div className="user-info">
              <span>👤 {user.username}</span>
              {user.role === 'admin' && (
                <Link to="/admin" className="admin-btn">Admin Panel</Link>
              )}
              <button onClick={handleLogout} className="logout-btn">Cerrar sesión</button>
            </div>
          ) : (
            <Link to="/login">Login ⚓</Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;