import { useState, useEffect } from 'react';
import styles from './assets/styles/estilos_producto.module.scss';
import imageHelper from './utils/imageHelper';
import { MdPictureAsPdf } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";
import { BtnIconoTexto } from './widgets/Botones';
import InterpreteMarkdownHTML from './widgets/InterpreteMarkdownHTML';
import { SeccionProductosImportantes } from './widgets/ProductosImportantes';
import { useParams, useLocation } from 'react-router-dom';

import MetaData from './widgets/Metadata'

import { getFullUrl } from "./utils/utils.js"

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

const Producto = () => {
    const [botonActivo, setBotonActivo] = useState(1);
    const [producto, setProducto] = useState(null);
    const [imagenActual, setImagenActual] = useState(null); // Inicializa con null o una imagen de carga
    const { id } = useParams();
    
    const [productosRelacionados, setProductosRelacionados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const location = useLocation(); // Obtiene la ubicación actual

    const searchParams = new URLSearchParams(location.search);
    const isSoftlink = searchParams.get('source') === 'softlink';

    // Cargar datos del producto
    useEffect(() => {
        setProducto(null);
        setImagenActual(null);
        
        const fetchProducto = async () => {
            let url = `${BASE_URL_API}/api/productos/${id}`;
            if (isSoftlink) {
                url = `${BASE_URL_API}/api/productos-softlink/${id}`;
            }
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Error al obtener los datos del producto');
                }
                const data = await response.json();
                setProducto(data);

                // Actualiza la imagen actual cuando el producto se carga
                if (data.imagen_1) {
                    setImagenActual(data.imagen_1.startsWith('http') ? data.imagen_1 : `${BASE_URL_API}${data.imagen_1}`);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };

        fetchProducto();
    }, [id, location.search, isSoftlink]);

    // Cargar productos relacionados
    useEffect(() => {

        if (isSoftlink) {
            setProductosRelacionados([]); // Limpia el estado por si había datos de una navegación anterior
            return; // Sale del useEffect y no ejecuta la llamada a la API
        }

        const loadProductosRelacionados = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await fetch(`${BASE_URL_API}/api/productos-relacionados/${id}`);
                
                if (response.status === 404) {
                    console.log('No hay ProductosRelacionados disponibles');
                    setProductosRelacionados([]);
                    setLoading(false);
                    return;
                }
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                setProductosRelacionados(data);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Error al cargar los ProductosRelacionados. Por favor, intenta nuevamente.');
                setProductosRelacionados([]);
            } finally {
                setLoading(false);
            }
        };

        loadProductosRelacionados();
    }, [id, isSoftlink]);

    const handleClick = (imagen, numButton) => {
        setImagenActual(imagen);
        setBotonActivo(numButton);
    };

    if (!producto) {
        return (
        <>
            <MetaData title="Producto" canonical={`/productos/producto/${id}`}/>
            <div>Cargando...</div>
        </>
        );
    }
    let precioTruncado = 0; // Declarar con let

    if (producto && producto.precio_externo) {
        precioTruncado = (Math.floor(producto.precio_externo * 100) / 100).toFixed(2); // Reasignar valor
    }

    return (
        <>
            <MetaData title={producto.nombre} canonical={`/productos/producto/${producto.id}`}/>
            <div className={styles.contenedor_producto}>
                <div className={styles.contenedor_imagenes}>
                    <div className={styles.cont_botones}>
                        <button
                            onClick={() => handleClick(getFullUrl(producto.imagen_1), 1)}
                            className={botonActivo === 1 ? styles.activo : ''}
                        >
                            <img src={getFullUrl(producto.imagen_1) || imageHelper.defaultImg} alt="" />
                        </button>
                        
                        {producto.imagen_2 && (
                            <button
                                onClick={() => handleClick(getFullUrl(producto.imagen_2), 2)}
                                className={botonActivo === 2 ? styles.activo : ''}
                            >
                                <img src={getFullUrl(producto.imagen_2)} alt="" />
                            </button>
                        )}

                        {producto.imagen_3 && (
                            <button
                                onClick={() => handleClick(getFullUrl(producto.imagen_3), 3)}
                                className={botonActivo === 3 ? styles.activo : ''}
                            >
                                <img src={getFullUrl(producto.imagen_3)} alt="" />
                            </button>
                        )}

                        {producto.imagen_4 && (
                            <button
                                onClick={() => handleClick(getFullUrl(producto.imagen_4), 4)}
                                className={botonActivo === 4 ? styles.activo : ''}
                            >
                                <img src={getFullUrl(producto.imagen_4)} alt="" />
                            </button>
                        )}
                    </div>
                    <div className={styles.cont_imagen}>
                        {imagenActual ? (
                            <img src={imagenActual} alt="" />
                            ) : (
                            <img src={imageHelper.defaultImg} alt="" />
                        )}
                    </div>
                </div>
                <div className={styles.contenedor_datos}>
                    <h1>{producto.nombre}</h1>
                    <p>{producto.descripcion}</p>
                    <div>
                        {producto.enlace_ficha_tecnica && (
                            <BtnIconoTexto Icono={MdPictureAsPdf} enlace={getFullUrl(producto.enlace_ficha_tecnica)}>
                                Ficha Técnica
                            </BtnIconoTexto>
                        )}
                        
                        <BtnIconoTexto Icono={FaWhatsapp} enlace={`https://wa.me/51959600464/?text=Hola%20estoy%20interesado%20en%20el%20producto%20${producto.nombre}`} colorPrincipal="#075e54" colorActivo='#25d366'>
                            Comprar por Whatsapp
                        </BtnIconoTexto>
                    </div>
                    {producto.precio_externo && (
                        <p className={styles.precio}>S/ {precioTruncado}</p>  
                    )}
                </div>
            </div>
            {producto.texto_markdown && ( //Correccion extra cuando no hay descripcion extra
                <div className={styles.descripcion_extra}>
                    <InterpreteMarkdownHTML texto_markdown={producto.texto_markdown}/>
                </div>
            )}
            {!isSoftlink && (
                <SeccionProductosImportantes titulo='Productos Relacionados' data={productosRelacionados}/>
            )}
        </>
    );
};

export default Producto;