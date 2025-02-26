import React, { useState, useEffect, useRef } from 'react';

const BASE_URL_API = "http://127.0.0.1:8000";

const AdminProductos = () => {
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
    });
    
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
        loadProductos();
        loadCategorias();
    }, []);


    // Cargar subcategorías cuando se selecciona una categoría
    useEffect(() => {
        if (newProducto.id_categoria) {
            loadSubcategorias(newProducto.id_categoria);
        } else {
            setSubcategorias([]);
            setSubsubcategorias([]);
        }
    }, [newProducto.id_categoria]);

    // Cargar subsubcategorías cuando se selecciona una subcategoría
    useEffect(() => {
        if (newProducto.id_subcategoria) {
            loadSubsubcategorias(newProducto.id_subcategoria);
        } else {
            setSubsubcategorias([]);
        }
    }, [newProducto.id_subcategoria]);

    // Carga de productos desde la API
    const loadProductos = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${BASE_URL_API}/api/productos`);
            
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
            setProductos(data);
        } catch (error) {
            console.error('Error fetching productos:', error);
            setError('Error al cargar los productos. Por favor, intenta nuevamente.');
            setProductos([]);
        } finally {
            setLoading(false);
        }
    };

    // Carga de categorías desde la API
    const loadCategorias = async () => {
        try {
            const response = await fetch(`${BASE_URL_API}/api/categorias`);
            
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
            loadProductos();
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
                loadProductos();
            } catch (error) {
                console.error('Error eliminando producto:', error);
                setError(`Error: ${error.message}`);
            } finally {
                setLoading(false);
            }
        }
    };

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

    return (
        <div>
            <h1>Admin Productos</h1>
            
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

            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="nombre">Nombre:</label><br />
                    <input 
                        type="text" 
                        id="nombre" 
                        name="nombre" 
                        value={newProducto.nombre} 
                        onChange={handleInputChange} 
                        required 
                        disabled={loading}
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="descripcion">Descripción:</label><br />
                    <textarea 
                        id="descripcion" 
                        name="descripcion" 
                        value={newProducto.descripcion || ''} 
                        onChange={handleInputChange} 
                        disabled={loading}
                        style={{ width: '100%', padding: '8px', minHeight: '100px' }}
                    />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="id_categoria">Categoría:</label><br />
                    <select 
                        id="id_categoria" 
                        name="id_categoria" 
                        value={newProducto.id_categoria} 
                        onChange={handleInputChange} 
                        disabled={loading}
                        style={{ width: '100%', padding: '8px' }}
                    >
                        <option value="">Seleccione una categoría</option>
                        {categorias.map(categoria => (
                            <option key={categoria.id} value={categoria.id}>
                                {categoria.nombre}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="id_subcategoria">Subcategoría:</label><br />
                    <select 
                        id="id_subcategoria" 
                        name="id_subcategoria" 
                        value={newProducto.id_subcategoria} 
                        onChange={handleInputChange} 
                        disabled={loading || !newProducto.id_categoria}
                        style={{ width: '100%', padding: '8px' }}
                    >
                        <option value="">Seleccione una subcategoría</option>
                        {subcategorias.map(subcategoria => (
                            <option key={subcategoria.id} value={subcategoria.id}>
                                {subcategoria.nombre}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="id_subsubcategoria">Subsubcategoría:</label><br />
                    <select 
                        id="id_subsubcategoria" 
                        name="id_subsubcategoria" 
                        value={newProducto.id_subsubcategoria} 
                        onChange={handleInputChange} 
                        disabled={loading || !newProducto.id_subcategoria}
                        style={{ width: '100%', padding: '8px' }}
                    >
                        <option value="">Seleccione una subsubcategoría</option>
                        {subsubcategorias.map(subsubcategoria => (
                            <option key={subsubcategoria.id} value={subsubcategoria.id}>
                                {subsubcategoria.nombre}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="destacados">Destacado:</label>
                    <input 
                        type="checkbox" 
                        id="destacados" 
                        name="destacados" 
                        checked={newProducto.destacados} 
                        onChange={handleInputChange} 
                        disabled={loading}
                        style={{ marginLeft: '10px' }}
                    />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="imagen_1">Imagen Principal:</label><br />
                    <input 
                        type="file" 
                        id="imagen_1" 
                        name="imagen_1" 
                        onChange={handleFileChange} 
                        required={!editingProducto}
                        disabled={loading}
                        accept="image/*"
                        ref={imagen1InputRef}
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
                
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="imagen_2">Imagen 2 (opcional):</label><br />
                    <input 
                        type="file" 
                        id="imagen_2" 
                        name="imagen_2" 
                        onChange={handleFileChange} 
                        disabled={loading}
                        accept="image/*"
                        ref={imagen2InputRef}
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
                
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="imagen_3">Imagen 3 (opcional):</label><br />
                    <input 
                        type="file" 
                        id="imagen_3" 
                        name="imagen_3" 
                        onChange={handleFileChange} 
                        disabled={loading}
                        accept="image/*"
                        ref={imagen3InputRef}
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
                
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="imagen_4">Imagen 4 (opcional):</label><br />
                    <input 
                        type="file" 
                        id="imagen_4" 
                        name="imagen_4" 
                        onChange={handleFileChange} 
                        disabled={loading}
                        accept="image/*"
                        ref={imagen4InputRef}
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
                
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="enlace_imagen_qr">Imagen QR:</label><br />
                    <input 
                        type="file" 
                        id="enlace_imagen_qr" 
                        name="enlace_imagen_qr" 
                        onChange={handleFileChange} 
                        required={!editingProducto}
                        disabled={loading}
                        accept="image/*"
                        ref={imagenQRInputRef}
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
                
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="enlace_ficha_tecnica">Ficha Técnica (opcional):</label><br />
                    <input 
                        type="file" 
                        id="enlace_ficha_tecnica" 
                        name="enlace_ficha_tecnica" 
                        onChange={handleFileChange} 
                        disabled={loading}
                        accept=".pdf,.doc,.docx"
                        ref={fichaTecnicaInputRef}
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
                
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="texto_markdown">Texto Markdown (opcional):</label><br />
                    <textarea 
                        id="texto_markdown" 
                        name="texto_markdown" 
                        value={newProducto.texto_markdown || ''} 
                        onChange={handleInputChange} 
                        disabled={loading}
                        style={{ width: '100%', padding: '8px', minHeight: '150px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ 
                            padding: '10px 15px', 
                            backgroundColor: '#4CAF50', 
                            color: 'white', 
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Procesando...' : (editingProducto ? 'Actualizar' : 'Guardar')}
                    </button>
                    
                    {editingProducto && (
                        <button 
                            type="button" 
                            onClick={handleCancelEdit}
                            disabled={loading}
                            style={{ 
                                marginLeft: '10px',
                                padding: '10px 15px',
                                backgroundColor: '#f44336',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Cancelar Edición
                        </button>
                    )}
                </div>
            </form>

            <h2>Lista de Productos</h2>
            {loading && <p>Cargando...</p>}
            
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Nombre</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Categoría</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Imagen</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Destacado</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productos.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                                    No hay productos disponibles
                                </td>
                            </tr>
                        ) : (
                            productos.map((producto) => (
                                <tr key={producto.id}>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{producto.nombre}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                        {producto.id_categoria ? getCategoriaName(producto.id_categoria) : 'No asignada'}
                                    </td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                        {producto.imagen_1 ? (
                                            <img 
                                                src={producto.imagen_1.startsWith('http') ? producto.imagen_1 : `${BASE_URL_API}${producto.imagen_1}`}
                                                alt={`Imagen de ${producto.nombre}`} 
                                                style={{ maxWidth: '100px', maxHeight: '100px' }} 
                                            />
                                        ) : 'No disponible'}
                                    </td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                                        {producto.destacados ? '✓' : '✗'}
                                    </td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                        <button 
                                            onClick={() => handleEdit(producto)} 
                                            disabled={loading}
                                            style={{ 
                                                marginRight: '5px',
                                                padding: '5px 10px',
                                                backgroundColor: '#2196F3',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: loading ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(producto.id)} 
                                            disabled={loading}
                                            style={{ 
                                                padding: '5px 10px',
                                                backgroundColor: '#f44336',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: loading ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminProductos;
