import React, { useState, useEffect } from 'react';

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
        <div>
            <h1>Admin Subsubcategorías</h1>
            
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

            <form onSubmit={handleSubmit}>
                <label htmlFor="nombre">Nombre:</label><br />
                <input 
                    type="text" 
                    id="nombre" 
                    name="nombre" 
                    value={newSubsubcategoria.nombre} 
                    onChange={handleInputChange} 
                    required 
                    disabled={loading}
                /><br /><br />

                <label htmlFor="id_subcategoria">Subcategoría:</label><br />
                <select
                    id="id_subcategoria"
                    name="id_subcategoria"
                    value={newSubsubcategoria.id_subcategoria}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                >
                    <option value="">Seleccionar subcategoría</option>
                    {subcategorias.map((subcategoria) => (
                        <option key={subcategoria.id} value={subcategoria.id}>
                            {subcategoria.nombre}
                        </option>
                    ))}
                </select><br /><br />

                <button type="submit" disabled={loading}>
                    {loading ? 'Procesando...' : (editingSubsubcategoria ? 'Actualizar' : 'Guardar')}
                </button>
                {editingSubsubcategoria && (
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

            <h2>Lista de Subsubcategorías</h2>
            {loading && <p>Cargando...</p>}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Nombre</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Subcategoría</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Acciones</th>
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
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{subsubcategoria.nombre}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    {getSubcategoryName(subsubcategoria.id_subcategoria)}
                                </td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    <button 
                                        onClick={() => handleEdit(subsubcategoria)} 
                                        disabled={loading}
                                        style={{ marginRight: '5px' }}
                                    >
                                        Editar
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(subsubcategoria.id)} 
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

export default AdminSubsubcategorias;