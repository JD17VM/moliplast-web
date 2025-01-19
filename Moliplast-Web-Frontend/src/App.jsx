import { BrowserRouter, Route, Routes } from 'react-router-dom';
import React, { useEffect } from 'react';

import AOS from "aos";
import "aos/dist/aos.css";

import Navegador from './widgets/Navegador'
import Footer from './widgets/Footer'

import Inicio from './Inicio'
import Nosotros from './Nosotros'
import Servicios from './Servicios'
import Contacto from './Contacto'

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
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/servicios" element={<Servicios />} />
      </Routes>

      <Footer data={data}/>
    </BrowserRouter>
  )
}

export default App
