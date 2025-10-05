import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import Header from './components/Header';
import Home from './routes/Home';
import Admin from './routes/Admin';
import GameDetail from './routes/GameDetail';
import Login from './routes/Login';
import Register from './routes/Register';
import './App.css';

function App() {
  const [games, setGames] = useState([
    { id: 1, name: 'Sea of Thieves', links: ['https://www.seaofthieves.com'], image: '/assets/sea-of-thieves.jpg' },
    { id: 2, name: 'Pirates of the Caribbean', links: ['https://pirates.disney.com'], image: '/assets/pirates-of-the-caribbean.jpg' },
    { id: 3, name: 'Assassin\'s Creed IV: Black Flag', links: ['https://www.ubisoft.com'], image: '/assets/black-flag.jpg' },
  ]);

  return (
    <Router>
      <AuthProvider>
        <div className="app pirate-theme">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home games={games} />} />
              <Route path="/admin" element={<AdminRoute><Admin games={games} setGames={setGames} /></AdminRoute>} />
              <Route path="/game/:id" element={<GameDetail games={games} />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </main>
          <footer>
            <p>© 2025 Pirate Games Finder. All rights reserved.</p>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

function AdminRoute({ children }) {
  const { user, isAdmin } = useAuth();

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default App;