import React from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutButton = ({ setIsAdmin }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Eliminar la autenticación del localStorage
    localStorage.removeItem('adminAuth');
    setIsAdmin(false);
    navigate('/');
  };

  return (
    <button onClick={handleLogout}>Cerrar Sesión</button>
  );
};

export default LogoutButton;