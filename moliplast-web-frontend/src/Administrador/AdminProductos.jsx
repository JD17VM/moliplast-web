import React, { useState, useEffect, useRef } from 'react';
import styles from '../assets/styles/estilos_administradores.module.scss'

const BASE_URL_API = "http://127.0.0.1:8000";

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
        perPage: 200, // Puedes ajustar este valor según tus necesidades
    });

    // Cargar datos al iniciar el componente
    useEffect(() => {
        if (!isSearching) {
            loadProductos(pagination.currentPage);
        }
        loadCategorias();
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

    // Cargar categorías con su estructura completa
    const loadCategorias = async () => {
        try {
            const response = await fetch(`${BASE_URL_API}/api/categorias-con-subcategorias`);
            
            if (response.status === 404) {
                console.log('No hay categorías disponibles');
                setCategorias([]);
                return;
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setCategorias(data);
        } catch (error) {
            console.error('Error fetching categorias:', error);
            setCategorias([]);
        }
    };

    // Carga de subcategorías desde la API
    const loadSubcategorias = async (categoriaId) => {
        try {
            const response = await fetch(`${BASE_URL_API}/api/subcategorias?categoria_id=${categoriaId}`);
            
            if (response.status === 404) {
                console.log('No hay subcategorías disponibles');
                setSubcategorias([]);
                return;
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setSubcategorias(data);
        } catch (error) {
            console.error('Error fetching subcategorias:', error);
            setSubcategorias([]);
        }
    };

    // Carga de subsubcategorías desde la API
    const loadSubsubcategorias = async (subcategoriaId) => {
        try {
            const response = await fetch(`${BASE_URL_API}/api/subsubcategorias?subcategoria_id=${subcategoriaId}`);
            
            if (response.status === 404) {
                console.log('No hay subsubcategorías disponibles');
                setSubsubcategorias([]);
                return;
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setSubsubcategorias(data);
        } catch (error) {
            console.error('Error fetching subsubcategorias:', error);
            setSubsubcategorias([]);
        }
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
        
        // Al editar, configuramos la información del producto a editar, sin establecer archivos
        setNewProducto({
            id_categoria: producto.id_categoria || '',
            id_subcategoria: producto.id_subcategoria || '',
            id_subsubcategoria: producto.id_subsubcategoria || '',
            nombre: producto.nombre || '',
            descripcion: producto.descripcion || '',
            imagen_1: null, // No establecemos los archivos directamente
            imagen_2: null,
            imagen_3: null,
            imagen_4: null,
            enlace_ficha_tecnica: null,
            texto_markdown: producto.texto_markdown || '',
            destacados: producto.destacados || false,
            enlace_imagen_qr: null,
            codigo: null,
        });
        
        // Guardamos las URLs originales para mostrar previews
        if (producto.imagen_1) {
            const imagen1Url = producto.imagen_1.startsWith('http') 
                ? producto.imagen_1 
                : `${BASE_URL_API}${producto.imagen_1}`;
            setImagen1Preview(imagen1Url);
        }
        
        if (producto.imagen_2) {
            const imagen2Url = producto.imagen_2.startsWith('http') 
                ? producto.imagen_2 
                : `${BASE_URL_API}${producto.imagen_2}`;
            setImagen2Preview(imagen2Url);
        }
        
        if (producto.imagen_3) {
            const imagen3Url = producto.imagen_3.startsWith('http') 
                ? producto.imagen_3 
                : `${BASE_URL_API}${producto.imagen_3}`;
            setImagen3Preview(imagen3Url);
        }
        
        if (producto.imagen_4) {
            const imagen4Url = producto.imagen_4.startsWith('http') 
                ? producto.imagen_4 
                : `${BASE_URL_API}${producto.imagen_4}`;
            setImagen4Preview(imagen4Url);
        }
        
        if (producto.enlace_ficha_tecnica) {
            const fichaUrl = producto.enlace_ficha_tecnica.startsWith('http') 
                ? producto.enlace_ficha_tecnica 
                : `${BASE_URL_API}${producto.enlace_ficha_tecnica}`;
            setFichaTecnicaPreview(fichaUrl);
        }
        
        if (producto.enlace_imagen_qr) {
            const qrUrl = producto.enlace_imagen_qr.startsWith('http') 
                ? producto.enlace_imagen_qr 
                : `${BASE_URL_API}${producto.enlace_imagen_qr}`;
            setImagenQRPreview(qrUrl);
        }
    };

    // Cancelar la edición
    const handleCancelEdit = () => {
        resetForm();
        setError('');
        setSuccess('');
    };

    // Eliminar un producto
    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de eliminar este producto?")) {
            setLoading(true);
            setError('');
            
            try {
                const response = await fetch(`${BASE_URL_API}/api/productos/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                // Intentar obtener la respuesta incluso si hay un error
                let responseData;
                try {
                    responseData = await response.json();
                } catch (e) {
                    console.error('Error al parsear la respuesta JSON:', e);
                }
                
                if (!response.ok) {
                    if (responseData && responseData.message) {
                        throw new Error(responseData.message);
                    }
                    throw new Error(`Error del servidor: ${response.status}`);
                }
                
                setSuccess('Producto eliminado exitosamente!');
                loadProductos(pagination.currentPage); // Mantener en la misma página después de eliminar
            } catch (error) {
                console.error('Error eliminando producto:', error);
                setError(`Error: ${error.message}`);
            } finally {
                setLoading(false);
            }
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
        return categoria ? categoria.nombre : 'No asignada';
    };

    // Obtener el nombre de la subcategoría por ID
    const getSubcategoriaName = (id) => {
        const subcategoria = subcategorias.find(subcat => subcat.id === id);
        return subcategoria ? subcategoria.nombre : 'No asignada';
    };

    // Obtener el nombre de la subsubcategoría por ID
    const getSubsubcategoriaName = (id) => {
        const subsubcategoria = subsubcategorias.find(subsubcat => subsubcat.id === id);
        return subsubcategoria ? subsubcategoria.nombre : 'No asignada';
    };

    // Función para buscar productos
    const searchProductos = async (query) => {
        if (!query.trim()) return;
        
        setLoading(true);
        setIsSearching(true);
        setError('');
        
        try {
            const response = await fetch(`${BASE_URL_API}/api/products/search?query=${encodeURIComponent(query)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Si necesitamos más información de los productos, podemos hacer una segunda petición
            // con los IDs obtenidos o modificar el endpoint de búsqueda para que devuelva más datos
            if (data.length > 0) {
                const productosCompletos = await Promise.all(
                    data.map(async (item) => {
                        const detailResponse = await fetch(`${BASE_URL_API}/api/productos/${item.id}`);
                        if (detailResponse.ok) {
                            return await detailResponse.json();
                        }
                        return null;
                    })
                );
                
                setProductos(productosCompletos.filter(p => p !== null));
                // Reseteamos la paginación durante la búsqueda
                setPagination({
                    ...pagination,
                    currentPage: 1,
                    totalPages: 1,
                });
            } else {
                setProductos([]);
            }
        } catch (error) {
            console.error('Error searching productos:', error);
            setError('Error al buscar productos. Por favor, intenta nuevamente.');
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
                            <th scope="col" style={{width: "150px"}}>Nombre</th>
                            <th scope="col" style={{width: "150px"}}>Categoría</th>
                            <th scope="col" style={{width: "80px"}}>Imagen</th>
                            <th scope="col" style={{width: "30px"}}>Dest</th>
                            <th scope="col" style={{width: "60px"}}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productos.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ border: '1px solid #ddd', textAlign: 'center' }}>
                                    {isSearching 
                                        ? `No se encontraron productos con el término "${searchTerm}"` 
                                        : 'No hay productos disponibles'}
                                </td>
                            </tr>
                        ) : (
                            productos.map((producto) => (
                                <tr key={producto.id}>
                                <td>{producto.nombre}</td>
                                <td>{producto.id_categoria ? getCategoriaName(producto.id_categoria) : 'No asignada'}</td>
                                <td>
                                    {producto.imagen_1 ? (
                                        <img 
                                            src={producto.imagen_1.startsWith('http') ? producto.imagen_1 : `${BASE_URL_API}${producto.imagen_1}`}
                                            alt={`Imagen de ${producto.nombre}`} 
                                        />
                                    ) : 'No disponible'}
                                </td>
                                <td>{producto.destacados ? '✓' : '✗'}</td>
                                <td>
                                    <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
                                        <button 
                                            onClick={() => handleEdit(producto)} 
                                            disabled={loading}
                                            className="btn btn-primary mb-1 w-50"
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(producto.id)} 
                                            disabled={loading}
                                            className="btn btn-danger w-50"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </td>
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
                <form className="row grid gap-0 row-gap-3 mt-3" onSubmit={handleSubmit} encType="multipart/form-data">
                    
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
                        <div class="form-check">
                            <input 
                                type="checkbox" 
                                id="destacados" 
                                name="destacados" 
                                checked={newProducto.destacados} 
                                onChange={handleInputChange} 
                                disabled={loading}

                                className="form-check-input"
                            />
                            <label class="form-check-label" for="flexCheckDefault">
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
