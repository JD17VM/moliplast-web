import styles from './assets/styles/estilos_productos.module.scss';
import imageHelper from './utils/imageHelper';
import CartaProducto from './widgets/CartaProducto';
import { IoFilter } from "react-icons/io5";
import { IoIosCloseCircle } from "react-icons/io";
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import dataProductos from './data/data_productos.js';

const data = dataProductos.data;

const CheckBox = ({ id, marcado = false, children, onClick }) => {
    return (
        <div className={styles.container_checkbox} onClick={() => onClick(id)}>
            <button className={marcado ? styles.marcado : ''}></button>
            <p>{children}</p>
        </div>
    );
};

const Productos = () => {
    const [categoriaData, setCategoriaData] = useState(null);
    const [checkedElement, setCheckedElement] = useState(null);
    const [mostrarElemento, setMostrarElemento] = useState(false);
    const { categoria, subcategoria, subsubcategoria } = useParams();

    // Obtener datos de la API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/subcategorias-por-categoria/${categoria}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setCategoriaData(data);
                console.log(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        if (categoria) {
            fetchData();
        }
    }, [categoria]);

    // Marcar el CheckBox según la subcategoria o subsubcategoria en la URL
    useEffect(() => {
        if (categoriaData) {
            // Buscar la subcategoria en los datos
            const subcategoriaEncontrada = categoriaData.subcategorias.find(
                (sub) => sub.nombre === subcategoria
            );

            if (subcategoriaEncontrada) {
                // Si hay una subcategoria en la URL, marcar su CheckBox
                setCheckedElement(subcategoriaEncontrada.id);

                // Si también hay una subsubcategoria en la URL, buscar y marcar su CheckBox
                if (subsubcategoria) {
                    const subsubcategoriaEncontrada = subcategoriaEncontrada.subsubcategorias.find(
                        (subsub) => subsub.nombre === subsubcategoria
                    );

                    if (subsubcategoriaEncontrada) {
                        setCheckedElement(subsubcategoriaEncontrada.id);
                    }
                }
            }
        }
    }, [categoriaData, subcategoria, subsubcategoria]);

    const handleClick = (id) => {
        setCheckedElement(id);
    };

    const handleClickPanel = () => {
        setMostrarElemento(!mostrarElemento);
        console.log(mostrarElemento);
    };

    if (!categoriaData) {
        return <div>Cargando...</div>;
    }

    return (
        <div className={styles.seccion_productos}>
            <div className={`${styles.cont_panel_filtros_busqueda} ${mostrarElemento ? styles.mostrar : styles.ocultar}`}>
                <div className={styles.panel_filtros}>
                    <h2>Panel de Filtros</h2>
                    <ul>
                        {categoriaData.subcategorias.map(subcategoriaItem => (
                            <li key={subcategoriaItem.id}>
                                <Link to={`/productos/${categoria}/${subcategoriaItem.nombre}`}>
                                    <CheckBox
                                        id={subcategoriaItem.id}
                                        onClick={() => handleClick(subcategoriaItem.id)}
                                        marcado={checkedElement === subcategoriaItem.id}
                                    >
                                        {subcategoriaItem.nombre}
                                    </CheckBox>
                                </Link>
                                {subcategoriaItem.subsubcategorias.length > 0 && (
                                    <ul>
                                        {subcategoriaItem.subsubcategorias.map(subsubcategoriaItem => (
                                            <li key={subsubcategoriaItem.id}>
                                                <Link to={`/productos/${categoria}/${subcategoriaItem.nombre}/${subsubcategoriaItem.nombre}`}>
                                                    <CheckBox
                                                        id={subsubcategoriaItem.id}
                                                        onClick={() => handleClick(subsubcategoriaItem.id)}
                                                        marcado={checkedElement === subsubcategoriaItem.id}
                                                    >
                                                        {subsubcategoriaItem.nombre}
                                                    </CheckBox>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                    <button onClick={handleClickPanel}><IoIosCloseCircle /></button>
                </div>
            </div>
            <div className={styles.titulo_boton_menu}>
                <h1>{categoria ? categoria : 'Elementos'}</h1>
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
    );
};

export default Productos;