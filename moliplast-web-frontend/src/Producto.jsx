import { useState, useEffect } from 'react';
import styles from './assets/styles/estilos_producto.module.scss';
import imageHelper from './utils/imageHelper';
import { MdPictureAsPdf } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";
import { BtnIconoTexto } from './widgets/Botones';
import InterpreteMarkdownHTML from './widgets/InterpreteMarkdownHTML';
import { SeccionProductosImportantes } from './widgets/ProductosImportantes';
import { useParams } from 'react-router-dom';

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



    // Cargar datos del producto
    useEffect(() => {
        const fetchProducto = async () => {
            try {
                const response = await fetch(`${BASE_URL_API}/api/productos/${id}`);
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
    }, [id]);

    // Cargar productos relacionados
    useEffect(() => {
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
    }, [id]);

    const handleClick = (imagen, numButton) => {
        setImagenActual(imagen);
        setBotonActivo(numButton);
    };

    if (!producto) {
        return <div>Cargando...</div>;
    }

    return (
        <>
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
                        
                        <BtnIconoTexto Icono={FaWhatsapp} enlace={`https://wa.me/51922900787/?text=Hola%20estoy%20interesado%20en%20el%20producto%20${producto.nombre}`} colorPrincipal="#075e54" colorActivo='#25d366'>
                            Comprar por Whatsapp
                        </BtnIconoTexto>
                    </div>
                </div>
            </div>
            <div className={styles.descripcion_extra}>
                <InterpreteMarkdownHTML texto_markdown={producto.texto_markdown}/>
            </div>
            <SeccionProductosImportantes titulo='Productos Relacionados' data={productosRelacionados}/>
        </>
    );
};

export default Producto;