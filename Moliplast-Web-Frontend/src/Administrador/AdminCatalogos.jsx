import React, { useState, useEffect } from 'react';

const AdminCatalogos = () => {
    const [catalogos, setCatalogos] = useState([]);
    const [newCatalogo, setNewCatalogo] = useState({
        nombre: '',
        enlace_documento: '',
        enlace_imagen_portada: '',
    });
    const [editingCatalogo, setEditingCatalogo] = useState(null);

    useEffect(() => {
        loadCatalogos();
    }, []);

    const loadCatalogos = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/catalogos');
            
            if (!response.ok) {
                if (response.status === 404) {
                    setCatalogos([]);
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setCatalogos(data);
        } catch (error) {
            console.error('Error fetching data:', error);
            setCatalogos([]);
        }
    };

    const handleInputChange = (e) => {
        setNewCatalogo({ ...newCatalogo, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingCatalogo 
                ? `http://127.0.0.1:8000/api/catalogos/${editingCatalogo.id}` 
                : 'http://127.0.0.1:8000/api/catalogos';
                
            const response = await fetch(url, {
                method: editingCatalogo ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(newCatalogo),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log(editingCatalogo ? 'Catálogo actualizado:' : 'Catálogo guardado:', data);
            setNewCatalogo({ nombre: '', enlace_documento: '', enlace_imagen_portada: '' });
            setEditingCatalogo(null);
            loadCatalogos();
        } catch (error) {
            console.error(editingCatalogo ? 'Error actualizando catálogo:' : 'Error guardando catálogo:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de eliminar este catálogo?")) {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/catalogos/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('Catálogo eliminado:', data);
                loadCatalogos();
            } catch (error) {
                console.error('Error eliminando catálogo:', error);
            }
        }
    };

    const handleEdit = (catalogo) => {
        setEditingCatalogo(catalogo);
        setNewCatalogo({
            nombre: catalogo.nombre,
            enlace_documento: catalogo.enlace_documento,
            enlace_imagen_portada: catalogo.enlace_imagen_portada
        });
    };

    return (
        <div>
            <h1>Admin Catálogos</h1>

            <form onSubmit={handleSubmit}>
                <label htmlFor="nombre">Nombre:</label><br />
                <input type="text" id="nombre" name="nombre" value={newCatalogo.nombre} onChange={handleInputChange} required /><br /><br />

                <label htmlFor="enlace_documento">Enlace Documento:</label><br />
                <input type="text" id="enlace_documento" name="enlace_documento" value={newCatalogo.enlace_documento} onChange={handleInputChange} required /><br /><br />

                <label htmlFor="enlace_imagen_portada">Enlace Imagen Portada:</label><br />
                <input type="text" id="enlace_imagen_portada" name="enlace_imagen_portada" value={newCatalogo.enlace_imagen_portada} onChange={handleInputChange} required /><br /><br />

                <button type="submit">{editingCatalogo ? 'Actualizar' : 'Guardar'}</button>
                {editingCatalogo && (
                    <button 
                        type="button" 
                        onClick={() => {
                            setEditingCatalogo(null); 
                            setNewCatalogo({ nombre: '', enlace_documento: '', enlace_imagen_portada: '' });
                        }}
                    >
                        Cancelar Edición
                    </button>
                )}
            </form>

            <h2>Lista de Catálogos</h2>
            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Enlace Documento</th>
                        <th>Enlace Imagen Portada</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {catalogos.length === 0 ? (
                        <tr>
                            <td colSpan="4">No hay catálogos disponibles</td>
                        </tr>
                    ) : (
                        catalogos.map((catalogo) => (
                            <tr key={catalogo.id}>
                                <td>{catalogo.nombre}</td>
                                <td>{catalogo.enlace_documento}</td>
                                <td>{catalogo.enlace_imagen_portada}</td>
                                <td>
                                    <button onClick={() => handleEdit(catalogo)}>Editar</button>
                                    <button onClick={() => handleDelete(catalogo.id)}>Eliminar</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AdminCatalogos;