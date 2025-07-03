import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { SyncProvider } from './utils/SyncContext';
import { syncMasterIndex } from './utils/sync';
import { useScannerInput } from './hooks/useBarcodeScanner';

import AOS from "aos";
import "aos/dist/aos.css";

import Navegador from './widgets/Navegador'
import Footer from './widgets/Footer'

import Inicio from './Inicio'
import Nosotros from './Nosotros'
import Productos from './Productos'
import Producto from './Producto'
import Servicios from './Servicios'
import Catalogos from './Catalogos'
import Contacto from './Contacto'
import QrScanner from './QrScanner';

import ProductosSearch from './ProductosSearch'

import AdminCatalogos from './Administrador/AdminCatalogos'
import AdminServicios from './Administrador/AdminServicios'
import AdminCategorias from './Administrador/AdminCategorias'
import AdminSubcategorias from './Administrador/AdminSubcategorias'
import AdminSubsubcategorias from './Administrador/AdminSubsubcategorias'
import AdminProductos from './Administrador/AdminProductos'
import AdminGeneradorQRs from './Administrador/AdminGeneradorQRs'
import AdminBulkImageUpload from './Administrador/AdminBulkImageUpload'
import dataPaginas from './data/data_paginas.js'

import AdminLogin from './AdminLogin';
import AdminRoute from './AdminRoute';

import ScrollToTop from './utils/ScrollToTop'; // Importa el componente ScrollToTop

const data = dataPaginas.data

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

function App() {

  const [syncState, setSyncState] = useState({
    isSyncing: true,
    isSynced: false
  });

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Ahora si syncMasterIndex falla, el CATCH de aquí se activará
        await syncMasterIndex(); 
        console.log("Sincronización inicial completada.");
        setSyncState({ isSyncing: false, isSynced: true });
      } catch (error) {
        // Y el estado se establecerá correctamente para reflejar el fallo
        console.error("Falló la sincronización inicial:", error);
        setSyncState({ isSyncing: false, isSynced: false }); 
      }
    };
    
    initializeApp();
  }, []);

  useEffect(() => {
    AOS.init();
    AOS.refresh();
  }, []);

  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('adminAuth') === 'true');

  const handleAdminLogin = () => {
    localStorage.setItem('adminAuth', 'true');
    setIsAdmin(true);
  };

  // Renombramos el componente para reflejar su nueva funcionalidad
  const ScannerHandler = () => {
    const navigate = useNavigate();

    const isValidUrl = (string) => {
      const lowerCaseString = string.toLowerCase(); // Convertir a minúsculas para una verificación insensible a mayúsculas/minúsculas
      return lowerCaseString.startsWith('http://') || lowerCaseString.startsWith('https://');
  };

    const handleScannedContent = async (content) => {
        const cleanContent = content.trim(); 
        console.log('Contenido escaneado (limpio):', cleanContent);

        if (isValidUrl(cleanContent)) {
            console.log('Contenido es una URL QR, navegando directamente:', cleanContent);
            // ¡EL CAMBIO CRÍTICO ESTÁ AQUÍ!
            // Usamos window.location.href para forzar la navegación externa
            window.location.href = cleanContent; 
            return;
        }

        console.log('Contenido es un código de barras/ID, buscando en API:', cleanContent);
        try {
            const response = await fetch(`${BASE_URL_API}/api/producto-por-codigo/${cleanContent}`);
            if (!response.ok) {
                console.error("Producto no encontrado con el código:", cleanContent);
                return;
            }
            const data = await response.json();
            
            // Para rutas internas de la SPA, seguimos usando navigate de react-router-dom
            navigate(`/productos/producto/${data.id}?source=softlink`); 
        } catch (error) {
            console.error("Error al buscar producto por código:", error);
        }
    };

    useScannerInput(handleScannedContent);

    return null;
};


  return (
    <SyncProvider value={syncState}> 
    <BrowserRouter>
      <Navegador isAdmin={isAdmin} setIsAdmin={setIsAdmin}/>
      <ScannerHandler />

      <ScrollToTop>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/catalogos" element={<Catalogos/>} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/productos/:categoria" element={<Productos />} />
        <Route path="/productos/:categoria/:subcategoria" element={<Productos />} />
        <Route path="/productos/:categoria/:subcategoria/:subsubcategoria" element={<Productos />} />
        <Route path="/productos/producto/:id" element={<Producto />} />
        <Route path="/productos/search/:texto" element={<ProductosSearch />} />

        <Route path="/servicios" element={<Servicios />}/>
        <Route path="/qr-scanner" element={<QrScanner />}/>

        <Route element={<AdminRoute />}>
          <Route path="/administrador/catalogos" element={<AdminCatalogos />} />
          <Route path="/administrador/servicios" element={<AdminServicios />} />
          <Route path="/administrador/categorias" element={<AdminCategorias />} />
          <Route path="/administrador/subcategorias" element={<AdminSubcategorias />} />
          <Route path="/administrador/subsubcategorias" element={<AdminSubsubcategorias />} />
          <Route path="/administrador/productos" element={<AdminProductos />} />
          <Route path="/administrador/generador-qrs" element={<AdminGeneradorQRs />} />
          <Route path="/administrador/carga-masiva-imagenes" element={<AdminBulkImageUpload />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
      </Routes>
      </ScrollToTop>
      <Footer data={data} onAdminLogin={handleAdminLogin}/>
    </BrowserRouter>
    </SyncProvider>
  )
}

export default App