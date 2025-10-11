import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import Swal from 'sweetalert2';

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validaciones básicas para evitar 422
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Email inválido');
        Swal.fire({ icon: 'error', title: 'Email inválido' });
        return;
      }
      if ((password || '').length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        Swal.fire({ icon: 'error', title: 'Contraseña muy corta', text: 'Mínimo 6 caracteres' });
        return;
      }
      await register(username, password, email);
      Swal.fire({ icon: 'success', title: 'Registro iniciado', text: 'Revisa tu correo para verificar tu cuenta', timer: 2500 });
      navigate('/login');
    } catch (err) {
      // Superficie la respuesta de Supabase si existe
      const msg = err?.message || (typeof err === 'string' ? err : null);
      setError(msg || 'Error al registrarse');
      Swal.fire({ icon: 'error', title: 'Error', text: msg || 'Error al registrarse' });
    }
  };

  return (
    <div className="register-container">
      <h2>Registro</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Usuario:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Registrarse</button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
}

export default Register;