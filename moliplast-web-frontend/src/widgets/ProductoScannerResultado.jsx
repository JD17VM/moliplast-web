import React, { useState, useEffect } from 'react';
import styles from '../assets/styles/estilos_scannerqr.module.scss';

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;
const TRES_HORAS_EN_MS = 3 * 60 * 60 * 1000;

const ProductoScannerResultado = ({ route }) => {
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProductoConPrecio = async () => {
      setLoading(true);
      setError('');
      setProducto(null);

      // 1. Extraemos el ID de la URL escaneada
      const expectedPrefix = "https://moliplast.com/api/api/producto/redirect/";
      if (!route || !route.startsWith(expectedPrefix)) {
        setError("El código QR escaneado no es válido.");
        setLoading(false);
        return;
      }
      const id = route.split('/').pop();

      // --- Inicio de la Lógica de "Softlink" para obtener el PRECIO ---
      try {
        // PASO A: Hacemos una primera llamada para obtener la info básica, sobre todo el ID de la categoría.
        // Usaremos el endpoint que tu código de ejemplo usa para esto.
        const productoInfoRes = await fetch(`${BASE_URL_API}/api/productos-softlink/${id}`);
        if (!productoInfoRes.ok) throw new Error('Producto no encontrado en el sistema.');
        
        const productoInfo = await productoInfoRes.json();
        const categoryId = productoInfo.id_categoria;
        const cacheKey = `cache_cat_${categoryId}`;

        // PASO B: Revisamos si tenemos datos válidos en la caché de esa categoría.
        const cacheGuardado = localStorage.getItem(cacheKey);
        if (cacheGuardado) {
          const datosCache = JSON.parse(cacheGuardado);
          if ((Date.now() - datosCache.timestamp) < TRES_HORAS_EN_MS) {
            const productoDeCache = datosCache.productos.find(p => p.id == id);
            if (productoDeCache) {
              console.log("¡Éxito! Producto con precio encontrado en la CACHÉ.");
              setProducto(productoDeCache); // Este producto ya tiene el precio
              setLoading(false);
              return; // Proceso terminado
            }
          }
        }

        // PASO C: Si no hay caché, descargamos la categoría completa (que sí contiene el precio).
        console.log("Caché no encontrada o expirada. Descargando categoría para obtener precios...");
        const categoriaCompletaRes = await fetch(`${BASE_URL_API}/api/productos-para-cache/categoria/${categoryId}`);
        if (!categoriaCompletaRes.ok) throw new Error('No se pudo obtener la información de precios.');
        
        const productosCategoria = await categoriaCompletaRes.json();
        
        // Buscamos nuestro producto en esta nueva lista para tener todos los datos.
        const productoFinal = productosCategoria.find(p => p.id == id);
        setProducto(productoFinal || productoInfo); // Usamos el producto de la lista, que tiene precio

        // PASO D: Guardamos la nueva lista en la caché para la próxima vez.
        const datosParaCache = { timestamp: Date.now(), productos: productosCategoria };
        localStorage.setItem(cacheKey, JSON.stringify(datosParaCache));

      } catch (err) {
        console.error('Error al obtener datos del producto:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductoConPrecio();

  }, [route]);

  if (loading) return <div className={styles.resultContainer}>Buscando producto y precio...</div>;
  if (error) return <div className={styles.resultContainer}><h3 className={styles.errorText}>Error</h3><p>{error}</p></div>;
  if (!producto) return null;
  
  const precioFinal = producto.precio_externo;

  return (
    <div className={styles.resultContainer}>
        <div className={styles.precio_codigo}>
            {precioFinal ? (
            <p className={styles.precio}>S/ {parseFloat(precioFinal).toFixed(2)}</p>
            ) : (
                <p>No Precio</p>
            )}

            <p className={styles.codigo}>{producto.codigo}</p>
        </div>
        <h1>{producto.nombre}</h1>
      
        <p>{producto.descripcion}</p>
    </div>
  );
}

export default ProductoScannerResultado;