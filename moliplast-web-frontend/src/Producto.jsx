import { useState, useEffect } from 'react';
import styles from './assets/styles/estilos_producto.module.scss';
import imageHelper from './utils/imageHelper';
import { MdPictureAsPdf } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";
import { BtnIconoTexto } from './widgets/Botones';
import InterpreteMarkdownHTML from './widgets/InterpreteMarkdownHTML';
import { TablaVariantes } from './widgets/TablaVariantes';
import { SeccionProductosImportantes } from './widgets/ProductosImportantes';
import { useParams, useLocation, useSearchParams } from 'react-router-dom';

import ProductoSkeleton from "./skeletons/ProductoSkeleton"

import MetaData from './widgets/Metadata'

import { getFullUrl, completarConCeros } from "./utils/utils.js"

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

const Producto = () => {
    const [botonActivo, setBotonActivo] = useState(1);
    const [producto, setProducto] = useState(null);
    const [imagenActual, setImagenActual] = useState(null); // Inicializa con null o una imagen de carga
    const { id } = useParams();

    const [productosRelacionados, setProductosRelacionados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const location = useLocation(); // Obtiene la ubicación actual

    //const searchParams = new URLSearchParams(location.search);

    const [searchParams, setSearchParams] = useSearchParams();

    const isSoftlink = searchParams.get('source') === 'softlink';

    const variantId = searchParams.get('variant');

    // 4. Buscamos el objeto de la variante
    const varianteSeleccionada = producto?.variantes?.find(v => v.id == variantId);

    // 5. DECISIÓN: ¿Qué mostramos? ¿El hijo (variante) o el padre?
    // Si hay variante seleccionada, usamos esa. Si no, usamos el producto base.
    const productoVisualizado = varianteSeleccionada || producto;

    // 6. LÓGICA DE IMÁGENES (Prioridad con Respaldo):
    // - Si el producto visualizado (variante) tiene al menos la imagen 1, usamos SUS imágenes.
    // - Si no tiene imágenes propias (o es null), usamos las del PADRE para que no se vea vacío.
    const productoImagenes = (productoVisualizado && productoVisualizado.imagen_1) ? productoVisualizado : producto;

    // Función segura para cambiar variante sin perder el ?source=softlink
    const handleVariantClick = (idVariante) => {
        setSearchParams(prev => {
            prev.set('variant', idVariante);
            return prev;
        });
    };


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
                    setProducto(productoActual);
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
        // Usamos 'productoImagenes' que ya tiene la lógica de fallback decidida arriba
        if (productoImagenes && productoImagenes.imagen_1) {
            setImagenActual(getFullUrl(productoImagenes.imagen_1));
            setBotonActivo(1);
        } else {
            setImagenActual(null);
        }
    }, [producto, productoVisualizado]); // Se recalcula cuando cambian estos

    const handleClick = (imagen, numButton) => {
        setImagenActual(imagen);
        setBotonActivo(numButton);
    };

    if (loading || !producto) {
        return (
            <>
                <MetaData title="Producto" canonical={`/productos/producto/${id}`}/>
                <ProductoSkeleton/>
            </>
        );
    }

    if (producto.error) {
        return <div>{producto.error}</div>;
    }

    let precioTruncado = productoVisualizado.precio_externo
        ? (Math.floor(productoVisualizado.precio_externo * 100) / 100).toFixed(2)
        : null;

    return (
        <>
            <MetaData title={productoVisualizado.nombre} canonical={`/productos/producto/${producto.id}`}/>
            <div className={styles.contenedor_producto}>
                <div className={styles.contenedor_imagenes}>
                    <div className={styles.cont_botones}>
                        {[productoImagenes.imagen_1, productoImagenes.imagen_2, productoImagenes.imagen_3, productoImagenes.imagen_4].map((img, index) => (
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
                    <div>
                        <div>
                            
                            {producto.variantes && producto.variantes.length > 0 && producto.nombre !== productoVisualizado.nombre && (
                                <p className={styles.nombre_maestro}>
                                    {producto.nombre}
                                </p>
                            ) }
                            {productoVisualizado.codigo && (
                                <p className={styles.codigo}>SKU: {completarConCeros(productoVisualizado.codigo)}</p>
                            )}
                        </div>
                        <h1>{productoVisualizado.nombre}</h1>
                    </div>
                    
                    {productoVisualizado.descripcion && (
                        <p>{productoVisualizado.descripcion}</p>
                    )}

                    {(producto.enlace_ficha_tecnica || !isSoftlink) && (
                        <div className={styles.contenedor_botones}>
                            {producto.enlace_ficha_tecnica && (
                                <BtnIconoTexto Icono={MdPictureAsPdf} enlace={getFullUrl(producto.enlace_ficha_tecnica)}>
                                    Ficha Técnica
                                </BtnIconoTexto>
                            )}
                            {!isSoftlink && (
                                <BtnIconoTexto Icono={FaWhatsapp} enlace={`https://wa.me/51959600464/?text=Hola%20estoy%20interesado%20en%20el%20producto%20${productoVisualizado.nombre}`} colorPrincipal="#075e54" colorActivo='#25d366'>
                                    Comprar por Whatsapp
                                </BtnIconoTexto>
                            )}
                        </div>
                    )}
                    
                    {isSoftlink && precioTruncado && (
                        <p className={styles.precio}>S/ {precioTruncado}</p>
                    )}

                    {/* === AQUI INSERTAMOS EL COMPONENTE DE TABLA === */}
                    <div className={styles.wrapper_tabla}>
                        <TablaVariantes 
                            variantes={producto.variantes}
                            atributos_division={producto.atributos_division}
                            variantId={variantId}
                            handleVariantClick={handleVariantClick}
                        />
                    </div>

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