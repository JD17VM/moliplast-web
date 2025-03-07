import React, { useState, useEffect } from 'react';
import styles from '../assets/styles/estilos_administradores.module.scss'

const BASE_URL_API = "http://127.0.0.1:8000";

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

    useEffect(() => {
        loadSubsubcategorias();
        loadSubcategorias();
    }, []);

    const loadSubsubcategorias = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${BASE_URL_API}/api/subsubcategorias`);
            
            if (response.status === 404) {
                console.log('No hay subsubcategorías disponibles');
                setSubsubcategorias([]);
                setLoading(false);
                return;
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setSubsubcategorias(data);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Error al cargar las subsubcategorías. Por favor, intenta nuevamente.');
            setSubsubcategorias([]);
        } finally {
            setLoading(false);
        }
    };

    const loadSubcategorias = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${BASE_URL_API}/api/subcategorias`);
            
            if (response.status === 404) {
                console.log('No hay subcategorías disponibles');
                setSubcategorias([]);
                setLoading(false);
                return;
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setSubcategorias(data);
        } catch (error) {
            console.error('Error fetching subcategories:', error);
            setError('Error al cargar las subcategorías. Por favor, intenta nuevamente.');
            setSubcategorias([]);
        } finally {
            setLoading(false);
        }
    };

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
        if (window.confirm("¿Estás seguro de eliminar esta subsubcategoría?")) {
            setLoading(true);
            setError('');
            
            try {
                const response = await fetch(`${BASE_URL_API}/api/subsubcategorias/${id}`, {
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
                
                setSuccess('Subsubcategoría eliminada exitosamente!');
                loadSubsubcategorias();
            } catch (error) {
                console.error('Error eliminando subsubcategoría:', error);
                setError(`Error: ${error.message}`);
            } finally {
                setLoading(false);
            }
        }
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
                                <td>{subsubcategoria.nombre}</td>
                                <td>
                                    {getSubcategoryName(subsubcategoria.id_subcategoria)}
                                </td>
                                <td>
                                    <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
                                        <button 
                                            onClick={() => handleEdit(subsubcategoria)} 
                                            disabled={loading}
                                            className="btn btn-primary mb-1 w-50"
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(subsubcategoria.id)} 
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