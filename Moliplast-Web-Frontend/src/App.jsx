import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Navegador from './widgets/Navegador'

import dataPaginas from './data/data_paginas.js'

const data = dataPaginas.data

function App() {

  return (
    <BrowserRouter>
      <Navegador data={data}/>

      <Routes>

      </Routes>
    </BrowserRouter>
  )
}

export default App
