import React, { useState, useEffect, useRef } from 'react';
import styles from '../assets/styles/estilos_administradores.module.scss'
import { getFullUrl } from '../utils/utils';
import { fetchData, deleteResource } from '../utils/api.js';

import { TableData, TableDataActions } from './widgets/Table';

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

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

    const loadServicios = async () => {
        await fetchData(`${BASE_URL_API}/api/servicios`, setServicios, setLoading, setError);
    };

    useEffect(() => {
        loadServicios();
    }, []);

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
        await deleteResource(`${BASE_URL_API}/api/servicios`,id,setLoading,setError,setSuccess,loadServicios);
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
                        {Array.isArray(servicios) && servicios.length > 0 ? (
                            servicios.map((servicio) => (
                                <tr key={servicio.id}>
                                    <TableData>{servicio.titulo}</TableData>
                                    <td>
                                        {servicio.descripcion.length > 100 
                                            ? `${servicio.descripcion.substring(0, 100)}...` 
                                            : servicio.descripcion}
                                    </td>
                                    <TableData image_src={servicio.enlace_imagen}>{servicio.titulo}</TableData>
                                    <TableDataActions item={servicio} handleEdit={handleEdit} handleDelete={handleDelete} loading={loading}/>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center' }}>
                                    {loading ? "Cargando servicios..." : "No hay servicios disponibles"}
                                </td>
                            </tr>
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
                            {loading ? 'Procesando...' : (editingServicio ? 'Actualizar' : 'Crear servicio')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
        </>
    );
};

export default AdminServicios;