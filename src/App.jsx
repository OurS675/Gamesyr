import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { LoadingProvider } from './context/LoadingContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import Header from './components/Header';
import GlobalLoader from './components/GlobalLoader';
import Home from './routes/Home';
import Admin from './routes/Admin';
import GameDetail from './routes/GameDetail';
import Login from './routes/Login';
import Register from './routes/Register';
import Tutorials from './routes/Tutorials';
import { AdminRoute, UserRoute } from './routes/ProtectedRoutes';
import './App.css';
import './styles/theme.css';
import { supabase } from './supabaseClient';

function App() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('games').select('*').order('id');
      if (!error) {
        setGames(data || []);
      }
      setLoading(false);
    };
    fetchGames();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <LoadingProvider initialLoading={loading}>
              <InnerApp games={games} setGames={setGames} loading={loading} />
            </LoadingProvider>
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

function InnerApp({ games, setGames }) {
  const { isLoading: authLoading } = useAuth();
  
  return (
    <div className="app pirate-theme">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home games={games} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/game/:id" element={<GameDetail games={games} />} />
          <Route path="/tutorials" element={<Tutorials />} />
          <Route path="/admin" element={<AdminRoute><Admin games={games} setGames={setGames} /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <div className="container">
          <p>© 2025 Pirate Games Finder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;