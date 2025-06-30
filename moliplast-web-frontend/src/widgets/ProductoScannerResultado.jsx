import React from 'react'; // Solo necesitas React aquí por ahora

import styles from '../assets/styles/estilos_scannerqr.module.scss';

const ProductoScannerResultado = ({ route }) => {
  const expectedPrefix = "https://moliplast.com/api/api/producto/redirect/";
  
  let id = null;

  if (route && route.startsWith(expectedPrefix)) {
    const urlParts = route.split('/');
    id = urlParts[urlParts.length - 1];
  }

  if (!id) {
    return (
      <div className={styles.resultContainer}>
        <h3>Resultado del Escaneo:</h3>
        <p className={styles.errorText}>No se reconoce el QR</p>
      </div>
    );
  }

  return (
    <div className={styles.resultContainer}>
      <h3>Último Resultado Válido:</h3>
      {/* Aquí ya puedes usar la variable 'id' con total seguridad */}
      <h2>ID de Producto: {id}</h2>
      {/* Más adelante aquí irán las consultas a las bases de datos para precio, etc. */}
      {/* <h2>Precio: $XX.XX</h2>
          <h2>Código: XXX-123</h2> */}
    </div>
  );
}

export default ProductoScannerResultado;