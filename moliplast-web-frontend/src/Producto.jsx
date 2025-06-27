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
const TRES_HORAS_EN_MS = 3 * 60 * 60 * 1000;

const Producto = () => {
    const [botonActivo, setBotonActivo] = useState(1);
    const [producto, setProducto] = useState(null);
    const [imagenActual, setImagenActual] = useState(null); // Inicializa con null o una imagen de carga
    const { id } = useParams();

    const [productosRelacionados, setProductosRelacionados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const location = useLocation(); // Obtiene la ubicación actual

    const searchParams = new URLSearchParams(location.search);
    const isSoftlink = searchParams.get('source') === 'softlink';

    useEffect(() => {
        setLoading(true);
        setProducto(null);
        setImagenActual(null);

        const fetchProducto = async () => {
            if (isSoftlink) {
                setProductosRelacionados([]);
                try {
                    const productoActualRes = await fetch(`${BASE_URL_API}/api/productos-softlink/${id}`);
                    if (!productoActualRes.ok) throw new Error('Producto no encontrado');
                    const productoActual = await productoActualRes.json();

                    const categoryId = productoActual.id_categoria;
                    const cacheKey = `cache_cat_${categoryId}`;
                    const cacheGuardado = localStorage.getItem(cacheKey);

                    if (cacheGuardado) {
                        const datosCache = JSON.parse(cacheGuardado);
                        if ((Date.now() - datosCache.timestamp) < TRES_HORAS_EN_MS) {
                            const productoDeCache = datosCache.productos.find(p => p.id == id);
                            if (productoDeCache) {
                                setProducto(productoDeCache);
                                setLoading(false);
                                return;
                            }
                        }
                    }

                    setProducto(productoActual);
                    const categoriaCompletaRes = await fetch(`${BASE_URL_API}/api/productos-para-cache/categoria/${categoryId}`);
                    if (categoriaCompletaRes.ok) {
                        const productosCategoria = await categoriaCompletaRes.json();
                        const datosParaCache = { timestamp: Date.now(), productos: productosCategoria };
                        localStorage.setItem(cacheKey, JSON.stringify(datosParaCache));
                    }
                } catch (error) {
                    console.error('Error:', error);
                    setProducto({ error: "Producto no encontrado" });
                } finally {
                    setLoading(false);
                }
            } else {
                try {
                    const [productoRes, relacionadosRes] = await Promise.all([
                        fetch(`${BASE_URL_API}/api/productos/${id}`),
                        fetch(`${BASE_URL_API}/api/productos-relacionados/${id}`)
                    ]);

                    if (!productoRes.ok) throw new Error('Error al obtener los datos del producto');
                    const productoData = await productoRes.json();
                    setProducto(productoData);

                    if (relacionadosRes.ok) {
                        const relacionadosData = await relacionadosRes.json();
                        setProductosRelacionados(relacionadosData);
                    } else {
                        setProductosRelacionados([]);
                    }
                } catch (error) {
                console.error('Error fetching data:', error);
                setError('Error al cargar los ProductosRelacionados. Por favor, intenta nuevamente.');
                setProductosRelacionados([]);
            } finally {
                setLoading(false);
                }
            }
        };

        fetchProducto();
    }, [id, isSoftlink]);

    useEffect(() => {
        if (producto && producto.imagen_1) {
            setImagenActual(getFullUrl(producto.imagen_1));
            setBotonActivo(1);
        } else {
            setImagenActual(null);
        }
    }, [producto]);

    const handleClick = (imagen, numButton) => {
        setImagenActual(imagen);
        setBotonActivo(numButton);
    };

    if (loading || !producto) {
        return (
            <>
            <MetaData title="Producto" canonical={`/productos/producto/${id}`}/>
                <div>Cargando...</div>
            </>
        );
    }

    if (producto.error) {
        return <div>{producto.error}</div>;
    }

    let precioTruncado = producto.precio_externo
        ? (Math.floor(producto.precio_externo * 100) / 100).toFixed(2)
        : null;

    return (
        <>
            <MetaData title={producto.nombre} canonical={`/productos/producto/${producto.id}`}/>
            <div className={styles.contenedor_producto}>
                <div className={styles.contenedor_imagenes}>
                    <div className={styles.cont_botones}>
                        {[producto.imagen_1, producto.imagen_2, producto.imagen_3, producto.imagen_4].map((img, index) => (
                            img && (
                                <button
                                    key={index}
                                    onClick={() => handleClick(getFullUrl(img), index + 1)}
                                    className={botonActivo === index + 1 ? styles.activo : ''}
                                >
                                    <img src={getFullUrl(img)} alt="" />
                                </button>
                            )
                        ))}
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
                    {isSoftlink && precioTruncado && (
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