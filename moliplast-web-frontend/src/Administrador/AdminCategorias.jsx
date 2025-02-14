import React, { useState, useEffect, useRef } from 'react';

const BASE_URL_API = "http://127.0.0.1:8000";

const AdminCategorias = () => {
    const fileInputRef = useRef(null);
    const [categorias, setCategorias] = useState([]);
    const [newCategoria, setNewCategoria] = useState({
        nombre: '',
        descripcion: '',
        enlace_imagen: null,
    });
    const [editingCategoria, setEditingCategoria] = useState(null);
    const [imagenPreview, setImagenPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadCategorias();
    }, []);

    const loadCategorias = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${BASE_URL_API}/api/categorias`);
            
            if (response.status === 404) {
                console.log('No hay categorías disponibles');
                setCategorias([]);
                setLoading(false);
                return;
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setCategorias(data);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Error al cargar las categorías. Por favor, intenta nuevamente.');
            setCategorias([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setNewCategoria({ ...newCategoria, [e.target.name]: e.target.value });
    };

    // Reemplaza el bloque del handleSubmit en tu AdminCategoria.jsx
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('nombre', newCategoria.nombre);
        formData.append('descripcion', newCategoria.descripcion);

        // Solo adjuntar la imagen si hay un archivo seleccionado
        if (newCategoria.enlace_imagen) {
            formData.append('enlace_imagen', newCategoria.enlace_imagen);
        }

        try {
            let url, method;
            
            if (editingCategoria) {
                url = `${BASE_URL_API}/api/categorias/${editingCategoria.id}`;
                method = 'POST'; // Laravel acepta `POST` para actualizaciones con archivos
                formData.append('_method', 'PUT'); // Necesario para simular PUT en FormData
            } else {
                url = `${BASE_URL_API}/api/categorias`;
                method = 'POST';
            }
                
            const response = await fetch(url, {
                method: method,
                body: formData,
                headers: {
                    'Accept': 'application/json' // Asegura que se espera una respuesta JSON
                }
            });

            // Verificar primero si la respuesta es JSON válido
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                // Si no es JSON, obtenemos el texto para diagnóstico
                const text = await response.text();
                console.error("Respuesta no JSON recibida:", text);
                throw new Error(`Respuesta no JSON recibida del servidor. Status: ${response.status}`);
            }

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}` + 
                    (data.message ? ` - ${data.message}` : ''));
            }

            console.log(editingCategoria ? 'Categoría actualizada:' : 'Categoría guardada:', data);

            // Limpiar el formulario
            setNewCategoria({ nombre: '', descripcion: '', enlace_imagen: null });
            setImagenPreview('');
            setEditingCategoria(null);

            // Limpia el input de archivo después de guardar
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            setSuccess(editingCategoria ? 'Categoría actualizada exitosamente!' : 'Categoría guardada exitosamente!');
            loadCategorias();
        } catch (error) {
            console.error(editingCategoria ? 'Error actualizando categoría:' : 'Error guardando categoría:', error);
            setError(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de eliminar esta categoría?")) {
            setLoading(true);
            setError('');
            
            try {
                const response = await fetch(`${BASE_URL_API}/api/categorias/${id}`, {
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
                
                setSuccess('Categoría eliminada exitosamente!');
                loadCategorias();
            } catch (error) {
                console.error('Error eliminando categoría:', error);
                setError(`Error: ${error.message}`);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleEdit = (categoria) => {
        setEditingCategoria(categoria);
        setError('');
        setSuccess('');
    
        setNewCategoria({
            nombre: categoria.nombre,
            descripcion: categoria.descripcion,
            enlace_imagen: null, // Input de archivo vacío
        });
    
        const imageUrl = categoria.enlace_imagen.startsWith('http') 
            ? categoria.enlace_imagen 
            : `${BASE_URL_API}${categoria.enlace_imagen}`;
    
        setImagenPreview(imageUrl);
    };
    
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewCategoria({ ...newCategoria, [e.target.name]: file });
            
            // Actualizar la previsualización para imágenes
            if (e.target.name === 'enlace_imagen') {
                const reader = new FileReader();
                reader.onload = () => {
                    setImagenPreview(reader.result);
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const handleCancelEdit = () => {
        setEditingCategoria(null); 
        setNewCategoria({ nombre: '', descripcion: '', enlace_imagen: null });
        setImagenPreview('');

        // Limpia el input de archivo después de cancelar
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        setError('');
        setSuccess('');
    };

    return (
        <div>
            <h1>Admin Categorías</h1>
            
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
                <label htmlFor="nombre">Nombre:</label><br />
                <input 
                    type="text" 
                    id="nombre" 
                    name="nombre" 
                    value={newCategoria.nombre} 
                    onChange={handleInputChange} 
                    required 
                    disabled={loading}
                /><br /><br />

                <label htmlFor="descripcion">Descripción:</label><br />
                <textarea 
                    id="descripcion" 
                    name="descripcion" 
                    value={newCategoria.descripcion} 
                    onChange={handleInputChange} 
                    required 
                    disabled={loading}
                    rows="5"
                    cols="50"
                ></textarea><br /><br />

                <label htmlFor="enlace_imagen">Imagen:</label><br />
                <input 
                    type="file" 
                    id="enlace_imagen" 
                    name="enlace_imagen" 
                    onChange={handleFileChange} 
                    required={!editingCategoria}
                    disabled={loading}
                    accept="image/*"
                    ref={fileInputRef}
                />
                <br />
                {imagenPreview && (
                    <div>
                        <p>Imagen actual:</p>
                        <img 
                            src={imagenPreview}
                            alt="Vista previa" 
                            style={{ maxWidth: '200px', maxHeight: '200px' }} 
                        />
                    </div>
                )}<br />

                <button type="submit" disabled={loading}>
                    {loading ? 'Procesando...' : (editingCategoria ? 'Actualizar' : 'Guardar')}
                </button>
                {editingCategoria && (
                    <button 
                        type="button" 
                        onClick={handleCancelEdit}
                        disabled={loading}
                        style={{ marginLeft: '10px' }}
                    >
                        Cancelar Edición
                    </button>
                )}
            </form>

            <h2>Lista de Categorías</h2>
            {loading && <p>Cargando...</p>}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Nombre</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Descripción</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Imagen</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {categorias.length === 0 ? (
                        <tr>
                            <td colSpan="4" style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                                No hay categorías disponibles
                            </td>
                        </tr>
                    ) : (
                        categorias.map((categoria) => (
                            <tr key={categoria.id}>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{categoria.nombre}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    {categoria.descripcion.length > 100 
                                        ? `${categoria.descripcion.substring(0, 100)}...` 
                                        : categoria.descripcion}
                                </td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    {categoria.enlace_imagen ? (
                                        <img 
                                            src={`${BASE_URL_API}${categoria.enlace_imagen}`} 
                                            alt={`Imagen de ${categoria.nombre}`} 
                                            style={{ maxWidth: '100px', maxHeight: '100px' }} 
                                        />
                                    ) : 'No disponible'}
                                </td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    <button 
                                        onClick={() => handleEdit(categoria)} 
                                        disabled={loading}
                                        style={{ marginRight: '5px' }}
                                    >
                                        Editar
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(categoria.id)} 
                                        disabled={loading}
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
    );
};

export default AdminCategorias;