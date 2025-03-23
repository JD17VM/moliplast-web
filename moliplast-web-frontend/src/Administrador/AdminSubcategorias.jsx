import React, { useState, useEffect } from 'react';
import styles from '../assets/styles/estilos_administradores.module.scss'
import { fetchData, deleteResource } from '../utils/api.js';

import { TableData, TableDataActions } from './widgets/Table';

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

const AdminSubcategorias = () => {
    const [subcategorias, setSubcategorias] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [newSubcategoria, setNewSubcategoria] = useState({
        nombre: '',
        id_categoria: '',
    });
    const [editingSubcategoria, setEditingSubcategoria] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadSubcategorias = async () => {
        await fetchData(`${BASE_URL_API}/api/subcategorias`, setSubcategorias, setLoading, setError);
    };

    const loadCategorias = async () => {
        await fetchData(`${BASE_URL_API}/api/categorias`, setCategorias, setLoading, setError);
    };

    useEffect(() => {
        loadSubcategorias();
        loadCategorias();
    }, []);

    const handleInputChange = (e) => {
        setNewSubcategoria({ ...newSubcategoria, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            let url, method;
            
            if (editingSubcategoria) {
                url = `${BASE_URL_API}/api/subcategorias/${editingSubcategoria.id}`;
                method = 'PUT';
            } else {
                url = `${BASE_URL_API}/api/subcategorias`;
                method = 'POST';
            }
                
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(newSubcategoria)
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

            console.log(editingSubcategoria ? 'Subcategoría actualizada:' : 'Subcategoría guardada:', data);

            // Limpiar el formulario
            setNewSubcategoria({ nombre: '', id_categoria: '' });
            setEditingSubcategoria(null);

            setSuccess(editingSubcategoria ? 'Subcategoría actualizada exitosamente!' : 'Subcategoría guardada exitosamente!');
            loadSubcategorias();
        } catch (error) {
            console.error(editingSubcategoria ? 'Error actualizando subcategoría:' : 'Error guardando subcategoría:', error);
            setError(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        await deleteResource(`${BASE_URL_API}/api/subcategorias`,id,setLoading,setError,setSuccess,loadSubcategorias);
    };

    const handleEdit = (subcategoria) => {
        setEditingSubcategoria(subcategoria);
        setError('');
        setSuccess('');
    
        setNewSubcategoria({
            nombre: subcategoria.nombre,
            id_categoria: subcategoria.id_categoria,
        });
    };

    const handleCancelEdit = () => {
        setEditingSubcategoria(null); 
        setNewSubcategoria({ nombre: '', id_categoria: '' });
        setError('');
        setSuccess('');
    };

    // Función para obtener el nombre de la categoría a partir de su ID
    const getCategoryName = (categoryId) => {
        const category = categorias.find(cat => cat.id === categoryId);
        return category ? category.nombre : 'Desconocida';
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
        <h2 className='mt-4 mb-3'>Administrador Subcategorías</h2>

        {loading && <p>Cargando...</p>}
        <div className={styles.contenedor_total_administrador}>
            <div className={styles.contenedor_registros}>
            <table className="table table-striped table-responsive align-midle">
                    <thead className="table-dark">
                        <tr>
                            <th scope="col" style={{width: "150px"}}>Nombre</th>
                            <th scope="col" style={{width: "150px"}}>Categoría</th>
                            <th scope="col" style={{width: "60px"}}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subcategorias.length === 0 ? (
                            <tr>
                                <td colSpan="3" style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                                    No hay subcategorías disponibles
                                </td>
                            </tr>
                        ) : (
                            subcategorias.map((subcategoria) => (
                            <tr key={subcategoria.id}>
                                <TableData>{subcategoria.nombre}</TableData>
                                <TableData>{getCategoryName(subcategoria.id_categoria)}</TableData>
                                <TableDataActions item={subcategoria} handleEdit={handleEdit} handleDelete={handleDelete} loading={loading}/>
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
                            <label className="input-group-text">Categoria</label>
                            <select
                                id="id_categoria"
                                name="id_categoria"
                                value={newSubcategoria.id_categoria}
                                onChange={handleInputChange}
                                required
                                disabled={loading}
                                className="form-select"
                            >
                                <option value="">Seleccionar categoría</option>
                                {categorias.map((categoria) => (
                                    <option key={categoria.id} value={categoria.id}>
                                        {categoria.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="col-12">
                        <div className="input-group">
                            <span className="input-group-text" id="basic-addon1">Nombre</span>

                            <input 
                                type="text" 
                                id="nombre" 
                                name="nombre" 
                                value={newSubcategoria.nombre} 
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

                    <div className="col-4 me-3">
                        {editingSubcategoria && (
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
                        {loading ? 'Procesando...' : (editingSubcategoria ? 'Actualizar' : 'Crear subcategoría')}
                    </button>
                    </div>
                </form>
            </div>
        </div>
        </>
    );
};

export default AdminSubcategorias;