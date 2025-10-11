import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import Header from './components/Header';
import Home from './routes/Home';
import Admin from './routes/Admin';
import GameDetail from './routes/GameDetail';
import Login from './routes/Login';
import Register from './routes/Register';
import { AdminRoute, UserRoute } from './routes/ProtectedRoutes';
import './App.css';
import { supabase } from './supabaseClient';

function App() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    const fetchGames = async () => {
      const { data, error } = await supabase.from('games').select('*').order('id');
      if (!error) {
        setGames(data || []);
      }
    };
    fetchGames();
  }, []);

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

export default App;