import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useBarcodeScanner } from './hooks/useBarcodeScanner';

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

import ProductosSearch from './ProductosSearch'

import AdminCatalogos from './Administrador/AdminCatalogos'
import AdminServicios from './Administrador/AdminServicios'
import AdminCategorias from './Administrador/AdminCategorias'
import AdminSubcategorias from './Administrador/AdminSubcategorias'
import AdminSubsubcategorias from './Administrador/AdminSubsubcategorias'
import AdminProductos from './Administrador/AdminProductos'
import AdminGeneradorQRs from './Administrador/AdminGeneradorQRs'
import dataPaginas from './data/data_paginas.js'

import AdminLogin from './AdminLogin';
import AdminRoute from './AdminRoute';

import ScrollToTop from './utils/ScrollToTop'; // Importa el componente ScrollToTop

const data = dataPaginas.data

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

function App() {

  useEffect(() => {
    AOS.init();
    AOS.refresh();
  }, []);

  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('adminAuth') === 'true');

  const handleAdminLogin = () => {
    localStorage.setItem('adminAuth', 'true');
    setIsAdmin(true);
  };

  // El hook useNavigate solo puede ser llamado dentro de un componente que está
    // dentro de BrowserRouter. Por eso creamos este pequeño componente intermedio.
    const BarcodeHandler = () => {
      const navigate = useNavigate();

      const handleBarcodeScan = async (codigo) => {
          console.log('Código de barras global escaneado:', codigo);
          try {
              // Hacemos una llamada a la API para obtener el ID del producto a partir del código
              const response = await fetch(`${BASE_URL_API}/api/producto-por-codigo/${codigo}`);
              if (!response.ok) {
                  console.error("Producto no encontrado con el código:", codigo);
                  return; // No hacemos nada si el código no es válido
              }
              const data = await response.json();
              
              // Navegamos a la página del producto
              navigate(`/productos/producto/${data.id}?source=softlink`);

          } catch (error) {
              console.error("Error al buscar producto por código:", error);
          }
      };

      // Usamos nuestro hook personalizado y le pasamos la función que debe ejecutar
      useBarcodeScanner(handleBarcodeScan);

      return null; // Este componente no renderiza nada visualmente
  };

  return (
    <BrowserRouter>
      <Navegador isAdmin={isAdmin} setIsAdmin={setIsAdmin}/>
      <BarcodeHandler />

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

        <Route element={<AdminRoute />}>
          <Route path="/administrador/catalogos" element={<AdminCatalogos />} />
          <Route path="/administrador/servicios" element={<AdminServicios />} />
          <Route path="/administrador/categorias" element={<AdminCategorias />} />
          <Route path="/administrador/subcategorias" element={<AdminSubcategorias />} />
          <Route path="/administrador/subsubcategorias" element={<AdminSubsubcategorias />} />
          <Route path="/administrador/productos" element={<AdminProductos />} />
          <Route path="/administrador/generador-qrs" element={<AdminGeneradorQRs />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
      </Routes>
      </ScrollToTop>
      <Footer data={data} onAdminLogin={handleAdminLogin}/>
    </BrowserRouter>
  )
}

export default App