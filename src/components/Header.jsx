import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="app-header">
      <h1>⚓ Pirate Games Finder 🏴‍☠️</h1>
      <p>Embark on a journey to discover your favorite games!</p>
      <nav>
        <Link to="/">⚓ Home</Link> | <Link to="/admin">Admin Panel</Link> | <Link to="/login">Login ⚓</Link>
      
      </nav>
    </header>
  );
}

export default Header;