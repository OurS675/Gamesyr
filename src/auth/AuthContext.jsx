import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const login = (username, password) => {
    if (username === 'admin' && password === 'password') {
      setUser({ username, role: 'admin' });
      navigate('/admin');
    } else {
      alert('Credenciales inválidas');
    }
  };

  const logout = () => {
    setUser(null);
    navigate('/');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}