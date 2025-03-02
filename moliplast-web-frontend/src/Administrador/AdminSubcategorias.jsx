import React, { useState, useEffect } from 'react';
import styles from '../assets/styles/estilos_administradores.module.scss'

const BASE_URL_API = "http://127.0.0.1:8000";

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

    useEffect(() => {
        loadSubcategorias();
        loadCategorias();
    }, []);

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
            console.error('Error fetching data:', error);
            setError('Error al cargar las subcategorías. Por favor, intenta nuevamente.');
            setSubcategorias([]);
        } finally {
            setLoading(false);
        }
    };

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
            console.error('Error fetching categories:', error);
            setError('Error al cargar las categorías. Por favor, intenta nuevamente.');
            setCategorias([]);
        } finally {
            setLoading(false);
        }
    };

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
        if (window.confirm("¿Estás seguro de eliminar esta subcategoría?")) {
            setLoading(true);
            setError('');
            
            try {
                const response = await fetch(`${BASE_URL_API}/api/subcategorias/${id}`, {
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
                
                setSuccess('Subcategoría eliminada exitosamente!');
                loadSubcategorias();
            } catch (error) {
                console.error('Error eliminando subcategoría:', error);
                setError(`Error: ${error.message}`);
            } finally {
                setLoading(false);
            }
        }
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
        <h2 className='mt-4 mb-3'>Lista de Subcategorías</h2>

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
                                <td>{subcategoria.nombre}</td>
                                <td>
                                    {getCategoryName(subcategoria.id_categoria)}
                                </td>
                                <td>
                                    <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
                                        <button 
                                            onClick={() => handleEdit(subcategoria)} 
                                            disabled={loading}
                                            className="btn btn-primary mb-1 w-50"
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(subcategoria.id)} 
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
                        {loading ? 'Procesando...' : (editingSubcategoria ? 'Actualizar' : 'Guardar')}
                    </button>
                    </div>
                </form>
            </div>
        </div>
        </>
    );
};

export default AdminSubcategorias;