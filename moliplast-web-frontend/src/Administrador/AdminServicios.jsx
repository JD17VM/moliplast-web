import React, { useState, useEffect, useRef } from 'react';
import styles from '../assets/styles/estilos_administradores.module.scss'

const BASE_URL_API = "http://127.0.0.1:8000";

const AdminServicios = () => {
    const fileInputRef = useRef(null);
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
                //Verificar si los campos de titulo y descripcion fueron modificados.
                if(editingServicio.titulo === newServicio.titulo && editingServicio.descripcion === newServicio.descripcion){
                    url = `${BASE_URL_API}/api/servicios/partial/${editingServicio.id}`;
                    method = 'POST';
                    formData.append('_method', 'PUT');
                } else {
                    url = `${BASE_URL_API}/api/servicios/${editingServicio.id}`;
                    method = 'POST';
                    formData.append('_method', 'PUT');
                }
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

            // Limpia el input de archivo después de guardar
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
    
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
    
        const imageUrl = servicio.enlace_imagen && (servicio.enlace_imagen.startsWith('http') 
            ? servicio.enlace_imagen 
            : `${BASE_URL_API}${servicio.enlace_imagen}`);
    
        setImagenPreview(imageUrl || '');
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

        // Limpia el input de archivo después de cancelar
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        setError('');
        setSuccess('');
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

        <h2 className='mt-4 mb-3'>Administrador Servicios</h2>

        {loading && <p>Cargando...</p>}
        <div className={styles.contenedor_total_administrador}>
            <div className={styles.contenedor_registros}>
                <table className="table table-striped table-responsive align-midle">
                    <thead className="table-dark">
                        <tr>
                            <th scope="col" style={{width: "150px"}}>Título</th>
                            <th scope="col" style={{width: "150px"}}>Descripción</th>
                            <th scope="col" style={{width: "80px"}}>Imagen</th>
                            <th scope="col" style={{width: "60px"}}>Acciones</th>
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
                                <td>{servicio.titulo}</td>
                                <td>
                                    {servicio.descripcion.length > 100 
                                        ? `${servicio.descripcion.substring(0, 100)}...` 
                                        : servicio.descripcion}
                                </td>
                                <td>
                                    {servicio.enlace_imagen ? (
                                        <img 
                                            src={servicio.enlace_imagen.startsWith('http')
                                                ? servicio.enlace_imagen
                                                : `${BASE_URL_API}${servicio.enlace_imagen}`} 
                                            alt={`Imagen de ${servicio.titulo}`}
                                            style={{maxWidth: "100px", maxHeight: "100px"}} 
                                        />
                                    ) : 'No disponible'}
                                </td>


                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
                                        <button 
                                            onClick={() => handleEdit(servicio)} 
                                            disabled={loading}
                                            className="btn btn-primary mb-1 w-50"
                                        >
                                            Editar
                                        </button>

                                        <button 
                                            onClick={() => handleDelete(servicio.id)} 
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
                <form className="row grid gap-0 row-gap-3 mt-3" onSubmit={handleSubmit} encType="multipart/form-data">
                    <h3 className="mt-3">Información</h3>

                    <div className="col-12">
                        <div className="input-group">
                            <span className="input-group-text" id="basic-addon1">Nombre</span>
                            <input 
                                type="text" 
                                id="titulo" 
                                name="titulo" 
                                value={newServicio.titulo} 
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
                        <label className="form-label">Descripción</label>
                        <textarea 
                            id="descripcion" 
                            name="descripcion" 
                            value={newServicio.descripcion} 
                            onChange={handleInputChange} 
                            required 
                            disabled={loading}
                            rows="5"
                            cols="50"

                            className="form-control"
                        ></textarea>
                    </div>

                    <div className="col-12 fw-bold">
                        <label className="form-label">Imagen referencial de servicio:</label><br />
                        <div className="input-group">
                            <input 
                                type="file" 
                                id="enlace_imagen" 
                                name="enlace_imagen" 
                                onChange={handleFileChange} 
                                disabled={loading}
                                accept="image/*"
                                ref={fileInputRef}
                                className="form-control"
                                aria-describedby="inputGroupFileAddon04" 
                                aria-label="Upload"
                            />
                        </div>
                        {imagenPreview && (
                            <div className="mt-2">
                                <p>Imagen actual:</p>
                                <img 
                                    src={imagenPreview}
                                    alt="Vista previa" 
                                    style={{ maxWidth: '200px', maxHeight: '200px' }} 
                                />
                            </div>
                        )}
                    </div>
                    
                    <div className="col-4 me-3">
                        {editingServicio && (
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
                            {loading ? 'Procesando...' : (editingServicio ? 'Actualizar' : 'Guardar')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
        </>
    );
};

export default AdminServicios;