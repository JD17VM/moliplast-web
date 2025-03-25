import styles from './assets/styles/estilos_productos.module.scss';
import imageHelper from './utils/imageHelper';
import CartaProducto from './widgets/CartaProducto';
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getFullUrl } from "./utils/utils.js";

import MetaData from './widgets/Metadata'

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

const ProductosSearch = () => {
    const { texto } = useParams(); // Obtener el texto de búsqueda de la URL
    const [productos, setProductos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProductos = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${BASE_URL_API}/api/products/complete-search?query=${texto}`);
                if (!response.ok) {
                    throw new Error('Error al obtener los productos');
                }
                const data = await response.json();
                setProductos(data);
            } catch (error) {
                console.error('Error:', error);
                setError('No se pudieron cargar los productos');
            } finally {
                setIsLoading(false);
            }
        };

        if (texto) {
            fetchProductos();
        }
    }, [texto]);

    return (
        <>
        <MetaData title={`Buscar: ${texto}`} robots="noindex"/>
        <div className={styles.seccion_productos}>
            <div className={styles.titulo_boton_menu}>
                <h1>Resultados de búsqueda para: {texto}</h1>
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
        </div>
        </>
    );
};

export default ProductosSearch;