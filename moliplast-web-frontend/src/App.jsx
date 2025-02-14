import { BrowserRouter, Route, Routes } from 'react-router-dom';
import React, { useEffect } from 'react';

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
import AdminCategoria from './Administrador/AdminCategoria'

import dataPaginas from './data/data_paginas.js'

const data = dataPaginas.data

function App() {

  useEffect(() => {
    AOS.init();
    AOS.refresh();
  }, []);

  return (
    <BrowserRouter>
      <Navegador data={data}/>

      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/catalogos" element={<Catalogos/>} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/productos" element={<Productos />} />
          <Route path="/productos/:subproductos" element={<Productos />} />
          <Route path="/productos/:subproductos/:subsubproductos" element={<Productos />} />
        <Route path="/productos/producto" element={<Producto />} />
        <Route path="/servicios" element={<Servicios />} />

        <Route path="/administrador/catalogos" element={<AdminCatalogos />} />
        <Route path="/administrador/servicios" element={<AdminServicios />} />
        <Route path="/administrador/categoria" element={<AdminCategoria />} />
      </Routes>

      <Footer data={data}/>
    </BrowserRouter>
  )
}

export default App
