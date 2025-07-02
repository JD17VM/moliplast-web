import { db } from './db';

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;
// Sincronizar cada 24 horas
const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000; 

/**
 * Revisa si el índice maestro necesita ser sincronizado y lo descarga si es necesario.
 * Esta función debería llamarse al iniciar la aplicación.
 */
export const syncMasterIndex = async () => {
  const lastSync = localStorage.getItem('masterIndexLastSync');
  if (lastSync && (Date.now() - parseInt(lastSync, 10)) < SYNC_INTERVAL_MS) {
    console.log("El índice maestro ya está sincronizado.");
    return;
  }

  console.log("Sincronizando el índice maestro de productos...");
  try {
    // Este es el nuevo endpoint que debes crear en tu backend
    const response = await fetch(`${BASE_URL_API}/api/id-productos-categorias`);
    if (!response.ok) throw new Error('No se pudo descargar el índice maestro.');

    const masterIndexData = await response.json(); // Ej: [{id: 1, id_categoria: 2}, ...]

    // Usamos bulkPut para insertar/actualizar eficientemente todos los registros
    await db.productIndex.bulkPut(masterIndexData);

    // Actualizamos la fecha de la última sincronización
    localStorage.setItem('masterIndexLastSync', Date.now().toString());
    console.log(`Índice maestro sincronizado con ${masterIndexData.length} productos.`);

  } catch (error) {
    console.error("Error al sincronizar el índice maestro:", error);
  }
};

// Ejemplo de cómo usarlo en tu componente principal (ej. App.js)
/*
  import { useEffect } from 'react';
  import { syncMasterIndex } from './sync';

  function App() {
    useEffect(() => {
      syncMasterIndex();
    }, []); // El array vacío asegura que se ejecute solo una vez al montar el componente

    // ... resto de tu app
  }
*/