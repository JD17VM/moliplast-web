import React, { useState, useEffect } from 'react';
import styles from '../assets/styles/estilos_scannerqr.module.scss';
import { db } from '../utils/db'; // Importamos la configuración de Dexie actualizada

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
      const id = parseInt(route.split('/').pop(), 10);

      try {
        // --- INICIO DE LA LÓGICA CON ÍNDICE MAESTRO ---

        // PASO A: Búsqueda LOCAL en el índice maestro para obtener la categoría.
        // Esta operación es instantánea y no requiere conexión a internet.
        const indexEntry = await db.productIndex.get(id);

        if (!indexEntry) {
          // Si el producto no está en nuestro índice, puede ser un QR nuevo o el índice está desactualizado.
          throw new Error('Producto no encontrado en el índice local. Intente sincronizar la aplicación.');
        }
        
        const categoryId = indexEntry.id_categoria;

        // PASO B: Revisamos si la categoría completa está en caché y no ha expirado
        const cacheCategoria = await db.categoriesCache.get(categoryId);
        if (cacheCategoria && (Date.now() - cacheCategoria.timestamp) < TRES_HORAS_EN_MS) {
          // Si la caché es válida, buscamos el producto completo directamente en la BD
          const productoDeCache = await db.products.get(id); 

          if (productoDeCache) {
            console.log("✅ ¡Éxito! Producto encontrado en la CACHÉ de IndexedDB.");
            setProducto(productoDeCache);
            setLoading(false);
            return; // Proceso terminado
          }
        }
        
        // PASO C: Si la caché no existe o expiró, descargamos la categoría completa (única llamada a la red)
        console.log("Caché de categoría no encontrada o expirada. Descargando desde la red...");
        const categoriaCompletaRes = await fetch(`${BASE_URL_API}/api/productos-para-cache/categoria/${categoryId}`);
        if (!categoriaCompletaRes.ok) throw new Error('No se pudo obtener la información de precios.');
        
        const productosCategoria = await categoriaCompletaRes.json();
        
        // PASO D: Guardamos los nuevos datos en IndexedDB
        await db.transaction('rw', db.products, db.categoriesCache, async () => {
          await db.categoriesCache.put({ id: categoryId, timestamp: Date.now() });
          await db.products.bulkPut(productosCategoria);
        });

        // Buscamos nuestro producto en la lista recién descargada para mostrarlo
        const productoFinal = productosCategoria.find(p => p.id === id);
        if (!productoFinal) throw new Error('El producto no se encontró en los datos de la categoría descargada.');
        
        setProducto(productoFinal);

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