import React, { useState, useEffect, useRef } from 'react';
import styles from '../assets/styles/estilos_administradores.module.scss';
import { TableData } from './widgets/Table';

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

const AdminGeneradorQRs = () => {
    // Estados principales
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [productos, setProductos] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [documentGenerating, setDocumentGenerating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Paginación
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        perPage: 50,
    });

    // Referencia para el control de tasa de solicitudes
    const lastRequestTimeRef = useRef(0);

    // Cargar productos al inicio
    useEffect(() => {
        if (!isSearching) {
            loadProductos(pagination.currentPage);
        }
    }, [isSearching, pagination.currentPage]);

    // Función para manejar solicitudes con control de tasa
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
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return response.json();
        } catch (error) {
            console.error('Error en la solicitud:', error);
            throw error;
        }
    };

    // Función para buscar productos
    const searchProductos = async (query) => {
        if (!query.trim() || query.trim().length < 3) return;
    
        setLoading(true);
        setIsSearching(true);
        setError('');
    
        try {
            const data = await makeRateLimitedRequest(`${BASE_URL_API}/api/products/complete-search?query=${encodeURIComponent(query)}`);
    
            if (data && Array.isArray(data)) {
                setProductos(data);
            } else {
                setProductos([]);
            }
    
            setPagination({
                ...pagination,
                currentPage: 1,
                totalPages: 1,
            });
        } catch (error) {
            console.error('Error searching productos:', error);
            setError('Error al buscar productos. Por favor, intenta nuevamente en unos momentos.');
        } finally {
            setLoading(false);
        }
    };

    // Función para cargar productos
    const loadProductos = async (page = 1) => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL_API}/api/productos?page=${page}&per_page=${pagination.perPage}`);
            
            if (!response.ok) {
                throw new Error('Error al cargar productos');
            }
            
            const data = await response.json();
            setProductos(data.data);
            setPagination({
                currentPage: data.current_page,
                totalPages: data.last_page,
            });
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Efecto para manejar la búsqueda con debounce
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm) {
                searchProductos(searchTerm);
            } else if (isSearching) {
                setIsSearching(false);
                loadProductos(pagination.currentPage);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // Manejar cambio en el input de búsqueda
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Limpiar búsqueda
    const clearSearch = () => {
        setSearchTerm('');
        setIsSearching(false);
        loadProductos(pagination.currentPage);
    };

    // Manejar selección de productos
    const handleSelectProduct = (productId) => {
        setSelectedIds(prev => 
            prev.includes(productId) 
                ? prev.filter(id => id !== productId) 
                : [...prev, productId]
        );
    };

    // Seleccionar/deseleccionar todos
    const toggleSelectAll = () => {
        if (selectedIds.length === productos.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(productos.map(p => p.id));
        }
    };

    // Generar documento con los IDs seleccionados
    const generarDocumento = async () => {
        if (selectedIds.length === 0) {
            setError('Selecciona al menos un producto');
            return;
        }
    
        setDocumentGenerating(true);
        setError('');
        setSuccess('');
        
        try {
            const response = await fetch(`${BASE_URL_API}/api/generar-documento-qrs-imprimir/productos-seleccionados`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ids_productos: selectedIds
                })
            });
        
            if (!response.ok) {
                throw new Error('Error al generar el documento');
            }
        
            // Descargar el archivo
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'qrs_seleccionados.docx';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        
            setSuccess('Documento generado correctamente');
        } catch (error) {
            setError(error.message);
        } finally {
            setDocumentGenerating(false);
        }
    };

    return (
        <div className={styles.contenedor_total_administrador} style={{flexDirection: 'column'}}>
            <h2 className='mt-4 mb-3'>Generador de Documentos con QRs</h2>
            
            {/* Controles superiores */}
            <div className="d-flex justify-content-between mb-4">
                {/* Buscador */}
                <div style={{width: '60%'}}>
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar producto por nombre..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            aria-label="Buscar producto"
                        />
                        {searchTerm && (
                            <button 
                                className="btn btn-outline-secondary" 
                                type="button"
                                onClick={clearSearch}
                            >
                                Limpiar
                            </button>
                        )}
                    </div>
                    {isSearching && <small className="text-muted">Mostrando resultados para: "{searchTerm}"</small>}
                </div>
                
                {/* Botón de generación */}
                <div className="d-flex align-items-center">
                    <button 
                        className="btn btn-primary"
                        onClick={generarDocumento}
                        disabled={selectedIds.length === 0 || documentGenerating}
                    >
                        {documentGenerating ? 'Generando...' : `Generar Documento (${selectedIds.length})`}
                    </button>
                </div>
            </div>

            {/* Mensajes */}
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            {loading && <div className="text-center">Cargando productos...</div>}

            {/* Tabla de productos */}
            <div className={styles.contenedor_registros}>
                <table className="table table-striped table-responsive align-middle">
                    <thead className="table-dark">
                        <tr>
                            <th style={{width: "50px"}}>
                                <input 
                                    type="checkbox" 
                                    checked={productos.length > 0 && selectedIds.length === productos.length}
                                    onChange={toggleSelectAll}
                                    disabled={productos.length === 0}
                                />
                            </th>
                            <th style={{width: "50px"}}>Código</th>
                            <th style={{width: "150px"}}>Nombre</th>
                            <th style={{width: "80px"}}>Imagen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productos.length === 0 && !loading ? (
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
                                            class="form-check-input mt-0"
                                            aria-label="Checkbox for following text input"
                                            type="checkbox" 
                                            checked={selectedIds.includes(producto.id)}
                                            onChange={() => handleSelectProduct(producto.id)}
                                        />
                                    </td>
                                    <td>{producto.codigo}</td>
                                    <td>{producto.nombre}</td>
                                    <td>
                                        {producto.imagen_1 && (
                                            <img 
                                                src={producto.imagen_1} 
                                                alt={producto.nombre} 
                                                style={{width: '50px', height: '50px', objectFit: 'cover'}}
                                            />
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginación - solo muestra cuando no estamos buscando */}
            {!isSearching && pagination.totalPages > 1 && (
                <div className="d-flex justify-content-center mt-3">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            className={`btn mx-1 ${pagination.currentPage === page ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => loadProductos(page)}
                        >
                            {page}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminGeneradorQRs;