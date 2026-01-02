import React, { useState, useEffect, useRef } from 'react';
import styles from '../assets/styles/estilos_administradores.module.scss';
import { getFullUrl } from "../utils/utils.js";
import { TableData } from './widgets/Table'; 

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

const AdminAgruparProductos = () => {
    // --- MODO DE OPERACIÓN ---
    const [modoEdicion, setModoEdicion] = useState(false); // false = Crear, true = Editar
    const [maestroSeleccionadoId, setMaestroSeleccionadoId] = useState(null);
    const [listaMaestros, setListaMaestros] = useState([]); // Para el dropdown de edición

    // --- ESTADOS DE CARGA Y BÚSQUEDA (Productos Hijos) ---
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [productos, setProductos] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    
    // Lista de productos seleccionados (Derecha)
    const [selectedProducts, setSelectedProducts] = useState([]); 

    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, perPage: 50 });
    const searchTimeoutRef = useRef(null);

    // --- ESTADOS DEL FORMULARIO ---
    const [nombreGrupo, setNombreGrupo] = useState(''); 
    const [nuevoAtributo, setNuevoAtributo] = useState(''); 
    const [atributos, setAtributos] = useState([]); 
    const [configuracionHijos, setConfiguracionHijos] = useState({}); 

    const [submitting, setSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

    // --- CARGA INICIAL ---
    useEffect(() => {
        if (!isSearching) loadProductos(pagination.currentPage);
        if (modoEdicion) loadListaMaestros(); // Cargar lista de padres si cambiamos a modo edición
    }, [isSearching, pagination.currentPage, modoEdicion]);

    // --- SEARCH DEBOUNCE ---
    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm) searchProductos(searchTerm);
            else if (isSearching) { setIsSearching(false); loadProductos(pagination.currentPage); }
        }, 500);
        searchTimeoutRef.current = delayDebounceFn;
        return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
    }, [searchTerm, isSearching]);

    // --- API HELPERS ---
    const loadProductos = async (page = 1) => {
        setLoadingProducts(true);
        try {
            const res = await fetch(`${BASE_URL_API}/api/productos?page=${page}&per_page=${pagination.perPage}`);
            const data = await res.json();
            if (data && data.data) {
                setProductos(data.data);
                setPagination({ currentPage: data.current_page, totalPages: data.last_page, perPage: data.per_page });
            } else setProductos([]);
        } catch (error) { console.error(error); } 
        finally { setLoadingProducts(false); }
    };

    const searchProductos = async (query) => {
        if (!query.trim() || query.trim().length < 3) return;
        setLoadingProducts(true);
        setIsSearching(true);
        try {
            const res = await fetch(`${BASE_URL_API}/api/products/complete-search?query=${encodeURIComponent(query)}`);
            const data = await res.json();
            setProductos(Array.isArray(data) ? data : []);
            setPagination({ ...pagination, currentPage: 1, totalPages: 1 });
        } catch (error) { console.error(error); } 
        finally { setLoadingProducts(false); }
    };

    // Cargar lista de productos que ya son MAESTROS (para editarlos)
    const loadListaMaestros = async () => {
        try {
            const res = await fetch(`${BASE_URL_API}/api/productos/maestros`);
            if (!res.ok) throw new Error("Error al cargar lista de maestros (Revisa routes/api.php)");
            const data = await res.json();
            setListaMaestros(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); }
    };

    // Función auxiliar para buscar Maestros por nombre (para el selector de edición)
    const searchMaestros = async (query) => {
        try {
            const url = query 
                ? `${BASE_URL_API}/api/productos/maestros?query=${encodeURIComponent(query)}`
                : `${BASE_URL_API}/api/productos/maestros`;

            const res = await fetch(url);
            if (!res.ok) throw new Error("Error al buscar maestros");
            const data = await res.json();
            setListaMaestros(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); }
    };

    // --- CARGAR DATOS DE UN GRUPO EXISTENTE ---
    const cargarGrupoParaEditar = async (idPadre) => {
        setSubmitting(true);
        try {
            const res = await fetch(`${BASE_URL_API}/api/productos/${idPadre}`); // Endpoint que trae producto con variantes
            const maestro = await res.json();
            
            setMaestroSeleccionadoId(maestro.id);
            setNombreGrupo(maestro.nombre);
            
            // Parsear atributos_division si viene como string
            let attrs = maestro.atributos_division;
            if (typeof attrs === 'string') {
                try { attrs = JSON.parse(attrs); } catch (e) { attrs = []; }
            }
            setAtributos(Array.isArray(attrs) ? attrs : []);
            
            // Cargar hijos
            setSelectedProducts(maestro.variantes || []);
            
            // Reconstruir configuración
            const config = {};
            if (maestro.variantes) {
                maestro.variantes.forEach(v => {
                    let vAttrs = v.atributos_json;
                    if (typeof vAttrs === 'string') {
                        try { vAttrs = JSON.parse(vAttrs); } catch (e) { vAttrs = {}; }
                    }
                    config[v.id] = vAttrs || {};
                });
            }
            setConfiguracionHijos(config);
            setStatusMessage({ type: 'success', text: `Grupo "${maestro.nombre}" cargado. Puedes editarlo.` });

        } catch (error) {
            setStatusMessage({ type: 'danger', text: 'Error al cargar el grupo.' });
        } finally {
            setSubmitting(false);
        }
    };

    // --- LOGICA UI ---
    const handleProductSelection = (producto) => {
        setSelectedProducts(prev => {
            const exists = prev.find(p => p.id === producto.id);
            if (exists) {
                const newConfig = { ...configuracionHijos };
                delete newConfig[producto.id];
                setConfiguracionHijos(newConfig);
                return prev.filter(p => p.id !== producto.id);
            } else {
                return [...prev, producto];
            }
        });
    };

    const removeProductFromGroup = (productoId) => {
        const producto = selectedProducts.find(p => p.id === productoId);
        if (producto) handleProductSelection(producto);
    };

    const agregarAtributo = () => {
        if (nuevoAtributo.trim() && !atributos.includes(nuevoAtributo.trim())) {
            setAtributos([...atributos, nuevoAtributo.trim()]);
            setNuevoAtributo('');
        }
    };

    const eliminarAtributo = (attrToDelete) => {
        setAtributos(atributos.filter(attr => attr !== attrToDelete));
        const newConfig = { ...configuracionHijos };
        Object.keys(newConfig).forEach(prodId => {
            if (newConfig[prodId][attrToDelete]) delete newConfig[prodId][attrToDelete];
        });
        setConfiguracionHijos(newConfig);
    };

    const handleValorAtributoChange = (productoId, atributo, valor) => {
        setConfiguracionHijos(prev => ({
            ...prev,
            [productoId]: { ...(prev[productoId] || {}), [atributo]: valor }
        }));
    };

    const resetForm = () => {
        setSelectedProducts([]);
        setNombreGrupo('');
        setAtributos([]);
        setConfiguracionHijos({});
        setMaestroSeleccionadoId(null);
        setListaMaestros([]);
    };

    // --- SUBMIT ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setStatusMessage({ type: '', text: '' });

        const payload = {
            product_ids: selectedProducts.map(p => p.id),
            nombre_grupo: nombreGrupo,
            atributos_division: atributos,
            configuracion_hijos: configuracionHijos
        };

        try {
            let url = `${BASE_URL_API}/api/productos/agrupar`;
            let method = 'POST';

            if (modoEdicion && maestroSeleccionadoId) {
                url = `${BASE_URL_API}/api/productos/agrupar/${maestroSeleccionadoId}`;
                method = 'PUT'; // Usamos PUT para actualizar
            }

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error en la operación');

            setStatusMessage({ type: 'success', text: modoEdicion ? 'Grupo actualizado correctamente.' : 'Grupo creado correctamente.' });
            
            if (!modoEdicion) resetForm(); // Si creamos, limpiamos. Si editamos, dejamos los datos por si quiere seguir cambiando.
            loadProductos(pagination.currentPage);

        } catch (error) {
            setStatusMessage({ type: 'danger', text: error.message });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.contenedor_total_administrador} style={{ flexDirection: 'column' }}>
            
            {/* --- CABECERA: SELECTOR DE MODO --- */}
            <div className="d-flex justify-content-between align-items-center mb-4 mt-4">
                <h2>{modoEdicion ? 'Editar Grupo Existente' : 'Crear Nuevo Grupo'}</h2>
                <div className="btn-group">
                    <button 
                        className={`btn ${!modoEdicion ? 'btn-primary' : 'btn-outline-primary'}`} 
                        onClick={() => { setModoEdicion(false); resetForm(); }}>
                        Crear Nuevo
                    </button>
                    <button 
                        className={`btn ${modoEdicion ? 'btn-primary' : 'btn-outline-primary'}`} 
                        onClick={() => { setModoEdicion(true); resetForm(); }}>
                        Editar Existente
                    </button>
                </div>
            </div>

            {/* Mensajes */}
            {statusMessage.text && (
                <div className={`alert alert-${statusMessage.type} mb-3`}>{statusMessage.text}</div>
            )}

            {/* --- MODO EDICIÓN: BUSCADOR DE PADRES --- */}
            {modoEdicion && !maestroSeleccionadoId && (
                <div className="p-4 border rounded bg-light mb-4 text-center">
                    <h4>Primero, busca el producto Padre que quieres editar:</h4>
                    <input 
                        type="text" 
                        className="form-control form-control-lg mt-3" 
                        placeholder="Escribe el nombre del grupo (Ej: Camiseta Polo)..."
                        onChange={(e) => searchMaestros(e.target.value)}
                    />
                    {listaMaestros.length > 0 ? (
                        <ul className="list-group mt-2 text-start" style={{maxHeight: 200, overflowY: 'auto'}}>
                            {listaMaestros.map(m => (
                                <button 
                                    key={m.id} 
                                    className="list-group-item list-group-item-action d-flex justify-content-between"
                                    onClick={() => cargarGrupoParaEditar(m.id)}
                                >
                                    <span>{m.nombre} <small className="text-muted">({m.codigo})</small></span>
                                    <span className="badge bg-secondary">Seleccionar</span>
                                </button>
                            ))}
                        </ul>
                    ) : (
                        <div className="alert alert-warning mt-3">
                            No se encontraron grupos. Asegúrate de haber creado alguno o revisa que la ruta <b>/api/productos/maestros</b> esté registrada en el backend.
                        </div>
                    )}
                </div>
            )}

            {/* --- CUERPO PRINCIPAL (Solo visible si estamos creando O ya seleccionamos un padre) --- */}
            {(!modoEdicion || maestroSeleccionadoId) && (
                <div className={styles.contenedor_total_administrador} style={{gap: '20px'}}>
                    
                    {/* IZQUIERDA: PRODUCTOS DISPONIBLES */}
                    <div className={styles.contenedor_registros} style={{ flex: 1.2, minWidth: '45%' }}>
                        <h3>Productos Disponibles</h3>
                        <div className="input-group mb-3">
                            <input
                                type="text" className="form-control" placeholder="Buscar productos para agregar..."
                                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && <button className="btn btn-outline-secondary" onClick={() => setSearchTerm('')}>X</button>}
                        </div>

                        {loadingProducts ? <p>Cargando...</p> : (
                            <table className="table table-striped table-sm align-middle">
                                <thead className="table-dark">
                                    <tr><th style={{width:30}}></th><th>Código</th><th>Nombre</th><th>Img</th></tr>
                                </thead>
                                <tbody>
                                    {productos.map(p => {
                                        const isSelected = selectedProducts.some(sel => sel.id === p.id);
                                        // Bloqueamos si ya es maestro de OTRO grupo, pero permitimos si es hijo de ESTE grupo (para re-agregar si se quitó accidentalmente)
                                        const isOccupied = p.producto_maestro_id !== null && p.producto_maestro_id !== maestroSeleccionadoId;
                                        const isSelf = p.id === maestroSeleccionadoId;

                                        if (isSelf) return null; // No mostrar al padre en la lista

                                        return (
                                            <tr key={p.id} className={isSelected ? "table-primary" : ""}>
                                                <td>
                                                    <input
                                                        type="checkbox" checked={isSelected}
                                                        disabled={isOccupied}
                                                        onChange={() => handleProductSelection(p)}
                                                        className="form-check-input"
                                                    />
                                                </td>
                                                <TableData>{p.codigo}</TableData>
                                                <TableData>
                                                    {p.nombre} {isOccupied && <span className="badge bg-secondary">Ocupado</span>}
                                                </TableData>
                                                <td>{p.imagen_1 && <img src={getFullUrl(p.imagen_1)} style={{width:30}} alt=""/>}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                         {!isSearching && pagination.totalPages > 1 && (
                            <div className="d-flex justify-content-center gap-2 mt-2">
                                <button className="btn btn-sm btn-outline-primary" onClick={() => loadProductos(pagination.currentPage - 1)} disabled={pagination.currentPage === 1}>{'<'}</button>
                                <span>{pagination.currentPage}</span>
                                <button className="btn btn-sm btn-outline-primary" onClick={() => loadProductos(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages}>{'>'}</button>
                            </div>
                        )}
                    </div>

                    {/* DERECHA: CONFIGURACIÓN */}
                    <div className={styles.contenedor_formulario} style={{ flex: 1, minWidth: '45%' }}>
                        <div className="p-3 border rounded bg-light mb-4">
                            <label className="form-label fw-bold">Nombre del Grupo (Padre)</label>
                            <input 
                                type="text" className="form-control" 
                                value={nombreGrupo} onChange={(e) => setNombreGrupo(e.target.value)}
                            />
                        </div>

                        <div className="p-3 border rounded bg-light mb-4">
                            <label className="form-label fw-bold">Atributos / Etiquetas</label>
                            <div className="input-group mb-2">
                                <input 
                                    type="text" className="form-control" placeholder="Ej: Talla"
                                    value={nuevoAtributo} onChange={(e) => setNuevoAtributo(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && agregarAtributo()}
                                />
                                <button className="btn btn-secondary" onClick={agregarAtributo} type="button">Agregar</button>
                            </div>
                            <div className="d-flex gap-2 flex-wrap">
                                {atributos.map((attr, idx) => (
                                    <span key={idx} className="badge bg-primary p-2">
                                        {attr} <button onClick={() => eliminarAtributo(attr)} className="btn-close btn-close-white ms-2" style={{fontSize: '0.5em'}}></button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4>Miembros del Grupo ({selectedProducts.length})</h4>
                            <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                                <table className="table table-bordered align-middle">
                                    <thead className="table-light">
                                        <tr><th>Producto</th>{atributos.map(attr => <th key={attr}>{attr}</th>)}<th style={{width:50}}></th></tr>
                                    </thead>
                                    <tbody>
                                        {selectedProducts.map(prod => (
                                            <tr key={prod.id}>
                                                <td><small className="fw-bold d-block">{prod.nombre}</small></td>
                                                {atributos.map(attr => (
                                                    <td key={attr}>
                                                        <input 
                                                            type="text" className="form-control form-control-sm"
                                                            value={configuracionHijos[prod.id]?.[attr] || ''}
                                                            onChange={(e) => handleValorAtributoChange(prod.id, attr, e.target.value)}
                                                        />
                                                    </td>
                                                ))}
                                                <td className="text-center">
                                                    <button className="btn btn-outline-danger btn-sm" onClick={() => removeProductFromGroup(prod.id)}>🗑️</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <button 
                            onClick={handleSubmit} 
                            className={`btn w-100 btn-lg mt-3 ${modoEdicion ? 'btn-warning' : 'btn-success'}`}
                            disabled={submitting || selectedProducts.length < 1 || !nombreGrupo.trim()}
                        >
                            {submitting ? 'Guardando...' : (modoEdicion ? 'GUARDAR CAMBIOS' : 'CREAR GRUPO')}
                        </button>
                        
                        {modoEdicion && (
                            <button className="btn btn-secondary w-100 mt-2" onClick={resetForm}>Cancelar Edición</button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAgruparProductos;