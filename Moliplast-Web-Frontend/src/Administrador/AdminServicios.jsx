import React, { useState, useEffect } from 'react';

const BASE_URL_API = "http://127.0.0.1:8000";

const AdminServicios = () => {
    const [servicios, setServicios] = useState([]);
    const [newServicio, setNewServicio] = useState({
        titulo: '',
        descripcion: '',
        enlace_imagen: null,
    });
    const [editingServicio, setEditingServicio] = useState(null);
    const [imagenPreview, setImagenPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadServicios();
    }, []);

    const loadServicios = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${BASE_URL_API}/api/servicios`);
            
            if (response.status === 404) {
                console.log('No hay servicios disponibles');
                setServicios([]);
                setLoading(false);
                return;
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setServicios(data);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Error al cargar los servicios. Por favor, intenta nuevamente.');
            setServicios([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setNewServicio({ ...newServicio, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
    
        const formData = new FormData();
        formData.append('titulo', newServicio.titulo);
        formData.append('descripcion', newServicio.descripcion);
    
        // Solo adjuntar la imagen si hay un archivo seleccionado
        if (newServicio.enlace_imagen) {
            formData.append('enlace_imagen', newServicio.enlace_imagen);
        }
    
        try {
            let url, method;
            
            if (editingServicio) {
                url = `${BASE_URL_API}/api/servicios/${editingServicio.id}`;
                method = 'POST'; // Laravel acepta `POST` para actualizaciones con archivos
                formData.append('_method', 'PUT'); // Necesario para simular PUT en FormData
            } else {
                url = `${BASE_URL_API}/api/servicios`;
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
            console.log(editingServicio ? 'Servicio actualizado:' : 'Servicio guardado:', data);
    
            // Limpiar el formulario
            setNewServicio({ titulo: '', descripcion: '', enlace_imagen: null });
            setImagenPreview('');
            setEditingServicio(null);
    
            setSuccess(editingServicio ? 'Servicio actualizado exitosamente!' : 'Servicio guardado exitosamente!');
            loadServicios();
        } catch (error) {
            console.error(editingServicio ? 'Error actualizando servicio:' : 'Error guardando servicio:', error);
            setError(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    
    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de eliminar este servicio?")) {
            setLoading(true);
            setError('');
            
            try {
                const response = await fetch(`${BASE_URL_API}/api/servicios/${id}`, {
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
                
                setSuccess('Servicio eliminado exitosamente!');
                loadServicios();
            } catch (error) {
                console.error('Error eliminando servicio:', error);
                setError(`Error: ${error.message}`);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleEdit = (servicio) => {
        setEditingServicio(servicio);
        setError('');
        setSuccess('');
    
        setNewServicio({
            titulo: servicio.titulo,
            descripcion: servicio.descripcion,
            enlace_imagen: null, // Input de archivo vacío
        });
    
        const imageUrl = servicio.enlace_imagen.startsWith('http') 
            ? servicio.enlace_imagen 
            : `${BASE_URL_API}${servicio.enlace_imagen}`;
    
        setImagenPreview(imageUrl);
    };
    

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewServicio({ ...newServicio, [e.target.name]: file });
            
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
        setEditingServicio(null); 
        setNewServicio({ titulo: '', descripcion: '', enlace_imagen: null });
        setImagenPreview('');
        setError('');
        setSuccess('');
    };

    return (
        <div>
            <h1>Admin Servicios</h1>
            
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
                <label htmlFor="titulo">Título:</label><br />
                <input 
                    type="text" 
                    id="titulo" 
                    name="titulo" 
                    value={newServicio.titulo} 
                    onChange={handleInputChange} 
                    required 
                    disabled={loading}
                /><br /><br />

                <label htmlFor="descripcion">Descripción:</label><br />
                <textarea 
                    id="descripcion" 
                    name="descripcion" 
                    value={newServicio.descripcion} 
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
                    required={!editingServicio} // Solo requerido en creación
                    disabled={loading}
                    accept="image/*"
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
                    {loading ? 'Procesando...' : (editingServicio ? 'Actualizar' : 'Guardar')}
                </button>
                {editingServicio && (
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

            <h2>Lista de Servicios</h2>
            {loading && <p>Cargando...</p>}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Título</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Descripción</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Imagen</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {servicios.length === 0 ? (
                        <tr>
                            <td colSpan="4" style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                                No hay servicios disponibles
                            </td>
                        </tr>
                    ) : (
                        servicios.map((servicio) => (
                            <tr key={servicio.id}>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{servicio.titulo}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    {servicio.descripcion.length > 100 
                                        ? `${servicio.descripcion.substring(0, 100)}...` 
                                        : servicio.descripcion}
                                </td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    {servicio.enlace_imagen ? (
                                        <img 
                                            src={`${BASE_URL_API}${servicio.enlace_imagen}`} 
                                            alt={`Imagen de ${servicio.titulo}`} 
                                            style={{ maxWidth: '100px', maxHeight: '100px' }} 
                                        />
                                    ) : 'No disponible'}
                                </td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    <button 
                                        onClick={() => handleEdit(servicio)} 
                                        disabled={loading}
                                        style={{ marginRight: '5px' }}
                                    >
                                        Editar
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(servicio.id)} 
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

export default AdminServicios;