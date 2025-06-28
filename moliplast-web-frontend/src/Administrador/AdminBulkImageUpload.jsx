import React, { useState, useEffect, useRef } from 'react';
import styles from '../assets/styles/estilos_administradores.module.scss';
// Asumo que fetchData y getFullUrl son útiles y están en sus respectivas rutas
import { fetchData } from '../utils/api.js';
import { getFullUrl } from "../utils/utils.js";
import { TableData } from './widgets/Table'; // Reutilizamos TableData si es que la usas para estilos de celda

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

const AdminBulkImageUpload = () => {
    // --- Estados para la sección de productos (copiados/adaptados de AdminGeneradorQRs) ---
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [productos, setProductos] = useState([]);
    const [selectedProductIds, setSelectedProductIds] = useState([]); // Renombrado de selectedIds para claridad
    const [loadingProducts, setLoadingProducts] = useState(false); // Nuevo estado para la carga de productos
    const [productsError, setProductsError] = useState(''); // Nuevo estado para errores al cargar productos

    // Paginación (adaptada de AdminGeneradorQRs)
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        perPage: 50, // Puedes ajustar este valor
    });

    // Referencia para el control de tasa de solicitudes (mantener para loadProductos/searchProductos)
    const lastRequestTimeRef = useRef(0);
    const searchTimeoutRef = useRef(null); // Para el debounce de búsqueda

    // --- Estados para la sección de carga masiva de imágenes ---
    const [imagesToUpload, setImagesToUpload] = useState({
        imagen_1: null,
        imagen_2: null,
        imagen_3: null,
        imagen_4: null,
    });
    const [imagePreviews, setImagePreviews] = useState({
        imagen_1: '',
        imagen_2: '',
        imagen_3: '',
        imagen_4: '',
    });

    // Estados para manejo de UI de la subida masiva: carga, errores, éxito
    const [uploading, setUploading] = useState(false); // Renombrado de 'loading' para evitar conflicto
    const [uploadError, setUploadError] = useState(''); // Renombrado de 'error'
    const [uploadSuccess, setUploadSuccess] = useState(''); // Renombrado de 'success'

    // Referencias a los inputs de archivo para poder resetearlos
    const imagen1Ref = useRef(null);
    const imagen2Ref = useRef(null);
    const imagen3Ref = useRef(null);
    const imagen4Ref = useRef(null);

    // Mapeo de referencias de inputs
    const imageInputRefs = {
        imagen_1: imagen1Ref,
        imagen_2: imagen2Ref,
        imagen_3: imagen3Ref,
        imagen_4: imagen4Ref,
    };

    // --- Efectos y funciones de carga/búsqueda de productos (adaptados de AdminGeneradorQRs) ---

    // Cargar productos al inicio o al cambiar de página/búsqueda
    useEffect(() => {
        if (!isSearching) {
            loadProductos(pagination.currentPage);
        }
        // Limpieza del timeout al desmontar
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [isSearching, pagination.currentPage]);

    // Efecto para manejar la búsqueda con debounce
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        const delayDebounceFn = setTimeout(() => {
            if (searchTerm) {
                searchProductos(searchTerm);
            } else if (isSearching) {
                // Si el término de búsqueda se vacía después de buscar, recargar productos paginados
                setIsSearching(false);
                loadProductos(pagination.currentPage); // Recargar productos normales al borrar la búsqueda
            }
        }, 500);

        searchTimeoutRef.current = delayDebounceFn;

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchTerm, isSearching]); // isSearching como dependencia para resetear cuando se vacía el campo

    // Función para manejar solicitudes con control de tasa (reutilizada)
    const makeRateLimitedRequest = async (url, options = {}) => {
        const now = Date.now();
        const timeSinceLastRequest = now - lastRequestTimeRef.current;

        if (timeSinceLastRequest < 300) {
            await new Promise(resolve => setTimeout(resolve, 300 - timeSinceLastRequest));
        }

        lastRequestTimeRef.current = Date.now();

        try {
            const response = await fetch(url, options);

            if (response.status === 429) {
                const retryAfter = response.headers.get('Retry-After');
                const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 2000;

                console.log(`Rate limit alcanzado. Esperando ${waitTime}ms antes de reintentar...`);

                await new Promise(resolve => setTimeout(resolve, waitTime));

                return makeRateLimitedRequest(url, options);
            }

            if (!response.ok) {
                // Intenta obtener el error del JSON response si existe
                let errorDetail = await response.text();
                try {
                    const errorJson = JSON.parse(errorDetail);
                    if(errorJson.message) errorDetail = errorJson.message;
                    else if (errorJson.errors) errorDetail = JSON.stringify(errorJson.errors);
                } catch(e) {
                    // Ignore JSON parsing error, use text
                }
                throw new Error(`HTTP error! status: ${response.status} - ${errorDetail}`);
            }

            return response.json();
        } catch (error) {
            console.error('Error en la solicitud rate-limited:', error);
            throw error; // Re-lanzar para que el llamador pueda manejarlo
        }
    };

    // Función para cargar productos (con paginación)
    const loadProductos = async (page = 1) => {
        setLoadingProducts(true); // Usamos loadingProducts
        setProductsError(''); // Limpiamos errores de productos
        try {
            const data = await makeRateLimitedRequest(`${BASE_URL_API}/api/productos?page=${page}&per_page=${pagination.perPage}`);

            if (data && data.data && Array.isArray(data.data)) {
                setProductos(data.data);
                setPagination({
                    currentPage: data.current_page,
                    totalPages: data.last_page,
                    perPage: data.per_page,
                });
            } else {
                setProductos([]);
                setPagination(prev => ({ ...prev, currentPage: 1, totalPages: 1 }));
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setProductsError('Error al cargar productos. Por favor, intenta nuevamente.');
            setProductos([]);
            setPagination(prev => ({ ...prev, currentPage: 1, totalPages: 1 }));
        } finally {
            setLoadingProducts(false);
        }
    };

    // Función para buscar productos
    const searchProductos = async (query) => {
        if (!query.trim() || query.trim().length < 3) {
            if (isSearching) {
                setIsSearching(false);
                loadProductos(pagination.currentPage);
            }
            return;
        }

        setLoadingProducts(true);
        setIsSearching(true);
        setProductsError('');

        try {
            const data = await makeRateLimitedRequest(`${BASE_URL_API}/api/products/complete-search?query=${encodeURIComponent(query)}`);

            if (data && Array.isArray(data)) {
                setProductos(data);
            } else {
                setProductos([]);
            }
            // La búsqueda no tiene paginación en esta implementación, se resetea
            setPagination(prev => ({
                ...prev,
                currentPage: 1,
                totalPages: 1,
            }));
        } catch (error) {
            console.error('Error searching productos:', error);
            setProductsError('Error al buscar productos. Por favor, intenta nuevamente en unos momentos.');
            setProductos([]);
            setPagination(prev => ({ ...prev, currentPage: 1, totalPages: 1 }));
        } finally {
            setLoadingProducts(false);
        }
    };

    // Manejar cambio en el input de búsqueda
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Limpiar búsqueda
    const clearSearch = () => {
        setSearchTerm('');
        // isSearching se manejará por el useEffect al cambiar searchTerm a vacío
    };

    // Manejar la selección/deselección de productos (renombrada de handleSelectProduct)
    const handleProductSelection = (productId) => {
        setSelectedProductIds(prevSelected => {
            if (prevSelected.includes(productId)) {
                return prevSelected.filter(id => id !== productId); // Deseleccionar
            } else {
                return [...prevSelected, productId]; // Seleccionar
            }
        });
    };

    // Seleccionar/deseleccionar todos los productos visibles
    const toggleSelectAll = () => {
        if (selectedProductIds.length === productos.length) {
            setSelectedProductIds([]); // Deseleccionar todos
        } else {
            setSelectedProductIds(productos.map(p => p.id)); // Seleccionar todos
        }
    };

    // Cambiar de página
    const handlePageChange = (newPage) => {
        if (loadingProducts) return;
        loadProductos(newPage);
    };


    // --- Funciones para la sección de carga de imágenes ---

    // Manejar el cambio de archivos de imagen (reutilizada del código anterior)
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        const fieldName = e.target.name;

        if (file) {
            setImagesToUpload(prevImages => ({ ...prevImages, [fieldName]: file }));
            const reader = new FileReader();
            reader.onload = () => {
                setImagePreviews(prevPreviews => ({ ...prevPreviews, [fieldName]: reader.result }));
            };
            reader.readAsDataURL(file);
        } else {
            setImagesToUpload(prevImages => ({ ...prevImages, [fieldName]: null }));
            setImagePreviews(prevPreviews => ({ ...prevPreviews, [fieldName]: '' }));
        }
    };

    // Limpiar el campo de imagen y su previsualización (reutilizada)
    const handleClearImage = (fieldName) => {
        setImagesToUpload(prevImages => ({ ...prevImages, [fieldName]: null }));
        setImagePreviews(prevPreviews => ({ ...prevPreviews, [fieldName]: '' }));
        if (imageInputRefs[fieldName] && imageInputRefs[fieldName].current) {
            imageInputRefs[fieldName].current.value = ""; // Limpiar el input file
        }
    };

    // Función para manejar la subida masiva (reutilizada y adaptada)
    const handleBulkUpload = async (e) => {
        e.preventDefault();
        setUploading(true); // Usamos uploading
        setUploadError(''); // Limpiamos uploadError
        setUploadSuccess(''); // Limpiamos uploadSuccess

        if (selectedProductIds.length === 0) {
            setUploadError('Por favor, selecciona al menos un producto para aplicar las imágenes.');
            setUploading(false);
            return;
        }

        const hasImage = Object.values(imagesToUpload).some(file => file instanceof File);
        if (!hasImage) {
            setUploadError('Por favor, selecciona al menos una imagen para subir.');
            setUploading(false);
            return;
        }

        const formData = new FormData();
        formData.append('product_ids', JSON.stringify(selectedProductIds));

        Object.keys(imagesToUpload).forEach(fieldName => {
            const file = imagesToUpload[fieldName];
            if (file instanceof File) {
                formData.append(fieldName, file);
            }
        });

        try {
            const response = await fetch(`${BASE_URL_API}/api/productos/bulk-image-upload`, {
                method: 'POST',
                body: formData,
            });

            const responseData = await response.json();

            if (!response.ok) {
                const errorMsg = responseData?.message || `HTTP error! status: ${response.status}`;
                if (responseData?.errors) {
                    setUploadError(`Errores de validación: ${JSON.stringify(responseData.errors, null, 2)}`);
                } else {
                    setUploadError(`Error: ${errorMsg}`);
                }
                throw new Error(`Request failed with status ${response.status}`);
            }

            setUploadSuccess('Imágenes subidas y relacionadas exitosamente a los productos seleccionados!');
            resetForm(); // Limpiar formulario de subida
            setSelectedProductIds([]); // Limpiar selección de productos
            loadProductos(pagination.currentPage); // Recargar la lista de productos para reflejar los cambios

        } catch (error) {
            console.error('Error durante la carga masiva de imágenes:', error);
            if (!error.message || !error.message.startsWith('HTTP error! status:')) {
                setUploadError(`Error: ${error.message || 'Ocurrió un error inesperado al subir las imágenes.'}`);
            }
        } finally {
            setUploading(false);
        }
    };

    // Limpiar el formulario de subida masiva y la selección de productos
    const resetForm = () => {
        setImagesToUpload({
            imagen_1: null,
            imagen_2: null,
            imagen_3: null,
            imagen_4: null,
        });
        setImagePreviews({
            imagen_1: '',
            imagen_2: '',
            imagen_3: '',
            imagen_4: '',
        });
        if (imagen1Ref.current) imagen1Ref.current.value = '';
        if (imagen2Ref.current) imagen2Ref.current.value = '';
        if (imagen3Ref.current) imagen3Ref.current.value = '';
        if (imagen4Ref.current) imagen4Ref.current.value = '';
        // No limpiamos selectedProductIds aquí, lo hacemos en handleBulkUpload exitoso
        // o se puede agregar un botón para "Desmarcar todos"
    };


    return (
        <div className={styles.contenedor_total_administrador} style={{ flexDirection: 'column' }}>
            <h2 className='mt-4 mb-3'>Subir Imágenes en Grupo</h2>

            {/* Mensajes de error/éxito para la carga masiva */}
            {uploadError && (
                <div style={{ background: '#ffebee', color: '#c62828', padding: '10px', marginBottom: '15px', borderRadius: '4px' }}>
                    {uploadError}
                </div>
            )}
            {uploadSuccess && (
                <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '10px', marginBottom: '15px', borderRadius: '4px' }}>
                    {uploadSuccess}
                </div>
            )}
            {/* Mensajes de error/éxito para la carga/búsqueda de productos */}
            {productsError && (
                <div style={{ background: '#ffebee', color: '#c62828', padding: '10px', marginBottom: '15px', borderRadius: '4px' }}>
                    {productsError}
                </div>
            )}

            {/* Controles superiores: Buscador y Botón de Desmarcar/Seleccionar Todos */}
            <div className="d-flex justify-content-between mb-4 flex-wrap gap-2">
                {/* Buscador de productos */}
                <div style={{ flexGrow: 1, maxWidth: '60%' }}>
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar producto por nombre o código..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            aria-label="Buscar producto"
                            disabled={loadingProducts}
                        />
                        {searchTerm && (
                            <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={clearSearch}
                                disabled={loadingProducts}
                            >
                                Limpiar
                            </button>
                        )}
                    </div>
                    {isSearching && <small className="text-muted">Mostrando resultados para: "{searchTerm}"</small>}
                </div>

                {/* Botones de acción general */}
                <div className="d-flex align-items-center gap-2">
                    <button
                        className="btn btn-secondary"
                        onClick={toggleSelectAll}
                        disabled={loadingProducts || productos.length === 0}
                    >
                        {selectedProductIds.length === productos.length && productos.length > 0
                            ? 'Desmarcar Todos'
                            : `Seleccionar Todos (${selectedProductIds.length}/${productos.length})`}
                    </button>
                    <button
                        className="btn btn-warning"
                        onClick={() => setSelectedProductIds([])} // Botón para limpiar solo la selección
                        disabled={loadingProducts || selectedProductIds.length === 0}
                    >
                        Limpiar Selección
                    </button>
                </div>
            </div>

            <div className={styles.contenedor_total_administrador}>
                {/* Sección para selección de productos (adaptada con tabla) */}
                <div className={styles.contenedor_registros} style={{ flex: 1.5, minWidth: '45%' }}>
                    <h3>Lista de Productos</h3>
                    {loadingProducts ? (
                        <p>Cargando productos...</p>
                    ) : (
                        <table className="table table-striped table-responsive align-middle">
                            <thead className="table-dark">
                                <tr>
                                    <th style={{ width: "50px" }}></th> {/* Checkbox de selección */}
                                    <th style={{ width: "80px" }}>Código</th>
                                    <th style={{ width: "200px" }}>Nombre</th>
                                    <th style={{ width: "100px" }}>Imagen Actual</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productos.length === 0 && !loadingProducts ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4">
                                            {isSearching
                                                ? `No se encontraron productos con el término "${searchTerm}"`
                                                : 'No hay productos disponibles'}
                                        </td>
                                    </tr>
                                ) : (
                                    productos.map(producto => (
                                        <tr key={producto.id}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    id={`product-${producto.id}`}
                                                    checked={selectedProductIds.includes(producto.id)}
                                                    onChange={() => handleProductSelection(producto.id)}
                                                    disabled={uploading || loadingProducts}
                                                    className="form-check-input mt-0"
                                                />
                                            </td>
                                            <TableData>{producto.codigo}</TableData>
                                            <TableData>{producto.nombre}</TableData>
                                            <td>
                                                {producto.imagen_1 ? (
                                                    <img
                                                        src={getFullUrl(producto.imagen_1)}
                                                        alt={producto.nombre}
                                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <span className="text-muted">No img</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}

                    {/* Paginación - solo se muestra cuando no estamos buscando y hay más de una página */}
                    {!isSearching && pagination.totalPages > 1 && (
                        <div className="pagination d-flex justify-content-center my-4">
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                .filter(page => page >= Math.max(1, pagination.currentPage - 2) && page <= Math.min(pagination.totalPages, pagination.currentPage + 2))
                                .map(page => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`btn ${pagination.currentPage === page ? 'btn-primary' : 'btn-outline-primary'} mx-1`}
                                        disabled={loadingProducts || uploading}
                                    >
                                        {page}
                                    </button>
                                ))}
                        </div>
                    )}
                </div>

                {/* Sección para carga de imágenes */}
                <div className={styles.contenedor_formulario} style={{ flex: 1, minWidth: '45%' }}>
                    <h3>Subir Archivos de Imagen</h3>
                    <form onSubmit={handleBulkUpload} encType="multipart/form-data" className="row g-3">
                        {/* Campo de selección de imagen 1 */}
                        <div className="col-12">
                            <label htmlFor="imagen_1_bulk" className="form-label fw-bold">Imagen 1</label>
                            <div className="input-group">
                                <input
                                    type="file"
                                    id="imagen_1_bulk"
                                    name="imagen_1"
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    ref={imagen1Ref}
                                    className="form-control"
                                    disabled={uploading}
                                />
                                {imagePreviews.imagen_1 && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger"
                                        onClick={() => handleClearImage('imagen_1')}
                                        disabled={uploading}
                                    >
                                        Limpiar
                                    </button>
                                )}
                            </div>
                            {imagePreviews.imagen_1 && (
                                <div className="mt-2">
                                    <img src={imagePreviews.imagen_1} alt="Preview 1" style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain' }} />
                                </div>
                            )}
                        </div>

                        {/* Campo de selección de imagen 2 */}
                        <div className="col-12">
                            <label htmlFor="imagen_2_bulk" className="form-label fw-bold">Imagen 2</label>
                            <div className="input-group">
                                <input
                                    type="file"
                                    id="imagen_2_bulk"
                                    name="imagen_2"
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    ref={imagen2Ref}
                                    className="form-control"
                                    disabled={uploading}
                                />
                                {imagePreviews.imagen_2 && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger"
                                        onClick={() => handleClearImage('imagen_2')}
                                        disabled={uploading}
                                    >
                                        Limpiar
                                    </button>
                                )}
                            </div>
                            {imagePreviews.imagen_2 && (
                                <div className="mt-2">
                                    <img src={imagePreviews.imagen_2} alt="Preview 2" style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain' }} />
                                </div>
                            )}
                        </div>

                        {/* Campo de selección de imagen 3 */}
                        <div className="col-12">
                            <label htmlFor="imagen_3_bulk" className="form-label fw-bold">Imagen 3</label>
                            <div className="input-group">
                                <input
                                    type="file"
                                    id="imagen_3_bulk"
                                    name="imagen_3"
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    ref={imagen3Ref}
                                    className="form-control"
                                    disabled={uploading}
                                />
                                {imagePreviews.imagen_3 && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger"
                                        onClick={() => handleClearImage('imagen_3')}
                                        disabled={uploading}
                                    >
                                        Limpiar
                                    </button>
                                )}
                            </div>
                            {imagePreviews.imagen_3 && (
                                <div className="mt-2">
                                    <img src={imagePreviews.imagen_3} alt="Preview 3" style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain' }} />
                                </div>
                            )}
                        </div>

                        {/* Campo de selección de imagen 4 */}
                        <div className="col-12">
                            <label htmlFor="imagen_4_bulk" className="form-label fw-bold">Imagen 4</label>
                            <div className="input-group">
                                <input
                                    type="file"
                                    id="imagen_4_bulk"
                                    name="imagen_4"
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    ref={imagen4Ref}
                                    className="form-control"
                                    disabled={uploading}
                                />
                                {imagePreviews.imagen_4 && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger"
                                        onClick={() => handleClearImage('imagen_4')}
                                        disabled={uploading}
                                    >
                                        Limpiar
                                    </button>
                                )}
                            </div>
                            {imagePreviews.imagen_4 && (
                                <div className="mt-2">
                                    <img src={imagePreviews.imagen_4} alt="Preview 4" style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain' }} />
                                </div>
                            )}
                        </div>

                        <div className="col-12">
                            <button
                                type="submit"
                                className="btn btn-primary w-100"
                                // Deshabilitar si está subiendo, no hay productos seleccionados, o no hay imágenes para subir
                                disabled={uploading || selectedProductIds.length === 0 || !Object.values(imagesToUpload).some(file => file instanceof File)}
                            >
                                {uploading ? 'Subiendo...' : 'Subir Imágenes a Productos Seleccionados'}
                            </button>
                        </div>
                        <div className="col-12">
                            <button
                                type="button"
                                className="btn btn-secondary w-100 mt-2"
                                onClick={resetForm}
                                disabled={uploading}
                            >
                                Limpiar Formulario de Imágenes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminBulkImageUpload;