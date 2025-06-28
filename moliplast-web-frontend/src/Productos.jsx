import styles from './assets/styles/estilos_productos.module.scss';
import imageHelper from './utils/imageHelper';
import CartaProducto from './widgets/CartaProducto';
import { IoFilter } from "react-icons/io5";
import { IoIosCloseCircle } from "react-icons/io";
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

import ProductosSkeleton from "./skeletons/ProductosSkeleton"

import { getFullUrl } from "./utils/utils.js"

import MetaData from './widgets/Metadata'

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

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
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 }); // Estado de paginación
    const [checkedElement, setCheckedElement] = useState({ subcategoria: 'todos', subsubcategoria: null });
    const [mostrarElemento, setMostrarElemento] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { categoria, subcategoria, subsubcategoria } = useParams();

    // Obtener datos de subcategorías
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Limpiar el estado de categoriaData al cambiar de categoría
                setCategoriaData(null);
    
                const response = await fetch(`${BASE_URL_API}/api/subcategorias-por-categoria/${categoria}`);
                
                // Si la respuesta es 404, la categoría no tiene subcategorías
                if (response.status === 404) {
                    setCategoriaData({ subcategorias: [] }); // Establecer subcategorías como un array vacío
                    setCheckedElement({ subcategoria: 'todos', subsubcategoria: null });
                    fetchProductos(); // Cargar productos directamente
                    return;
                }
    
                if (!response.ok) {
                    throw new Error('Error al obtener las subcategorías');
                }
    
                const data = await response.json();
                setCategoriaData(data);
    
                // Si no hay subcategorías, forzar la carga de productos
                if (!data.subcategorias || data.subcategorias.length === 0) {
                    setCheckedElement({ subcategoria: 'todos', subsubcategoria: null });
                    fetchProductos(); // Cargar productos directamente
                }
            } catch (error) {
                console.error('Error:', error);
                setError('No se pudieron cargar las subcategorías');
            }
        };
    
        if (categoria) {
            fetchData();
        }
    }, [categoria]);

    // Obtener productos con paginación
    const fetchProductos = async (page = 1) => {
        setIsLoading(true);
        setError(null);
        try {
            let url = `${BASE_URL_API}/api/productos/carta/${categoria}`;
    
            // Agregar subcategoría si existe y no es "todos"
            if (subcategoria && subcategoria !== 'todos') {
                url += `/${subcategoria}`;
            }
    
            // Agregar subsubcategoría si existe
            if (subsubcategoria) {
                url += `/${subsubcategoria}`;
            }
    
            // Agregar parámetro de paginación
            url += `?page=${page}`;
    
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Error al obtener los productos');
            }
            const data = await response.json();
            setProductos(data.data);
            setPagination({
                currentPage: data.current_page,
                totalPages: data.last_page
            });
        } catch (error) {
            console.error('Error:', error);
            setError('No se pudieron cargar los productos');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (categoria) {
            fetchProductos();
        }
    }, [categoria, subcategoria, subsubcategoria]);

    // Cambiar de página
    const handlePageChange = (newPage) => {
        fetchProductos(newPage);
    };

    // Marcar el CheckBox según la subcategoria o subsubcategoria en la URL
    useEffect(() => {
        if (categoriaData) {
            if (!subcategoria || subcategoria === 'todos') {
                setCheckedElement({ subcategoria: 'todos', subsubcategoria: null });
            } else {
                const subcategoriaEncontrada = categoriaData.subcategorias.find(
                    (sub) => sub.nombre === subcategoria
                );

                if (subcategoriaEncontrada) {
                    setCheckedElement({
                        subcategoria: subcategoriaEncontrada.id,
                        subsubcategoria: null
                    });

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
                navigate(`/productos/${categoria}`);
                setCheckedElement({ subcategoria: 'todos', subsubcategoria: null });
            } else {
                const subcategoriaItem = categoriaData.subcategorias.find(sub => sub.id === id);
                if (subcategoriaItem) {
                    navigate(`/productos/${categoria}/${subcategoriaItem.nombre}`);
                    setCheckedElement({ subcategoria: id, subsubcategoria: null });
                }
            }
        } else if (type === 'subsubcategoria') {
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
        return (
            <ProductosSkeleton/>
        );
    }

    return (
        <>
        <MetaData title={`${categoria}`} canonical={`/productos/${categoria}`}/>
        <div className={styles.seccion_productos}>
            <div className={`${styles.cont_panel_filtros_busqueda} ${mostrarElemento ? styles.mostrar : styles.ocultar}`}>
            <div className={styles.panel_filtros}>
                <h2>Panel de Filtros</h2>
                <ul>
                    <li>
                        <CheckBox
                            id="todos"
                            onClick={() => handleClick('todos', 'subcategoria')}
                            marcado={checkedElement.subcategoria === 'todos'}
                        >
                            Todos
                        </CheckBox>
                    </li>
                    {categoriaData && categoriaData.subcategorias && categoriaData.subcategorias.length > 0 ? (
                        categoriaData.subcategorias.map(subcategoriaItem => (
                            <li key={subcategoriaItem.id}>
                                <CheckBox
                                    id={subcategoriaItem.id}
                                    onClick={() => handleClick(subcategoriaItem.id, 'subcategoria')}
                                    marcado={checkedElement.subcategoria === subcategoriaItem.id}
                                >
                                    {subcategoriaItem.nombre}
                                </CheckBox>
                                {subcategoriaItem.subsubcategorias && subcategoriaItem.subsubcategorias.length > 0 && (
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
                        ))
                    ) : (
                        <li>No hay subcategorías disponibles</li>
                    )}
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
                    productos.map((producto) => (
                        <CartaProducto
                            key={producto.id}
                            enlace_imagen={getFullUrl(producto.imagen_1) || imageHelper.defaultImg}
                            texto={producto.nombre}
                            id={producto.id}
                        />
                    ))
                )}
            </div>

            {/* Paginación */}
            <div className={styles.pagination}>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                    <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={pagination.currentPage === page ? styles.active : ''}
                    >
                        {page}
                    </button>
                ))}
            </div>
            
        </div>
        </>
    );
};

export default Productos;