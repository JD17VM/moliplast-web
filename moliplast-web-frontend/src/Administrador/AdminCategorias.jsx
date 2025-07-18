import React, { useState, useEffect, useRef } from 'react';
import styles from '../assets/styles/estilos_administradores.module.scss'
import { getFullUrl } from "../utils/utils.js"
import { fetchData, deleteResource } from '../utils/api.js';

import { TableData, TableDataActions } from './widgets/Table';

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

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

    const loadCategorias = async () => {
        await fetchData(`${BASE_URL_API}/api/categorias`, setCategorias, setLoading, setError);
    };

    useEffect(() => {
        loadCategorias();
    }, []);

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
        await deleteResource(`${BASE_URL_API}/api/categorias`,id,setLoading,setError,setSuccess,loadCategorias);
    };

    // En la sección de edición de categoría
    const handleEdit = (categoria) => {
        setEditingCategoria(categoria);
        setError('');
        setSuccess('');

        setNewCategoria({
            nombre: categoria.nombre,
            descripcion: categoria.descripcion || '', // Manejo de descripción nula
            enlace_imagen: null, // Input de archivo vacío
        });

        // Verificar si existe enlace_imagen antes de procesar
        const imageUrl = categoria.enlace_imagen ? (
            categoria.enlace_imagen.startsWith('http') 
                ? categoria.enlace_imagen 
                : `${BASE_URL_API}${categoria.enlace_imagen}`
        ) : '';

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
        <h2 className='mt-4 mb-3'>Administrador Categorías</h2>
        <a href='/Lato.zip' style={{marginBottom: '20px', display: 'block', textDecoration: 'Underline'}}>Descargar fuente de letra Moliplast para generar Catalogo</a>

        {loading && <p>Cargando...</p>}
        <div className={styles.contenedor_total_administrador}>
            <div className={styles.contenedor_registros}>
                <table className="table table-striped table-responsive align-midle">
                    <thead className="table-dark">
                        <tr>
                            <th scope="col" style={{width: "150px"}}>Nombre</th>
                            <th scope="col" style={{width: "150px"}}>Descripción</th>
                            <th scope="col" style={{width: "80px"}}>Imagen</th>
                            <th scope="col" style={{width: "60px"}}>Acciones</th>
                            <th scope="col" style={{width: "60px"}}>Doc QRs</th>
                            <th scope="col" style={{width: "60px"}}>Catálogo</th>
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
                                    <TableData>{categoria.nombre}</TableData>
                                    <td>
                                    {categoria.descripcion && categoria.descripcion.length > 100
                                            ? `${categoria.descripcion.substring(0, 100)}...`
                                            : categoria.descripcion}
                                    </td>
                                    <TableData image_src={categoria.enlace_imagen}>{categoria.nombre}</TableData>
                                    <TableDataActions item={categoria} handleEdit={handleEdit} handleDelete={handleDelete} loading={loading}/>
                                    <TableData><a href={`#`}>Generar doc QRs</a></TableData>
                                    <TableData><a href={`https://www.moliplast.com/api/api/generar-documento-catalogo/categoria/${categoria.id}`}>Generar Catalogo</a></TableData>
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
                                value={newCategoria.nombre} 
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
                            value={newCategoria.descripcion} 
                            onChange={handleInputChange} 
                            disabled={loading}
                            rows="4"
                            cols="50"

                            className="form-control"
                        ></textarea>
                    </div>

                    <div className="col-12">
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
                        {editingCategoria && (
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
                            {loading ? 'Procesando...' : (editingCategoria ? 'Actualizar' : 'Crear categoría')}
                        </button>
                    </div>
                </form>
                
            </div>
        </div>
        </>
    );
};

export default AdminCategorias;