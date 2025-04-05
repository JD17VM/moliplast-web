import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Contraseña hardcodeada (SOLO PARA DESARROLLO)
    const adminPassword = 'admin123';
    
    if (password === adminPassword) {
      // Guardar en localStorage que el admin está logueado
      localStorage.setItem('adminAuth', 'true');
      navigate('/admin/dashboard'); // Redirigir al panel de administración
    } else {
      setError('Contraseña incorrecta');
    }
  };

  return (
    <div className="admin-login-container">
      <h2>Acceso de Administrador</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
};

export default AdminLogin;

/*
import React from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Eliminar la autenticación del localStorage
    localStorage.removeItem('adminAuth');
    // Redirigir al usuario a la página de inicio de sesión (o donde desees)
    navigate('/');
  };

  return (
    <button onClick={handleLogout}>Cerrar Sesión</button>
  );
};

export default LogoutButton;

import React from 'react';
import LogoutButton from './LogoutButton'; // Asegúrate de la ruta correcta

const AdminDashboard = () => {
  return (
    <div>
      <h2>Panel de Administración</h2>

      <LogoutButton />
    </div>
  );
};

export default AdminDashboard;

*/