import React, { useState, useEffect } from 'react';
import styles from '../assets/styles/estilos_administradores.module.scss'
import { fetchData, deleteResource } from '../utils/api.js';

import { TableData, TableDataActions } from './widgets/Table';

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

const AdminSubsubcategorias = () => {
    const [subsubcategorias, setSubsubcategorias] = useState([]);
    const [subcategorias, setSubcategorias] = useState([]);
    const [newSubsubcategoria, setNewSubsubcategoria] = useState({
        nombre: '',
        id_subcategoria: '',
    });
    const [editingSubsubcategoria, setEditingSubsubcategoria] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadSubsubcategorias = async () => {
        await fetchData(`${BASE_URL_API}/api/subsubcategorias`, setSubsubcategorias, setLoading, setError);
    };

    const loadSubcategorias = async () => {
        await fetchData(`${BASE_URL_API}/api/subcategorias`, setSubcategorias, setLoading, setError);
    };

    useEffect(() => {
        loadSubsubcategorias();
        loadSubcategorias();
    }, []);

    const handleInputChange = (e) => {
        setNewSubsubcategoria({ ...newSubsubcategoria, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            let url, method;
            
            if (editingSubsubcategoria) {
                url = `${BASE_URL_API}/api/subsubcategorias/${editingSubsubcategoria.id}`;
                method = 'PUT';
            } else {
                url = `${BASE_URL_API}/api/subsubcategorias`;
                method = 'POST';
            }
                
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(newSubsubcategoria)
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

            console.log(editingSubsubcategoria ? 'Subsubcategoría actualizada:' : 'Subsubcategoría guardada:', data);

            // Limpiar el formulario
            setNewSubsubcategoria({ nombre: '', id_subcategoria: '' });
            setEditingSubsubcategoria(null);

            setSuccess(editingSubsubcategoria ? 'Subsubcategoría actualizada exitosamente!' : 'Subsubcategoría guardada exitosamente!');
            loadSubsubcategorias();
        } catch (error) {
            console.error(editingSubsubcategoria ? 'Error actualizando subsubcategoría:' : 'Error guardando subsubcategoría:', error);
            setError(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    const handleDelete = async (id) => {
        await deleteResource(`${BASE_URL_API}/api/subsubcategorias`,id,setLoading,setError,setSuccess,loadSubsubcategorias);
    };

    const handleEdit = (subsubcategoria) => {
        setEditingSubsubcategoria(subsubcategoria);
        setError('');
        setSuccess('');
    
        setNewSubsubcategoria({
            nombre: subsubcategoria.nombre,
            id_subcategoria: subsubcategoria.id_subcategoria,
        });
    };

    const handleCancelEdit = () => {
        setEditingSubsubcategoria(null); 
        setNewSubsubcategoria({ nombre: '', id_subcategoria: '' });
        setError('');
        setSuccess('');
    };

    // Función para obtener el nombre de la subcategoría a partir de su ID
    const getSubcategoryName = (subcategoryId) => {
        const subcategory = subcategorias.find(subcat => subcat.id === subcategoryId);
        return subcategory ? subcategory.nombre : 'Desconocida';
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

        <h2 className='mt-4 mb-3'>Administrador Subsubcategorías</h2>

        {loading && <p>Cargando...</p>}
        <div className={styles.contenedor_total_administrador}>
            <div className={styles.contenedor_registros}>
                <table className="table table-striped table-responsive align-midle">
                    <thead className="table-dark">
                        <tr>
                            <th scope="col" style={{width: "150px"}}>Nombre</th>
                            <th scope="col" style={{width: "150px"}}>SubCategoría</th>
                            <th scope="col" style={{width: "60px"}}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subsubcategorias.length === 0 ? (
                            <tr>
                                <td colSpan="3" style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                                    No hay subsubcategorías disponibles
                                </td>
                            </tr>
                        ) : (
                            subsubcategorias.map((subsubcategoria) => (
                            <tr key={subsubcategoria.id}>
                                <TableData>{subsubcategoria.nombre}</TableData>
                                <TableData>{getSubcategoryName(subsubcategoria.id_subcategoria)}</TableData>
                                <TableDataActions item={subsubcategoria} handleEdit={handleEdit} handleDelete={handleDelete} loading={loading}/>
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
                            <label className="input-group-text">Subcategoría</label>
                            <select
                                id="id_subcategoria"
                                name="id_subcategoria"
                                value={newSubsubcategoria.id_subcategoria}
                                onChange={handleInputChange}
                                required
                                disabled={loading}

                                className="form-select"
                            >
                                <option value="">Seleccionar subcategoría</option>
                                {subcategorias.map((subcategoria) => (
                                    <option key={subcategoria.id} value={subcategoria.id}>
                                        {subcategoria.nombre}
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
                                value={newSubsubcategoria.nombre} 
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
                        {editingSubsubcategoria && (
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
                            {loading ? 'Procesando...' : (editingSubsubcategoria ? 'Actualizar' : 'Crear subsubcategoría')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
        </>
    );
};

export default AdminSubsubcategorias;