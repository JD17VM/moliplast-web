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
    const [productos, setProductos] = useState([]); // Estado para almacenar los productos
    const [checkedElement, setCheckedElement] = useState({ subcategoria: null, subsubcategoria: null });
    const [mostrarElemento, setMostrarElemento] = useState(false);
    const { categoria, subcategoria, subsubcategoria } = useParams();

    // Obtener datos de la API (categorías, subcategorías, etc.)
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

    // Obtener productos según los parámetros de la URL
    useEffect(() => {
        const fetchProductos = async () => {
            try {
                let url = `http://127.0.0.1:8000/api/productos/carta/${categoria}`;

                if (subcategoria) {
                    url += `/${subcategoria}`;
                }
                if (subsubcategoria) {
                    url += `/${subsubcategoria}`;
                }

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setProductos(data); // Almacenar los productos en el estado
            } catch (error) {
                console.error('Error fetching productos:', error);
            }
        };

        if (categoria) {
            fetchProductos();
        }
    }, [categoria, subcategoria, subsubcategoria]);

    // Marcar el CheckBox según la subcategoria o subsubcategoria en la URL
    useEffect(() => {
        if (categoriaData) {
            // Si no hay subcategoria ni subsubcategoria, marcar el checkbox "Todos"
            if (!subcategoria && !subsubcategoria) {
                setCheckedElement({ subcategoria: 'todos', subsubcategoria: null });
            } else {
                // Buscar la subcategoria en los datos
                const subcategoriaEncontrada = categoriaData.subcategorias.find(
                    (sub) => sub.nombre === subcategoria
                );

                if (subcategoriaEncontrada) {
                    // Si hay una subcategoria en la URL, marcar su CheckBox
                    setCheckedElement({ subcategoria: subcategoriaEncontrada.id, subsubcategoria: null });

                    // Si también hay una subsubcategoria en la URL, buscar y marcar su CheckBox
                    if (subsubcategoria) {
                        const subsubcategoriaEncontrada = subcategoriaEncontrada.subsubcategorias.find(
                            (subsub) => subsub.nombre === subsubcategoria
                        );

                        if (subsubcategoriaEncontrada) {
                            setCheckedElement({ subcategoria: subcategoriaEncontrada.id, subsubcategoria: subsubcategoriaEncontrada.id });
                        }
                    }
                }
            }
        }
    }, [categoriaData, subcategoria, subsubcategoria]);

    const handleClick = (id, type) => {
        if (type === 'subcategoria') {
            setCheckedElement({ subcategoria: id, subsubcategoria: null });
        } else if (type === 'subsubcategoria') {
            setCheckedElement(prevState => ({ ...prevState, subsubcategoria: id }));
        }
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
                        {/* Checkbox "Todos" */}
                        <li>
                            <Link to={`/productos/${categoria}`}>
                                <CheckBox
                                    id="todos"
                                    onClick={() => handleClick('todos', 'subcategoria')}
                                    marcado={checkedElement.subcategoria === 'todos'}
                                >
                                    Todos
                                </CheckBox>
                            </Link>
                        </li>

                        {/* Lista de subcategorías */}
                        {categoriaData.subcategorias.map(subcategoriaItem => (
                            <li key={subcategoriaItem.id}>
                                <Link to={`/productos/${categoria}/${subcategoriaItem.nombre}`}>
                                    <CheckBox
                                        id={subcategoriaItem.id}
                                        onClick={() => handleClick(subcategoriaItem.id, 'subcategoria')}
                                        marcado={checkedElement.subcategoria === subcategoriaItem.id}
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
                                                        onClick={() => handleClick(subsubcategoriaItem.id, 'subsubcategoria')}
                                                        marcado={checkedElement.subsubcategoria === subsubcategoriaItem.id}
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
                {/* Mapear los productos y generar las CartaProducto */}
                {productos.map((producto) => (
                    <CartaProducto
                        key={producto.id}
                        enlace_imagen={producto.enlace_imagen}
                        texto={producto.nombre}
                    />
                ))}
            </div>
        </div>
    );
};

export default Productos;