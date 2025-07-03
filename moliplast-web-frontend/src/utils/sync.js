import { db } from './db';

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;
// Sincronizar cada 24 horas
const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000; 

/**
 * Revisa si el índice maestro necesita ser sincronizado y lo descarga si es necesario.
 * Esta función debería llamarse al iniciar la aplicación.
 */
// utils/sync.js
export const syncMasterIndex = async () => {
  // ... código anterior ...
  try {
    // ... tu lógica de fetch ...
    const response = await fetch(`${BASE_URL_API}/api/id-productos-categorias`);
    if (!response.ok) throw new Error('No se pudo descargar el índice maestro.');
    
    const masterIndexData = await response.json();
    
    console.log('✅ Datos recibidos del índice maestro:', masterIndexData);
    if (!masterIndexData || masterIndexData.length === 0) {
      console.error('El índice maestro está vacío o es inválido.');
      return; 
    }

    await db.productIndex.bulkPut(masterIndexData);
    localStorage.setItem('masterIndexLastSync', Date.now().toString());
    console.log(`Índice maestro sincronizado con ${masterIndexData.length} productos.`);

  } catch (error) {
    console.error("Error al sincronizar el índice maestro:", error);
    // ¡Añade esta línea para notificar a App.jsx del fallo!
    throw error;
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