import styles from './assets/styles/estilos_productos.module.scss'
import imageHelper from './utils/imageHelper';
import CartaProducto from './widgets/CartaProducto';
import { IoFilter } from "react-icons/io5";
import { IoIosCloseCircle } from "react-icons/io";

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const CheckBox = ({id, marcado = false, children, onClick}) => {

    return (
        <div className={styles.container_checkbox} onClick={() => onClick(id)}>
            <button className={marcado ? styles.marcado : ''}></button>
            <p>{children}</p>
        </div>
    )
}


import dataProductos from './data/data_productos.js'

const data = dataProductos.data

const Productos = () => {

    const [checkedElement, setCheckedElement] = useState(null);

    const { subproductos, subsubproductos } = useParams();
    
    const handleClick = (id) => { // Recibe el id del CheckBox clicado
        setCheckedElement(id);
    };

    const [mostrarElemento, setMostrarElemento] = useState(false);

    const handleClickPanel = () => {
        setMostrarElemento(!mostrarElemento);
        console.log(mostrarElemento)
    };

    return (
        <div className={styles.seccion_productos}>
            <div className={`${styles.cont_panel_filtros_busqueda} ${mostrarElemento ? styles.mostrar : styles.ocultar}`}>
                <div className={styles.panel_filtros}>
                    <h2>Catálogos</h2>
                    <ul>
                        {data.map(producto => (
                             <li key={producto.id}><CheckBox id={producto.id} onClick={() => handleClick(producto.id)} marcado={checkedElement === producto.id}>{producto.nombre}</CheckBox>
                                {producto.subelementos && (
                                    <ul>
                                        {producto.subelementos.map(sub => (
                                            <li key={sub.id}><CheckBox id={sub.id} onClick={() => handleClick(sub.id)} marcado={checkedElement === sub.id}>{sub.nombre}</CheckBox></li>
                                        ))}
                                    </ul>
                                )}
                             </li>
                        ))}
                    </ul>
                    <button onClick={handleClickPanel}><IoIosCloseCircle/></button>
                </div>
            </div>
            <div className={styles.titulo_boton_menu}>
                <h1>{subproductos ? subproductos : 'Elementos'}</h1>
                <button onClick={handleClickPanel}>
                    <IoFilter />
                </button>
            </div>
            <div className={styles.contenedor_productos}>
                
                <CartaProducto enlace_imagen={imageHelper.ImagenDemoProducto1} texto="ELECTROVANNE NAANDAN 2" />
                <CartaProducto enlace_imagen={imageHelper.ImagenDemoProducto1} texto="ELECTROVANNE NAANDAN 2" />
                <CartaProducto enlace_imagen={imageHelper.ImagenDemoProducto1} texto="ELECTROVANNE NAANDAN 2" />
                <CartaProducto enlace_imagen={imageHelper.ImagenDemoProducto1} texto="ELECTROVANNE NAANDAN 2" />
                <CartaProducto enlace_imagen={imageHelper.ImagenDemoProducto1} texto="ELECTROVANNE NAANDAN 2" />
                <CartaProducto enlace_imagen={imageHelper.ImagenDemoProducto1} texto="GREENRAIN SYSTEM | VALVULA ELECTRICA SERIE DVF LINEAL 1” RH" />
                <CartaProducto enlace_imagen={imageHelper.ImagenDemoProducto1} texto="ELECTROVANNE NAANDAN 2" />
                <CartaProducto enlace_imagen={imageHelper.ImagenDemoProducto1} texto="ELECTROVANNE NAANDAN 2" />
                <CartaProducto enlace_imagen={imageHelper.ImagenDemoProducto1} texto="ELECTROVANNE NAANDAN 2" />
                <CartaProducto enlace_imagen={imageHelper.ImagenDemoProducto1} texto="GREENRAIN SYSTEM | VALVULA ELECTRICA SERIE DVF LINEAL 1” RH" />
                <CartaProducto enlace_imagen={imageHelper.ImagenDemoProducto1} texto="ELECTROVANNE NAANDAN 2" />
                <CartaProducto enlace_imagen={imageHelper.ImagenDemoProducto1} texto="ELECTROVANNE NAANDAN 2" />
                <CartaProducto enlace_imagen={imageHelper.ImagenDemoProducto1} texto="ELECTROVANNE NAANDAN 2" />
                <CartaProducto enlace_imagen={imageHelper.ImagenDemoProducto1} texto="ELECTROVANNE NAANDAN 2" />
                <CartaProducto enlace_imagen={imageHelper.ImagenDemoProducto1} texto="GREENRAIN SYSTEM | VALVULA ELECTRICA SERIE DVF LINEAL 1” RH" />
                <CartaProducto enlace_imagen={imageHelper.ImagenDemoProducto1} texto="ELECTROVANNE NAANDAN 2" />
                <CartaProducto enlace_imagen={imageHelper.ImagenDemoProducto1} texto="ELECTROVANNE NAANDAN 2" />
                <CartaProducto enlace_imagen={imageHelper.ImagenDemoProducto1} texto="ELECTROVANNE NAANDAN 2" />
                <CartaProducto enlace_imagen={imageHelper.ImagenDemoProducto1} texto="ELECTROVANNE NAANDAN 2" />
                <CartaProducto enlace_imagen={imageHelper.ImagenDemoProducto1} texto="ELECTROVANNE NAANDAN 2" />
                <CartaProducto enlace_imagen={imageHelper.ImagenDemoProducto1} texto="ELECTROVANNE NAANDAN 2" />
            </div>
        </div>
    )
}

export default Productos;