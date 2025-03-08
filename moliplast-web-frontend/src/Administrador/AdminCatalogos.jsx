import React, { useState, useEffect, useRef } from 'react';
import styles from '../assets/styles/estilos_administradores.module.scss'
import { getFullUrl } from "../utils/utils.js"

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

const AdminCatalogos = () => {
    const documentoInputRef = useRef(null);
    const imagenInputRef = useRef(null);
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
            const response = await fetch(`${BASE_URL_API}/api/catalogos`);
            
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
        
        // Solo adjuntar los archivos si han sido seleccionados
        if (newCatalogo.enlace_documento) {
            formData.append('enlace_documento', newCatalogo.enlace_documento);
        }
        
        if (newCatalogo.enlace_imagen_portada) {
            formData.append('enlace_imagen_portada', newCatalogo.enlace_imagen_portada);
        }
    
        try {
            let url, method;
            
            if (editingCatalogo) {
                url = `${BASE_URL_API}/api/catalogos/${editingCatalogo.id}`;
                method = 'POST'; // Laravel acepta `POST` para actualizaciones con archivos
                formData.append('_method', 'PUT'); // Necesario para simular PUT en FormData
            } else {
                url = `${BASE_URL_API}/api/catalogos`;
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
            console.log(editingCatalogo ? 'Catálogo actualizado:' : 'Catálogo guardado:', data);
    
            // Limpiar el formulario
            setNewCatalogo({ nombre: '', enlace_documento: null, enlace_imagen_portada: null });
            setDocumentoPreview('');
            setImagenPreview('');
            setEditingCatalogo(null);
            
            // Limpiar los inputs de archivo
            if (documentoInputRef.current) {
                documentoInputRef.current.value = "";
            }
            if (imagenInputRef.current) {
                imagenInputRef.current.value = "";
            }
    
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
                const response = await fetch(`${BASE_URL_API}/api/catalogos/${id}`, {
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
        const documentoUrl = catalogo.enlace_documento.startsWith('http') 
            ? catalogo.enlace_documento 
            : `${BASE_URL_API}${catalogo.enlace_documento}`;
        
        const imagenUrl = catalogo.enlace_imagen_portada.startsWith('http') 
            ? catalogo.enlace_imagen_portada 
            : `${BASE_URL_API}${catalogo.enlace_imagen_portada}`;
            
        setDocumentoPreview(documentoUrl);
        setImagenPreview(imagenUrl);
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
        
        // Limpiar los inputs de archivo
        if (documentoInputRef.current) {
            documentoInputRef.current.value = "";
        }
        if (imagenInputRef.current) {
            imagenInputRef.current.value = "";
        }
        
        setError('');
        setSuccess('');
    };

    return (
        <>
        <div>
            
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

            <h2 className='mt-4 mb-3'>Administrador Catalogos</h2>

            {loading && <p>Cargando...</p>}
            <div className={styles.contenedor_total_administrador}>
                <div className={styles.contenedor_registros}>
                    <table className="table table-striped table-responsive align-midle">
                        <thead className="table-dark">
                            <tr>
                                <th scope="col" style={{width: "150px"}}>Nombre</th>
                                <th scope="col" style={{width: "80px"}}>Documento</th>
                                <th scope="col" style={{width: "80px"}}>Imagen Portada</th>
                                <th scope="col" style={{width: "60px"}}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {catalogos.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                                        No hay catálogos disponibles
                                    </td>
                                </tr>
                            ) : (
                                catalogos.map((catalogo) => (
                                    <tr key={catalogo.id}>
                                    <td>{catalogo.nombre}</td>
                                    <td>
                                        {catalogo.enlace_documento ? (
                                            <a href={getFullUrl(catalogo.enlace_documento)} target="_blank" rel="noopener noreferrer">
                                                Ver documento
                                            </a>
                                        ) : 'No disponible'}
                                    </td>
                                    <td>
                                        {catalogo.enlace_imagen_portada ? (
                                            <img 
                                                src={getFullUrl(catalogo.enlace_imagen_portada)} 
                                                alt={`Portada de ${catalogo.nombre}`} 
                                            />
                                        ) : 'No disponible'}
                                    </td>
                                    <td>
                                        <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
                                            <button 
                                                onClick={() => handleEdit(catalogo)} 
                                                disabled={loading}
                                                className="btn btn-primary mb-1 w-50"
                                            >
                                                Editar
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(catalogo.id)} 
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
                                    value={newCatalogo.nombre} 
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

                        <div className="col-12 fw-bold">
                        <label className="form-label">Imagen de portada:</label><br />
                            <div className="input-group">
                                <input 
                                    type="file" 
                                    id="enlace_imagen_portada" 
                                    name="enlace_imagen_portada" 
                                    onChange={handleFileChange} 
                                    required={!editingCatalogo}
                                    disabled={loading}
                                    accept="image/*"
                                    ref={imagenInputRef}

                                    className="form-control"
                                    aria-describedby="inputGroupFileAddon04" 
                                    aria-label="Upload"
                                />
                                {imagenPreview && (
                                    <div>
                                        <p>Imagen actual:</p>
                                        <img 
                                            src={imagenPreview} 
                                            alt="Vista previa" 
                                            style={{ maxWidth: '200px', maxHeight: '200px' }} 
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="col-12 fw-bold">
                            <label className="form-label">Documento PDF:</label><br />
                            <div className="input-group">
                                <input 
                                    type="file" 
                                    id="enlace_documento" 
                                    name="enlace_documento" 
                                    onChange={handleFileChange} 
                                    required={!editingCatalogo}
                                    disabled={loading}
                                    accept=".pdf,.doc,.docx"
                                    ref={documentoInputRef}

                                    className="form-control"
                                    aria-describedby="inputGroupFileAddon04" 
                                    aria-label="Upload"
                                />
                                {documentoPreview && (
                                    <div>
                                        Documento actual: {typeof documentoPreview === 'string' && documentoPreview.includes('http') ? (
                                            <a href={documentoPreview} target="_blank" rel="noopener noreferrer">
                                                Ver documento
                                            </a>
                                        ) : documentoPreview}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="col-4 me-3">
                            {editingCatalogo && (
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
                                {loading ? 'Procesando...' : (editingCatalogo ? 'Actualizar' : 'Crear catálogo')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        </>
    );
};

export default AdminCatalogos;