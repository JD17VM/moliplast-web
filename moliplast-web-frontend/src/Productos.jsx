import styles from './assets/styles/estilos_productos.module.scss';
import imageHelper from './utils/imageHelper';
import CartaProducto from './widgets/CartaProducto';
import { IoFilter } from "react-icons/io5";
import { IoIosCloseCircle } from "react-icons/io";
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const BASE_URL_API = "http://127.0.0.1:8000";

const CheckBox = ({ id, marcado = false, children, onClick }) => {
    return (
        <div className={styles.container_checkbox} onClick={() => onClick(id)}>
            <button className={marcado ? styles.marcado : ''}></button>
            <p>{children}</p>
        </div>
    );
};

const Productos = () => {
    const navigate = useNavigate();
    const [categoriaData, setCategoriaData] = useState(null);
    const [productos, setProductos] = useState([]);
    const [checkedElement, setCheckedElement] = useState({ subcategoria: 'todos', subsubcategoria: null });
    const [mostrarElemento, setMostrarElemento] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { categoria, subcategoria, subsubcategoria } = useParams();

    // Obtener datos de subcategorías
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/subcategorias-por-categoria/${categoria}`);
                if (!response.ok) {
                    throw new Error('Error al obtener las subcategorías');
                }
                const data = await response.json();
                setCategoriaData(data);
            } catch (error) {
                console.error('Error:', error);
                setError('No se pudieron cargar las subcategorías');
            }
        };

        if (categoria) {
            fetchData();
        }
    }, [categoria]);

    // Obtener productos
    useEffect(() => {
        const fetchProductos = async () => {
            setIsLoading(true);
            setError(null);
            try {
                let url = `http://127.0.0.1:8000/api/productos/carta/${categoria}`;

                if (subcategoria && subcategoria !== 'todos') {
                    url += `/${subcategoria}`;
                }
                if (subsubcategoria) {
                    url += `/${subsubcategoria}`;
                }

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Error al obtener los productos');
                }
                const data = await response.json();
                setProductos(data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error:', error);
                setError('No se pudieron cargar los productos');
                setIsLoading(false);
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
            if (!subcategoria || subcategoria === 'todos') {
                setCheckedElement({ subcategoria: 'todos', subsubcategoria: null });
            } else {
                // Buscar la subcategoria en los datos
                const subcategoriaEncontrada = categoriaData.subcategorias.find(
                    (sub) => sub.nombre === subcategoria
                );

                if (subcategoriaEncontrada) {
                    // Si hay una subcategoria en la URL, marcar su CheckBox
                    setCheckedElement({
                        subcategoria: subcategoriaEncontrada.id,
                        subsubcategoria: null
                    });

                    // Si también hay una subsubcategoria en la URL, buscar y marcar su CheckBox
                    if (subsubcategoria) {
                        const subsubcategoriaEncontrada = subcategoriaEncontrada.subsubcategorias.find(
                            (subsub) => subsub.nombre === subsubcategoria
                        );

                        if (subsubcategoriaEncontrada) {
                            setCheckedElement({
                                subcategoria: subcategoriaEncontrada.id,
                                subsubcategoria: subsubcategoriaEncontrada.id
                            });
                        }
                    }
                }
            }
        }
    }, [categoriaData, subcategoria, subsubcategoria]);

    const handleClick = (id, type) => {
        if (type === 'subcategoria') {
            if (id === 'todos') {
                // Navegar a la ruta base de la categoría
                navigate(`/productos/${categoria}`);
                setCheckedElement({ subcategoria: 'todos', subsubcategoria: null });
            } else {
                // Encontrar el nombre de la subcategoría
                const subcategoriaItem = categoriaData.subcategorias.find(sub => sub.id === id);
                if (subcategoriaItem) {
                    navigate(`/productos/${categoria}/${subcategoriaItem.nombre}`);
                    setCheckedElement({ subcategoria: id, subsubcategoria: null });
                }
            }
        } else if (type === 'subsubcategoria') {
            // Encontrar la subcategoría actual y el nombre de la subsubcategoría
            const currentSubcategoria = categoriaData.subcategorias.find(
                sub => sub.subsubcategorias.some(subsub => subsub.id === id)
            );
    
            if (currentSubcategoria) {
                const subsubcategoriaItem = currentSubcategoria.subsubcategorias.find(
                    subsub => subsub.id === id
                );
    
                if (subsubcategoriaItem) {
                    navigate(`/productos/${categoria}/${currentSubcategoria.nombre}/${subsubcategoriaItem.nombre}`);
                    setCheckedElement({
                        subcategoria: currentSubcategoria.id,
                        subsubcategoria: id
                    });
                }
            }
        }
    };

    const handleClickPanel = () => {
        setMostrarElemento(!mostrarElemento);
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
                            <CheckBox
                                id="todos"
                                onClick={() => handleClick('todos', 'subcategoria')}
                                marcado={checkedElement.subcategoria === 'todos'}
                            >
                                Todos
                            </CheckBox>
                        </li>

                        {/* Lista de subcategorías */}
                        {categoriaData.subcategorias.map(subcategoriaItem => (
                            <li key={subcategoriaItem.id}>
                                <CheckBox
                                    id={subcategoriaItem.id}
                                    onClick={() => handleClick(subcategoriaItem.id, 'subcategoria')}
                                    marcado={checkedElement.subcategoria === subcategoriaItem.id}
                                >
                                    {subcategoriaItem.nombre}
                                </CheckBox>
                                {subcategoriaItem.subsubcategorias.length > 0 && (
                                    <ul>
                                        {subcategoriaItem.subsubcategorias.map(subsubcategoriaItem => (
                                            <li key={subsubcategoriaItem.id}>
                                                <CheckBox
                                                    id={subsubcategoriaItem.id}
                                                    onClick={() => handleClick(subsubcategoriaItem.id, 'subsubcategoria')}
                                                    marcado={checkedElement.subsubcategoria === subsubcategoriaItem.id}
                                                >
                                                    {subsubcategoriaItem.nombre}
                                                </CheckBox>
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
                {isLoading ? (
                    <div>Cargando productos...</div>
                ) : error ? (
                    <div>Error: {error}</div>
                ) : productos.length === 0 ? (
                    <div>No hay productos disponibles</div>
                ) : (
                    productos.map((producto) => {
                    const enlaceImagen = producto.enlace_imagen
                        ? producto.enlace_imagen.startsWith('http')
                        ? producto.enlace_imagen
                        : `${BASE_URL_API}${producto.enlace_imagen}`
                        : false;

                    return (
                        <CartaProducto
                        key={producto.id}
                        enlace_imagen={enlaceImagen || imageHelper.defaultImg} // Usamos la variable definida
                        texto={producto.nombre}
                        id={producto.id}
                        />
                    );
                    })
                )}
            </div>
        </div>
    );
};

export default Productos;