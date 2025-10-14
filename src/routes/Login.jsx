import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import logger from '../utils/logger';
import './Login.css';
import Swal from 'sweetalert2';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpiar errores anteriores
  logger.debug('Iniciando proceso de login...');
    try {
      await login(email, password);
  logger.debug('Login exitoso');
      Swal.fire({ icon: 'success', title: 'Sesión iniciada', timer: 1500, showConfirmButton: false });
    } catch (err) {
      logger.error('Error en login:', err);
      const msg = err?.message || 'Error al iniciar sesión';
      setError(msg);
      Swal.fire({ icon: 'error', title: 'Error', text: msg });
    }
  };

  return (
    <div className="login-container">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
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
        <div className="form-group">
          <button type="submit">Iniciar Sesión</button>
        </div>
        <div className="form-group">
          <button type="button" onClick={() => navigate('/register')}>Registrarse</button>
        </div>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
}

export default Login;