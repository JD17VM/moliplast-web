import React, { useState, useEffect, useRef } from 'react';
import styles from '../assets/styles/estilos_administradores.module.scss'
import { fetchData, deleteResource } from '../utils/api.js';

import { TableData, TableDataActions } from './widgets/Table';

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

const AdminProductos = () => {
    // Estado para el buscador
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [subcategorias, setSubcategorias] = useState([]);
    const [subsubcategorias, setSubsubcategorias] = useState([]);
    const [newProducto, setNewProducto] = useState({
        id_categoria: '',
        id_subcategoria: '',
        id_subsubcategoria: '',
        nombre: '',
        descripcion: '',
        imagen_1: '',
        imagen_2: '',
        imagen_3: '',
        imagen_4: '',
        enlace_ficha_tecnica: '',
        texto_markdown: '',
        destacados: false,
        enlace_imagen_qr: '',
        codigo: '',
    });
    
    // Estado para la paginación
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        perPage: 50, // Puedes ajustar este valor según tus necesidades
    });

    // Estado para controlar el tiempo entre solicitudes
    const [requestInProgress, setRequestInProgress] = useState(false);
    const lastRequestTimeRef = useRef(0);
    const requestQueueRef = useRef([]);
    const searchTimeoutRef = useRef(null);

    // Cargar datos al iniciar el componente
    useEffect(() => {
        if (!isSearching) {
            loadProductos(pagination.currentPage);
        }
        loadCategorias();
        
        // Limpieza del timeout al desmontar
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [isSearching]);
    
    const [editingProducto, setEditingProducto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const fichaTecnicaInputRef = useRef(null);
    const imagen1InputRef = useRef(null);
    const imagen2InputRef = useRef(null);
    const imagen3InputRef = useRef(null);
    const imagen4InputRef = useRef(null);
    const imagenQRInputRef = useRef(null);
    
    const [imagen1Preview, setImagen1Preview] = useState('');
    const [imagen2Preview, setImagen2Preview] = useState('');
    const [imagen3Preview, setImagen3Preview] = useState('');
    const [imagen4Preview, setImagen4Preview] = useState('');
    const [fichaTecnicaPreview, setFichaTecnicaPreview] = useState('');
    const [imagenQRPreview, setImagenQRPreview] = useState('');

    // Cargar datos al iniciar el componente
    useEffect(() => {
        loadProductos(pagination.currentPage);
        loadCategorias();
    }, []);


    // Cargar subcategorías cuando se selecciona una categoría
    useEffect(() => {
        if (newProducto.id_categoria) {
            // Filtrar subcategorías basadas en la categoría seleccionada
            const filteredSubcategorias = categorias
                .find(cat => cat.id === parseInt(newProducto.id_categoria))?.subcategorias || [];
            
            setSubcategorias(filteredSubcategorias);
            
            // Resetear subcategoría y subsubcategoría si cambia la categoría
            setNewProducto(prev => ({
                ...prev, 
                id_subcategoria: '',
                id_subsubcategoria: ''
            }));
            setSubsubcategorias([]);
        } else {
            setSubcategorias([]);
            setSubsubcategorias([]);
        }
    }, [newProducto.id_categoria, categorias]);

    // Cargar subsubcategorías cuando se selecciona una subcategoría
    useEffect(() => {
        if (newProducto.id_subcategoria) {
            // Buscar la subcategoría seleccionada y obtener sus subsubcategorías
            const selectedSubcategoria = subcategorias
                .find(subcat => subcat.id === parseInt(newProducto.id_subcategoria));
            
            const filteredSubsubcategorias = selectedSubcategoria?.subsubcategorias || [];
            
            setSubsubcategorias(filteredSubsubcategorias);
            
            // Resetear subsubcategoría si cambia la subcategoría
            setNewProducto(prev => ({
                ...prev, 
                id_subsubcategoria: ''
            }));
        } else {
            setSubsubcategorias([]);
        }
    }, [newProducto.id_subcategoria, subcategorias]);

    // Carga de productos desde la API con paginación
    const loadProductos = async (page = 1) => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${BASE_URL_API}/api/productos?page=${page}&per_page=${pagination.perPage}`);
            
            if (response.status === 404) {
                console.log('No hay productos disponibles');
                setProductos([]);
                setLoading(false);
                return;
            }
            
            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.errors) {
                    // Si hay errores de validación, mostrarlos
                    setError(`Errores de validación: ${JSON.stringify(errorData.errors)}`);
                } else {
                    setError(`Error: ${errorData.message}`);
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setProductos(data.data); // Accede a los datos paginados
            setPagination({
                ...pagination,
                currentPage: data.current_page,
                totalPages: data.last_page,
            });
        } catch (error) {
            console.error('Error fetching productos:', error);
            setError('Error al cargar los productos. Por favor, intenta nuevamente.');
            setProductos([]);
        } finally {
            setLoading(false);
        }
    };

    // Cambiar de página
    const handlePageChange = (newPage) => {
        loadProductos(newPage);
    };

    const loadCategorias = async () => {
        fetchData(`${BASE_URL_API}/api/categorias-con-subcategorias`,setCategorias,setLoading,setError);
    };

    const loadSubcategorias = async (categoriaId) => {
        fetchData(`${BASE_URL_API}/api/subcategorias?categoria_id=${categoriaId}`,setSubcategorias,setLoading,setError);
    };

    const loadSubsubcategorias = async (subcategoriaId) => {
        fetchData(`${BASE_URL_API}/api/subsubcategorias?subcategoria_id=${subcategoriaId}`,setSubsubcategorias,setLoading,setError);
    };

    // Manejo de cambios en los inputs de texto y select
    const handleInputChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setNewProducto({ ...newProducto, [e.target.name]: value });
    };

    // Manejo de cambios en los inputs de archivo
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewProducto({ ...newProducto, [e.target.name]: file });
            
            // Actualizar la previsualización para imágenes
            const reader = new FileReader();
            reader.onload = () => {
                switch(e.target.name) {
                    case 'imagen_1':
                        setImagen1Preview(reader.result);
                        break;
                    case 'imagen_2':
                        setImagen2Preview(reader.result);
                        break;
                    case 'imagen_3':
                        setImagen3Preview(reader.result);
                        break;
                    case 'imagen_4':
                        setImagen4Preview(reader.result);
                        break;
                    case 'enlace_imagen_qr':
                        setImagenQRPreview(reader.result);
                        break;
                    case 'enlace_ficha_tecnica':
                        // Para documentos solo mostramos el nombre
                        setFichaTecnicaPreview(file.name);
                        break;
                    default:
                        break;
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
    
        const formData = new FormData();
        
        // Agregar todos los campos al FormData
        Object.keys(newProducto).forEach(key => {
            if (newProducto[key] !== null && newProducto[key] !== undefined) {
                if (key === 'destacados') {
                    formData.append(key, newProducto[key] ? 1 : 0);
                } else {
                    formData.append(key, newProducto[key]);
                }
            }
        });
    
        try {
            let url, method;
            
            if (editingProducto) {
                url = `${BASE_URL_API}/api/productos/${editingProducto.id}`;
                method = 'POST'; // Laravel acepta `POST` para actualizaciones con archivos
                formData.append('_method', 'PUT'); // Necesario para simular PUT en FormData
            } else {
                url = `${BASE_URL_API}/api/productos`;
                method = 'POST';
            }
                
            const response = await fetch(url, {
                method: method,
                body: formData,
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}` + 
                    (errorData.message ? ` - ${errorData.message}` : ''));
            }
    
            const data = await response.json();
            console.log(editingProducto ? 'Producto actualizado:' : 'Producto guardado:', data);
    
            // Limpiar el formulario
            resetForm();
            
            setSuccess(editingProducto ? 'Producto actualizado exitosamente!' : 'Producto guardado exitosamente!');
            loadProductos(pagination.currentPage); // Recargar la página actual después de guardar/actualizar
        } catch (error) {
            console.error(editingProducto ? 'Error actualizando producto:' : 'Error guardando producto:', error);
            setError(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Resetear el formulario
    const resetForm = () => {
        setNewProducto({
            id_categoria: '',
            id_subcategoria: '',
            id_subsubcategoria: '',
            nombre: '',
            descripcion: '',
            imagen_1: '',
            imagen_2: '',
            imagen_3: '',
            imagen_4: '',
            enlace_ficha_tecnica: '',
            texto_markdown: '',
            destacados: false,
            enlace_imagen_qr: '',
            codigo: '',
        });
        
        setImagen1Preview('');
        setImagen2Preview('');
        setImagen3Preview('');
        setImagen4Preview('');
        setFichaTecnicaPreview('');
        setImagenQRPreview('');
        setEditingProducto(null);
        
        // Limpiar los inputs de archivo
        if (imagen1InputRef.current) imagen1InputRef.current.value = "";
        if (imagen2InputRef.current) imagen2InputRef.current.value = "";
        if (imagen3InputRef.current) imagen3InputRef.current.value = "";
        if (imagen4InputRef.current) imagen4InputRef.current.value = "";
        if (fichaTecnicaInputRef.current) fichaTecnicaInputRef.current.value = "";
        if (imagenQRInputRef.current) imagenQRInputRef.current.value = "";
    };
    
    // Editar un producto existente
    const handleEdit = (producto) => {
        setEditingProducto(producto);
        setError('');
        setSuccess('');

        // Al editar, configuramos la información del producto a editar.
        // **Importante: No establecer las imágenes a null en newProducto.**
        setNewProducto({
            id_categoria: producto.id_categoria || '',
            id_subcategoria: producto.id_subcategoria || '',
            id_subsubcategoria: producto.id_subsubcategoria || '',
            nombre: producto.nombre || '',
            descripcion: producto.descripcion || '',
            // **Mantén estos campos vacíos ('') para que los inputs file no muestren un valor simulado.**
            imagen_1: '',
            imagen_2: '',
            imagen_3: '',
            imagen_4: '',
            enlace_ficha_tecnica: null,
            texto_markdown: producto.texto_markdown || '',
            destacados: producto.destacados || false,
            enlace_imagen_qr: null,
            codigo: producto.codigo || '',
        });

        // **Carga las URLs de las imágenes existentes para las previsualizaciones.**
        if (producto.imagen_1) {
            const imagen1Url = producto.imagen_1.startsWith('http')
                ? producto.imagen_1
                : `${BASE_URL_API}${producto.imagen_1}`;
            setImagen1Preview(imagen1Url);
        } else {
            setImagen1Preview('');
        }

        if (producto.imagen_2) {
            const imagen2Url = producto.imagen_2.startsWith('http')
                ? producto.imagen_2
                : `${BASE_URL_API}${producto.imagen_2}`;
            setImagen2Preview(imagen2Url);
        } else {
            setImagen2Preview('');
        }

        if (producto.imagen_3) {
            const imagen3Url = producto.imagen_3.startsWith('http')
                ? producto.imagen_3
                : `${BASE_URL_API}${producto.imagen_3}`;
            setImagen3Preview(imagen3Url);
        } else {
            setImagen3Preview('');
        }

        if (producto.imagen_4) {
            const imagen4Url = producto.imagen_4.startsWith('http')
                ? producto.imagen_4
                : `${BASE_URL_API}${producto.imagen_4}`;
            setImagen4Preview(imagen4Url);
        } else {
            setImagen4Preview('');
        }

        if (producto.enlace_ficha_tecnica) {
            const fichaUrl = producto.enlace_ficha_tecnica.startsWith('http')
                ? producto.enlace_ficha_tecnica
                : `${BASE_URL_API}${producto.enlace_ficha_tecnica}`;
            setFichaTecnicaPreview(fichaUrl);
        } else {
            setFichaTecnicaPreview('');
        }

        if (producto.enlace_imagen_qr) {
            const qrUrl = producto.enlace_imagen_qr.startsWith('http')
                ? producto.enlace_imagen_qr
                : `${BASE_URL_API}${producto.enlace_imagen_qr}`;
            setImagenQRPreview(qrUrl);
        } else {
            setImagenQRPreview('');
        }
    };

    // Cancelar la edición
    const handleCancelEdit = () => {
        resetForm();
        setError('');
        setSuccess('');
    };

    const handleDelete = async (id) => {
        await deleteResource(`${BASE_URL_API}/api/productos`,id,setLoading,setError,setSuccess,loadProductos);
    };

    // Función para manejar solicitudes con control de tasa
    const makeRateLimitedRequest = async (url, options = {}) => {
        // Asegurarse de que hay al menos 300ms entre solicitudes
        const now = Date.now();
        const timeSinceLastRequest = now - lastRequestTimeRef.current;
        
        if (timeSinceLastRequest < 300) {
            await new Promise(resolve => setTimeout(resolve, 300 - timeSinceLastRequest));
        }
        
        lastRequestTimeRef.current = Date.now();
        
        try {
            const response = await fetch(url, options);
            
            if (response.status === 429) {
                // Extraer el tiempo de espera del encabezado Retry-After si está disponible
                const retryAfter = response.headers.get('Retry-After');
                const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 2000; // Esperar 2 segundos por defecto
                
                console.log(`Rate limit alcanzado. Esperando ${waitTime}ms antes de reintentar...`);
                
                // Esperar el tiempo indicado
                await new Promise(resolve => setTimeout(resolve, waitTime));
                
                // Reintentar la solicitud
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

    // Efecto para manejar la búsqueda con debounce
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm) {
                searchProductos(searchTerm);
            } else if (isSearching) {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // Obtener el nombre de la categoría por ID
    const getCategoriaName = (id) => {
        const categoria = categorias.find(cat => cat.id === id);
        return categoria ? categoria.nombre : '';
    };

    // Obtener el nombre de la subcategoría por ID
    const getSubcategoriaName = (id) => {
        const subcategoria = subcategorias.find(subcat => subcat.id === id);
        return subcategoria ? subcategoria.nombre : '';
    };

    // Obtener el nombre de la subsubcategoría por ID
    const getSubsubcategoriaName = (id) => {
        const subsubcategoria = subsubcategorias.find(subsubcat => subsubcat.id === id);
        return subsubcategoria ? subsubcategoria.nombre : '';
    };

    // Función mejorada para buscar productos
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
    
            // Reseteamos la paginación durante la búsqueda
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

    // Función para manejar el cambio en el input de búsqueda
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Función para limpiar la búsqueda
    const clearSearch = () => {
        setSearchTerm('');
        setIsSearching(false);
    };

    const [selectedRowId, setSelectedRowId] = useState(null);

    const handleEditarFilaEstilo = (idFila, item) => {

        window.scrollTo({ top: 0, behavior: 'smooth' });
        setSelectedRowId(prevId => (prevId === idFila ? null : idFila));
    };

    return (
        <>
        {error && (
            <div style={{ background: '#ffebee', color: '#c62828', padding: '10px', marginBottom: '15px', borderRadius: '4px' }}>
                {error}
            </div>
        )}      
        {success && (
            <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '10px', marginBottom: '15px', borderRadius: '4px' }}>
                {success}
            </div>
        )}
        <h2 className='mt-4 mb-3'>Administrador Productos</h2>
        {/* Buscador de productos */}
        <div className="mb-4">
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

        {loading && <p>Cargando...</p>}
        <div className={styles.contenedor_total_administrador}>
        <div className={styles.contenedor_registros}>
                <table className="table table-striped table-responsive align-midle">
                    <thead className="table-dark">
                        <tr>
                            <th scope="col" style={{width: "50px"}}>Código</th>
                            <th scope="col" style={{width: "150px"}}>Nombre</th>
                            <th scope="col" style={{width: "50px"}}>Categoría</th>
                            <th scope="col" style={{width: "80px"}}>Imagen</th>
                            <th scope="col" style={{width: "10px"}}>Dest</th>
                            <th scope="col" style={{width: "50px"}}>Acciones</th>
                            <th scope="col" style={{width: "80px"}}>QR</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productos.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ border: '1px solid #ddd', textAlign: 'center' }}>
                                    {isSearching 
                                        ? `No se encontraron productos con el término "${searchTerm}"` 
                                        : 'No hay productos disponibles'}
                                </td>
                            </tr>
                        ) : (
                            productos.map((producto) => (
                            <tr key={producto.id} className={selectedRowId === producto.id ? styles.selected : ''}> {/* Aplica la clase condicionalmente */}
                                <TableData>{producto.codigo}</TableData>
                                <TableData link_to={`/productos/producto/${producto.id}`}>{producto.nombre}</TableData>
                                <TableData list={[
                                    producto.id_categoria ? getCategoriaName(producto.id_categoria) : 'No asignada',
                                    producto.id_subcategoria ? getSubcategoriaName(producto.id_subcategoria) : '',
                                    producto.id_subsubcategoria ? getSubsubcategoriaName(producto.id_subsubcategoria) : '',
                                ]}/>
                                <TableData image_src={producto.imagen_1}>{producto.nombre}</TableData>
                                <TableData>{producto.destacados ? '✓' : '✗'}</TableData>
                                <TableDataActions item={producto} handleEdit={handleEdit} handleDelete={handleDelete} loading={loading} handleEditarFila={handleEditarFilaEstilo} />
                                <TableData image_src={producto.enlace_imagen_qr}>{producto.nombre}</TableData>
                            </tr>
                            ))
                        )}
                        </tbody>
                </table>
                
                {/* Componente de paginación (solo se muestra cuando no estamos buscando) */}
                {!isSearching && pagination.totalPages > 1 && (
                    <div className="pagination d-flex justify-content-center my-4">
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`btn ${pagination.currentPage === page ? 'btn-primary' : 'btn-outline-primary'} mx-1`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <div className={styles.contenedor_formulario}>
                <form className="row grid gap-0 row-gap-3 my-3" onSubmit={handleSubmit} encType="multipart/form-data">
                    
                    <h3 className="mt-3">Información</h3>

                    <div className="col-12">
                        <div className="input-group">
                            <span className="input-group-text" id="basic-addon1">Nombre</span>
                            <input 
                                type="text" 
                                id="nombre" 
                                name="nombre"
                                value={newProducto.nombre} 
                                onChange={handleInputChange} 
                                required 
                                disabled={loading}

                                className="form-control"
                                placeholder="Username" 
                                aria-label="Username" 
                                aria-describedby="basic-addon1"
                            />
                        </div>
                    </div>

                    <div className="col-12">
                        <div className="input-group">
                            <span className="input-group-text" id="basic-addon1">Codigo</span>
                            <input 
                                id="codigo" 
                                name="codigo" 
                                value={newProducto.codigo || ''} 
                                onChange={handleInputChange} 
                                disabled={loading}

                                className="form-control"
                                placeholder="Username"
                                aria-label="Username" 
                                aria-describedby="basic-addon1"
                            />
                        </div>
                    </div>

                    <div className="col-12 fw-bold">
                        <label className="form-label">Descripción</label>
                        <textarea 
                            id="descripcion" 
                            name="descripcion" 
                            value={newProducto.descripcion || ''} 
                            onChange={handleInputChange} 
                            disabled={loading}

                            className="form-control"
                            rows="4"
                        />
                    </div>    

                    <h3 className="mt-3">Imágenes</h3>
                    
                    <div className="col-6">
                        <div className="input-group">
                            <input 
                                type="file" 
                                id="imagen_1" 
                                name="imagen_1" 
                                onChange={handleFileChange} 
                                disabled={loading}
                                accept="image/*"
                                ref={imagen1InputRef}

                                className="form-control"
                                aria-describedby="inputGroupFileAddon04" 
                                aria-label="Upload"
                            />
                            {imagen1Preview && (
                                <div>
                                    <p>Imagen actual:</p>
                                    <img 
                                        src={imagen1Preview} 
                                        alt="Vista previa imagen 1" 
                                        style={{ maxWidth: '200px', maxHeight: '200px', marginTop: '10px' }} 
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-6">
                        <div className="input-group">
                            <input 
                                type="file" 
                                id="imagen_2" 
                                name="imagen_2" 
                                onChange={handleFileChange} 
                                disabled={loading}
                                accept="image/*"
                                ref={imagen2InputRef}

                                className="form-control"
                                aria-describedby="inputGroupFileAddon04" 
                                aria-label="Upload"
                            />
                            {imagen2Preview && (
                                <div>
                                    <p>Imagen actual:</p>
                                    <img 
                                        src={imagen2Preview} 
                                        alt="Vista previa imagen 2" 
                                        style={{ maxWidth: '200px', maxHeight: '200px', marginTop: '10px' }} 
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-6">
                        <div className="input-group">
                            <input 
                                type="file" 
                                id="imagen_3" 
                                name="imagen_3" 
                                onChange={handleFileChange} 
                                disabled={loading}
                                accept="image/*"
                                ref={imagen3InputRef}

                                className="form-control"
                                aria-describedby="inputGroupFileAddon04" 
                                aria-label="Upload"
                            />
                            {imagen3Preview && (
                                <div>
                                    <p>Imagen actual:</p>
                                    <img 
                                        src={imagen3Preview} 
                                        alt="Vista previa imagen 3" 
                                        style={{ maxWidth: '200px', maxHeight: '200px', marginTop: '10px' }} 
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-6">
                        <div className="input-group">
                            <input 
                                type="file" 
                                id="imagen_4" 
                                name="imagen_4" 
                                onChange={handleFileChange} 
                                disabled={loading}
                                accept="image/*"
                                ref={imagen4InputRef}

                                className="form-control"
                                aria-describedby="inputGroupFileAddon04" 
                                aria-label="Upload"
                            />
                            {imagen4Preview && (
                                <div>
                                    <p>Imagen actual:</p>
                                    <img 
                                        src={imagen4Preview} 
                                        alt="Vista previa imagen 4" 
                                        style={{ maxWidth: '200px', maxHeight: '200px', marginTop: '10px' }} 
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <h3 className="mt-3">Sección</h3>

                    <div className="col-12">
                        <div className="input-group">
                            <label className="input-group-text">Categoria</label>
                            <select 
                                id="id_categoria" 
                                name="id_categoria" 
                                value={newProducto.id_categoria} 
                                onChange={handleInputChange} 
                                disabled={loading}

                                className="form-select"
                            >
                                <option value="">Seleccione una categoría</option>
                                {categorias.map(categoria => (
                                    <option key={categoria.id} value={categoria.id}>
                                        {categoria.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="col-12">
                        <div className="input-group">
                            <label className="input-group-text" >Subcategoria</label>
                            <select 
                                id="id_subcategoria" 
                                name="id_subcategoria" 
                                value={newProducto.id_subcategoria} 
                                onChange={handleInputChange} 
                                disabled={loading || !newProducto.id_categoria}

                                className="form-select"
                            >
                                <option value="">Seleccione una subcategoría</option>
                                {subcategorias.map(subcategoria => (
                                    <option key={subcategoria.id} value={subcategoria.id}>
                                        {subcategoria.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="col-12">
                        <div className="input-group">
                            <label className="input-group-text" >Subsubcategoria</label>

                            <select 
                            id="id_subsubcategoria" 
                            name="id_subsubcategoria" 
                            value={newProducto.id_subsubcategoria} 
                            onChange={handleInputChange} 
                            disabled={loading || !newProducto.id_subcategoria}

                            className="form-select"
                        >
                            <option value="">Seleccione una subsubcategoría</option>
                            {subsubcategorias.map(subsubcategoria => (
                                <option key={subsubcategoria.id} value={subsubcategoria.id}>
                                    {subsubcategoria.nombre}
                                </option>
                            ))}
                        </select>
                        </div>
                    </div>

                    <h3 className="mt-3">Extras</h3>

                    <div className="col-12 fw-bold">
                        <label className="form-label">Ficha técnica</label><br />
                        <div className="input-group">
                            <input 
                                type="file" 
                                id="enlace_ficha_tecnica" 
                                name="enlace_ficha_tecnica" 
                                onChange={handleFileChange} 
                                disabled={loading}
                                accept=".pdf,.doc,.docx"
                                ref={fichaTecnicaInputRef}

                                className="form-control"
                                aria-describedby="inputGroupFileAddon04" 
                                aria-label="Upload"
                            />
                            {fichaTecnicaPreview && (
                                <div>
                                    Documento actual: {typeof fichaTecnicaPreview === 'string' && fichaTecnicaPreview.includes('http') ? (
                                        <a href={fichaTecnicaPreview} target="_blank" rel="noopener noreferrer">
                                            Ver ficha técnica
                                        </a>
                                    ) : fichaTecnicaPreview}
                                </div>
                            )}
                        </div>
                    </div>


                    <div className="col-12" style={{display:"none"}}>
                        <div className="input-group">
                            <input 
                                type="file" 
                                id="enlace_imagen_qr" 
                                name="enlace_imagen_qr" 
                                onChange={handleFileChange} 
                                disabled={loading}
                                accept="image/*"
                                ref={imagenQRInputRef}

                                className="form-control"
                                aria-describedby="inputGroupFileAddon04" 
                                aria-label="Upload"
                            />
                            {imagenQRPreview && (
                                <div>
                                    <p>Imagen actual:</p>
                                    <img 
                                        src={imagenQRPreview} 
                                        alt="Vista previa QR" 
                                        style={{ maxWidth: '200px', maxHeight: '200px', marginTop: '10px' }} 
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-12 fw-bold">
                        <label className="form-label">Texto Markdown (opcional):</label><br />
                        <textarea 
                            id="texto_markdown" 
                            name="texto_markdown" 
                            value={newProducto.texto_markdown || ''} 
                            onChange={handleInputChange} 
                            disabled={loading}

                            className="form-control"
                            rows="6"
                        />
                    </div>

                    <div className="col-3">
                        <div className="form-check">
                            <input 
                                type="checkbox" 
                                id="destacados" 
                                name="destacados" 
                                checked={newProducto.destacados} 
                                onChange={handleInputChange} 
                                disabled={loading}

                                className="form-check-input"
                            />
                            <label className="form-check-label" for="flexCheckDefault">
                                Destacado
                            </label>
                        </div>
                    </div>


                    <div className="col-4 me-3">
                        {editingProducto && (
                            <button 
                                type="button" 
                                onClick={handleCancelEdit}
                                disabled={loading}
                                className="btn btn-danger w-100 "
                            >
                                Cancelar Edición
                            </button>
                        )}
                    </div>

                    <div className="col-4">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="btn btn-primary w-100"
                        >
                            {loading ? 'Procesando...' : (editingProducto ? 'Actualizar' : 'Crear producto')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
        </>
    );
};

export default AdminProductos;