import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop({ children }) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return <>{children}</>;
}

export default ScrollToTop;

{/*
Al envolver el componente Routes con ScrollToTop, cualquier cambio de ruta dentro de tu aplicación provocará una actualización del location. Esto activará el useEffect dentro de ScrollToTop, que a su vez ejecutará window.scrollTo(0, 0), llevando la página de nuevo a la parte superior.
*/}

{/*
No se como tiene agregada una animacionde transicion suave que scrollea hacia arriba
*/}