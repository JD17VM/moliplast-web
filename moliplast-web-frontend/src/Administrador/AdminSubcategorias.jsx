import React, { useState, useEffect } from 'react';

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
        <div>
            <h1>Admin Subcategorías</h1>
            
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
                    value={newSubcategoria.nombre} 
                    onChange={handleInputChange} 
                    required 
                    disabled={loading}
                /><br /><br />

                <label htmlFor="id_categoria">Categoría:</label><br />
                <select
                    id="id_categoria"
                    name="id_categoria"
                    value={newSubcategoria.id_categoria}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>
                            {categoria.nombre}
                        </option>
                    ))}
                </select><br /><br />

                <button type="submit" disabled={loading}>
                    {loading ? 'Procesando...' : (editingSubcategoria ? 'Actualizar' : 'Guardar')}
                </button>
                {editingSubcategoria && (
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

            <h2>Lista de Subcategorías</h2>
            {loading && <p>Cargando...</p>}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Nombre</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Categoría</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Acciones</th>
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
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{subcategoria.nombre}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    {getCategoryName(subcategoria.id_categoria)}
                                </td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    <button 
                                        onClick={() => handleEdit(subcategoria)} 
                                        disabled={loading}
                                        style={{ marginRight: '5px' }}
                                    >
                                        Editar
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(subcategoria.id)} 
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

export default AdminSubcategorias;