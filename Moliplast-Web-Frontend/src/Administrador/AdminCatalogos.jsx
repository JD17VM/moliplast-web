import React, { useState, useEffect } from 'react';

const AdminCatalogos = () => {
    const [catalogos, setCatalogos] = useState([]);
    const [newCatalogo, setNewCatalogo] = useState({
        nombre: '',
        enlace_documento: null,
        enlace_imagen_portada: null,
    });
    const [editingCatalogo, setEditingCatalogo] = useState(null);
    const [documentoPreview, setDocumentoPreview] = useState('');
    const [imagenPreview, setImagenPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadCatalogos();
    }, []);

    const loadCatalogos = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('http://127.0.0.1:8000/api/catalogos');
            
            if (response.status === 404) {
                console.log('No hay catálogos disponibles');
                setCatalogos([]);
                setLoading(false);
                return;
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setCatalogos(data);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Error al cargar los catálogos. Por favor, intenta nuevamente.');
            setCatalogos([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setNewCatalogo({ ...newCatalogo, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
    
        const formData = new FormData();
        formData.append('nombre', newCatalogo.nombre);
        formData.append('enlace_documento', newCatalogo.enlace_documento);
        formData.append('enlace_imagen_portada', newCatalogo.enlace_imagen_portada);
    
        try {
            const url = editingCatalogo 
                ? `http://127.0.0.1:8000/api/catalogos/${editingCatalogo.id}` 
                : 'http://127.0.0.1:8000/api/catalogos';
                
            const response = await fetch(url, {
                method: editingCatalogo ? 'PUT' : 'POST',
                body: formData,
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json();
            console.log(editingCatalogo ? 'Catálogo actualizado:' : 'Catálogo guardado:', data);
    
            // Limpiar el formulario
            setNewCatalogo({ nombre: '', enlace_documento: null, enlace_imagen_portada: null });
            setDocumentoPreview('');
            setImagenPreview('');
            setEditingCatalogo(null);
    
            setSuccess(editingCatalogo ? 'Catálogo actualizado exitosamente!' : 'Catálogo guardado exitosamente!');
            loadCatalogos();
        } catch (error) {
            console.error(editingCatalogo ? 'Error actualizando catálogo:' : 'Error guardando catálogo:', error);
            setError(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de eliminar este catálogo?")) {
            setLoading(true);
            setError('');
            
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/catalogos/${id}`, {
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
                
                setSuccess('Catálogo eliminado exitosamente!');
                loadCatalogos();
            } catch (error) {
                console.error('Error eliminando catálogo:', error);
                setError(`Error: ${error.message}`);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleEdit = (catalogo) => {
        setEditingCatalogo(catalogo);
        setError('');
        setSuccess('');
        
        // Al editar, guardamos las URLs originales para mostrarlas, pero no establecemos archivos
        setNewCatalogo({
            nombre: catalogo.nombre,
            enlace_documento: null,
            enlace_imagen_portada: null
        });
        
        // Guardamos las URLs originales para mostrar previews
        setDocumentoPreview(catalogo.enlace_documento);
        setImagenPreview(catalogo.enlace_imagen_portada);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewCatalogo({ ...newCatalogo, [e.target.name]: file });
            
            // Actualizar la previsualización para imágenes
            if (e.target.name === 'enlace_imagen_portada') {
                const reader = new FileReader();
                reader.onload = () => {
                    setImagenPreview(reader.result);
                };
                reader.readAsDataURL(file);
            } else if (e.target.name === 'enlace_documento') {
                // Para documentos solo mostramos el nombre
                setDocumentoPreview(file.name);
            }
        }
    };

    const handleCancelEdit = () => {
        setEditingCatalogo(null); 
        setNewCatalogo({ nombre: '', enlace_documento: null, enlace_imagen_portada: null });
        setDocumentoPreview('');
        setImagenPreview('');
        setError('');
        setSuccess('');
    };

    return (
        <div>
            <h1>Admin Catálogos</h1>
            
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
                    value={newCatalogo.nombre} 
                    onChange={handleInputChange} 
                    required 
                    disabled={loading}
                /><br /><br />

                <label htmlFor="enlace_documento">Documento:</label><br />
                <input 
                    type="file" 
                    id="enlace_documento" 
                    name="enlace_documento" 
                    onChange={handleFileChange} 
                    required={!editingCatalogo}
                    disabled={loading}
                /><br />
                {documentoPreview && (
                    <div>
                        Documento actual: {typeof documentoPreview === 'string' && documentoPreview.includes('http') ? (
                            <a href={documentoPreview} target="_blank" rel="noopener noreferrer">
                                Ver documento
                            </a>
                        ) : documentoPreview}
                    </div>
                )}<br />

                <label htmlFor="enlace_imagen_portada">Imagen Portada:</label><br />
                <input 
                    type="file" 
                    id="enlace_imagen_portada" 
                    name="enlace_imagen_portada" 
                    onChange={handleFileChange} 
                    required={!editingCatalogo}
                    disabled={loading}
                    accept="image/*"
                /><br />
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
                    {loading ? 'Procesando...' : (editingCatalogo ? 'Actualizar' : 'Guardar')}
                </button>
                {editingCatalogo && (
                    <button 
                        type="button" 
                        onClick={handleCancelEdit}
                        disabled={loading}
                    >
                        Cancelar Edición
                    </button>
                )}
            </form>

            <h2>Lista de Catálogos</h2>
            {loading && <p>Cargando...</p>}
            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Documento</th>
                        <th>Imagen Portada</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {catalogos.length === 0 ? (
                        <tr>
                            <td colSpan="4">No hay catálogos disponibles</td>
                        </tr>
                    ) : (
                        catalogos.map((catalogo) => (
                            <tr key={catalogo.id}>
                                <td>{catalogo.nombre}</td>
                                <td>
                                    {catalogo.enlace_documento ? (
                                        <a href={catalogo.enlace_documento} target="_blank" rel="noopener noreferrer">
                                            Ver documento
                                        </a>
                                    ) : 'No disponible'}
                                </td>
                                <td>
                                    {catalogo.enlace_imagen_portada ? (
                                        <img 
                                            src={`http://127.0.0.1:8000${catalogo.enlace_imagen_portada}`} 
                                            alt={`Portada de ${catalogo.nombre}`} 
                                            style={{ maxWidth: '100px', maxHeight: '100px' }} 
                                        />
                                    ) : 'No disponible'}
                                </td>
                                <td>
                                    <button onClick={() => handleEdit(catalogo)} disabled={loading}>Editar</button>
                                    <button onClick={() => handleDelete(catalogo.id)} disabled={loading}>Eliminar</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AdminCatalogos;