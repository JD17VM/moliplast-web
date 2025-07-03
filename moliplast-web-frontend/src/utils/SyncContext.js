// src/context/SyncContext.js
import React, { createContext, useContext } from 'react';

// Creamos el contexto con un valor inicial.
// El valor será un objeto que contiene el estado de la sincronización.
const SyncContext = createContext({
  isSynced: false,
  isSyncing: true, // Empezamos asumiendo que está sincronizando
});

// Hook personalizado para usar el contexto fácilmente en otros componentes
export const useSync = () => useContext(SyncContext);

// Exportamos el proveedor para usarlo en App.jsx
export const SyncProvider = SyncContext.Provider;