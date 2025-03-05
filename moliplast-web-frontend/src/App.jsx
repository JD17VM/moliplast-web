import { BrowserRouter, Route, Routes } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

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

import AdminCatalogos from './Administrador/AdminCatalogos'
import AdminServicios from './Administrador/AdminServicios'
import AdminCategorias from './Administrador/AdminCategorias'
import AdminSubcategorias from './Administrador/AdminSubcategorias'
import AdminSubsubcategorias from './Administrador/AdminSubsubcategorias'
import AdminProductos from './Administrador/AdminProductos'
import dataPaginas from './data/data_paginas.js'

import AdminLogin from './AdminLogin';
import AdminRoute from './AdminRoute';

const data = dataPaginas.data

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

  return (
    <BrowserRouter>
      <Navegador isAdmin={isAdmin} setIsAdmin={setIsAdmin}/>

      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/catalogos" element={<Catalogos/>} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/productos/:categoria" element={<Productos />} />
        <Route path="/productos/:categoria/:subcategoria" element={<Productos />} />
        <Route path="/productos/:categoria/:subcategoria/:subsubcategoria" element={<Productos />} />
        <Route path="/productos/producto/:id" element={<Producto />} />

        <Route path="/servicios" element={<Servicios />}/>

        <Route element={<AdminRoute />}>
          <Route path="/administrador/catalogos" element={<AdminCatalogos />} />
          <Route path="/administrador/servicios" element={<AdminServicios />} />
          <Route path="/administrador/categorias" element={<AdminCategorias />} />
          <Route path="/administrador/subcategorias" element={<AdminSubcategorias />} />
          <Route path="/administrador/subsubcategorias" element={<AdminSubsubcategorias />} />
          <Route path="/administrador/productos" element={<AdminProductos />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
      </Routes>

      <Footer data={data} onAdminLogin={handleAdminLogin}/>
    </BrowserRouter>
  )
}

export default App