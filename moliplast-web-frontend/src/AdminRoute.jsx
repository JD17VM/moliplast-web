// En un archivo como AdminRoute.jsx (para proteger rutas)
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  // Verificar si existe la autenticación en localStorage
  const isAuthenticated = localStorage.getItem('adminAuth') === 'true';
  
  // Si está autenticado, permite el acceso a la ruta, si no, redirige al login
  return isAuthenticated ? <Outlet /> : <Navigate to="/" />;
};

export default AdminRoute;