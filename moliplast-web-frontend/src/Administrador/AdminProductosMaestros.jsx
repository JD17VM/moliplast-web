import React, { useState, useEffect, useRef } from 'react';
import styles from '../assets/styles/estilos_administradores.module.scss';
import { getFullUrl } from "../utils/utils.js";
import { fetchData, deleteResource } from '../utils/api.js';
import { TableData, TableDataActions } from './widgets/Table';

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

const AdminProductosMaestros = () => {
    // === ESTADOS ===
    const [maestros, setMaestros] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [subcategorias, setSubcategorias] = useState([]);
    
    // Estados de Carga y Error
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Estado para Edición
    const [editingMaestro, setEditingMaestro] = useState(null);

    // Estado del Formulario
    const [newMaestro, setNewMaestro] = useState({
        nombre: '',
        descripcion: '',
        id_categoria: '',
        id_subcategoria: '',
        enlace_ficha_tecnica: null,
        imagen_1: null, 
    });
    
    const [imagenPreview, setImagenPreview] = useState('');
    const imagenInputRef = useRef(null);

    // Estado para Atributos y Variantes
    const [atributoInput, setAtributoInput] = useState('');
    const [atributos, setAtributos] = useState([]); // ADN: ["Medida", "Color"]
    
    // Estado para variantes
    const [valoresGenerador, setValoresGenerador] = useState({}); 
    const [variantesGeneradas, setVariantesGeneradas] = useState([]); // Las NUEVAS que vas a crear
    const [variantesExistentes, setVariantesExistentes] = useState([]); // Las que YA EXISTEN en BD (para mostrar al editar)

    // === CARGA DE DATOS ===
    const loadMaestros = async () => {
        await fetchData(`${BASE_URL_API}/api/productos-carta?per_page=100`, (data) => setMaestros(data.data), setLoading, setError);
    };

    const loadCategorias = async () => {
        await fetchData(`${BASE_URL_API}/api/categorias-con-subcategorias`, setCategorias, setLoading, setError);
    };

    useEffect(() => {
        loadMaestros();
        loadCategorias();
    }, []);

    // Manejo de Categorías
    useEffect(() => {
        if (newMaestro.id_categoria) {
            const cat = categorias.find(c => c.id === parseInt(newMaestro.id_categoria));
            setSubcategorias(cat ? cat.subcategorias : []);
        } else {
            setSubcategorias([]);
        }
    }, [newMaestro.id_categoria, categorias]);


    // === MANEJADORES ===
    const handleInputChange = (e) => {
        setNewMaestro({ ...newMaestro, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewMaestro({ ...newMaestro, [e.target.name]: file });
            if (e.target.name === 'imagen_1') {
                const reader = new FileReader();
                reader.onload = () => setImagenPreview(reader.result);
                reader.readAsDataURL(file);
            }
        }
    };

    // === LÓGICA DE ATRIBUTOS ===
    const agregarAtributo = () => {
        if (atributoInput.trim() && !atributos.includes(atributoInput.trim())) {
            setAtributos([...atributos, atributoInput.trim()]);
            setAtributoInput('');
        }
    };

    const eliminarAtributo = (attr) => {
        setAtributos(atributos.filter(a => a !== attr));
        const nuevosValores = { ...valoresGenerador };
        delete nuevosValores[attr];
        setValoresGenerador(nuevosValores);
    };

    // === LÓGICA DEL GENERADOR ===
    const handleGeneradorChange = (atributo, valor) => {
        setValoresGenerador({ ...valoresGenerador, [atributo]: valor });
    };

    const generarVariantes = () => {
        if (atributos.length === 0) return;
        const matrices = atributos.map(attr => {
            const raw = valoresGenerador[attr] || '';
            return raw.split(',').map(s => s.trim()).filter(s => s !== '');
        });

        if (matrices.some(m => m.length === 0)) {
            alert("Por favor completa valores para todos los atributos");
            return;
        }

        const cartesian = (a, b) => [].concat(...a.map(d => b.map(e => [].concat(d, e))));
        const combinaciones = matrices.length > 1 ? matrices.reduce(cartesian) : matrices[0];

        const nuevasVariantes = combinaciones.map(comb => {
            const valores = Array.isArray(comb) ? comb : [comb];
            const atributosObj = {};
            let nombreVarianteBuilder = "";

            atributos.forEach((attr, idx) => {
                atributosObj[attr] = valores[idx];
                nombreVarianteBuilder += `${valores[idx]} `;
            });

            return {
                nombre_variante: nombreVarianteBuilder.trim(),
                atributos_json: atributosObj,
            };
        });

        setVariantesGeneradas(nuevasVariantes);
    };

    const eliminarVarianteGenerada = (index) => {
        const nuevas = [...variantesGeneradas];
        nuevas.splice(index, 1);
        setVariantesGeneradas(nuevas);
    };

    // === ACCIONES DE LA TABLA ===
    // En AdminProductosMaestros.jsx, alrededor de la línea 157

    // 1. CARGAR DATOS AL EDITAR (Fetch completo y corregido)
    const handleEdit = async (maestroSimple) => {
        // Validación básica de seguridad
        if (!maestroSimple || !maestroSimple.id || isNaN(Number(maestroSimple.id))) {
            return; 
        }

        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
            const response = await fetch(`${BASE_URL_API}/api/producto-maestro/${maestroSimple.id}`);
            
            if (!response.ok) {
                throw new Error('Error al cargar detalles del maestro.'); 
            }
            
            const maestroFull = await response.json();
            
            setEditingMaestro(maestroFull); 
            setVariantesGeneradas([]); 

            // Rellenar formulario (convertimos IDs a string para los selects)
            setNewMaestro({
                nombre: maestroFull.nombre,
                descripcion: maestroFull.descripcion || '',
                id_categoria: maestroFull.id_categoria ? String(maestroFull.id_categoria) : '',
                id_subcategoria: maestroFull.id_subcategoria ? String(maestroFull.id_subcategoria) : '',
                imagen_1: null, 
            });

            // Imagen preview
            if (maestroFull.imagen_1) {
                setImagenPreview(getFullUrl(maestroFull.imagen_1)); 
            } else {
                setImagenPreview('');
            }

            // === CORRECCIÓN DE ATRIBUTOS (STRING -> ARRAY) ===
            let attrs = maestroFull.atributos_division;

            // Si llega como string (ej: "['Medida']"), lo convertimos a array real
            if (typeof attrs === 'string') {
                try {
                    attrs = JSON.parse(attrs);
                } catch (e) {
                    console.error("Error parseando atributos:", e);
                    attrs = [];
                }
            }

            // Ahora sí asignamos
            if (attrs && Array.isArray(attrs)) {
                setAtributos(attrs); 
            } else {
                setAtributos([]);
            }
            // =================================================

            // Variantes Existentes
            if (maestroFull.variantes && Array.isArray(maestroFull.variantes)) {
                setVariantesExistentes(maestroFull.variantes);
            } else {
                setVariantesExistentes([]);
            }

        } catch (err) {
            console.error(err);
            setError("No se pudieron cargar los detalles: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        resetForm();
        setSuccess('');
        setError('');
    };

    const handleDelete = async (id) => {
        // Nota: Implementar lógica de borrado si el backend lo permite
        if(confirm("¿Estás seguro de eliminar esta familia?")) {
             await deleteResource(`${BASE_URL_API}/api/producto-maestro`, id, setLoading, setError, setSuccess, loadMaestros);
             if(editingMaestro && editingMaestro.id === id) resetForm();
        }
    };

    // Borrar un hijo real de la base de datos (Variante)
    const handleDeleteHijo = async (idHijo) => {
        if(!confirm("¿Borrar esta variante permanentemente?")) return;
        setLoading(true);
        try {
            // Usamos el endpoint de borrar productos normales
            await deleteResource(`${BASE_URL_API}/api/productos`, idHijo, setLoading, setError, setSuccess, () => {});
            // Actualizar lista visualmente sin recargar todo
            setVariantesExistentes(prev => prev.filter(v => v.id !== idHijo));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // === SUBMIT ===
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const formDataMaestro = new FormData();
            formDataMaestro.append('nombre', newMaestro.nombre);
            formDataMaestro.append('descripcion', newMaestro.descripcion);
            formDataMaestro.append('id_categoria', newMaestro.id_categoria);
            if(newMaestro.id_subcategoria) formDataMaestro.append('id_subcategoria', newMaestro.id_subcategoria);
            formDataMaestro.append('atributos_division', JSON.stringify(atributos));
            if (newMaestro.imagen_1) formDataMaestro.append('imagen_1', newMaestro.imagen_1);

            let url = `${BASE_URL_API}/api/producto-maestro`;
            
            if (editingMaestro) {
                url = `${BASE_URL_API}/api/producto-maestro/${editingMaestro.id}`;
                formDataMaestro.append('_method', 'PUT'); 
            }

            // 1. Guardar Maestro
            const resMaestro = await fetch(url, { method: 'POST', body: formDataMaestro });
            if (!resMaestro.ok) {
                const errorJson = await resMaestro.json();
                throw new Error(errorJson.message || 'Error al guardar Maestro');
            }
            const maestroGuardado = await resMaestro.json();

            // 2. Guardar Variantes NUEVAS
            // ... dentro de handleSubmit ...

            // 2. Guardar Variantes NUEVAS
            if (variantesGeneradas.length > 0) {
                const idMaestroFinal = editingMaestro ? editingMaestro.id : maestroGuardado.id;
                
                const promesasVariantes = variantesGeneradas.map(variante => {
                    const formDataHijo = new FormData();
                    
                    // --- VINCULACIÓN ---
                    formDataHijo.append('producto_maestro_id', idMaestroFinal);
                    
                    // --- NOMBRES ---
                    formDataHijo.append('nombre', `${newMaestro.nombre} ${variante.nombre_variante}`);
                    formDataHijo.append('nombre_variante', variante.nombre_variante);
                    formDataHijo.append('atributos_json', JSON.stringify(variante.atributos_json));
                    
                    // --- HERENCIA (Aquí estaba el problema) ---
                    
                    // 1. Categoria (Ya lo tenías, OK)
                    formDataHijo.append('id_categoria', newMaestro.id_categoria);
                    
                    // 2. Subcategoría (FALTABA ESTO)
                    if (newMaestro.id_subcategoria) {
                        formDataHijo.append('id_subcategoria', newMaestro.id_subcategoria);
                    }

                    // 3. Sub-Subcategoría (OJO: Primero debes agregarla al State y al Formulario del padre para que esto funcione)
                    // if (newMaestro.id_subsubcategoria) {
                    //    formDataHijo.append('id_subsubcategoria', newMaestro.id_subsubcategoria);
                    // }

                    // 4. Descripción / Markdown (FALTABA ESTO)
                    // Asumiendo que 'descripcion' es lo que usas para el markdown
                    if (newMaestro.descripcion) {
                        formDataHijo.append('descripcion', newMaestro.descripcion); 
                        // Si en tu BD el campo se llama 'markdown', cambia la linea de arriba por:
                        // formDataHijo.append('markdown', newMaestro.descripcion);
                    }

                    // 5. Imagen (Ya lo tenías, OK)
                    if (newMaestro.imagen_1) {
                        formDataHijo.append('imagen_1', newMaestro.imagen_1);
                    }

                    // IMPORTANTE: URL EN PLURAL
                    return fetch(`${BASE_URL_API}/api/productos`, { method: 'POST', body: formDataHijo });
                });

                await Promise.all(promesasVariantes);
            }

            setSuccess(editingMaestro ? 'Familia actualizada' : 'Familia creada');

            // CORRECCIÓN AQUÍ: No llamas a resetForm en edición
            if (editingMaestro) {
                // Si estamos editando, recargamos el form con los datos que ya tenemos para no perder el estado
                loadMaestros(); 
            } else {
                // Si estamos creando, sí limpiamos el form
                resetForm(); 
                loadMaestros();
            }

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEditingMaestro(null);
        setNewMaestro({ nombre: '', descripcion: '', id_categoria: '', id_subcategoria: '', imagen_1: null });
        setAtributos([]);
        setVariantesGeneradas([]);
        setVariantesExistentes([]);
        setValoresGenerador({});
        setImagenPreview('');
        if (imagenInputRef.current) imagenInputRef.current.value = "";
    };

    return (
        <>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <h2 className='mt-4 mb-3'>Administrador Productos Maestros (Familias)</h2>

            <div className={styles.contenedor_total_administrador}>
                
                {/* === IZQUIERDA: LISTA === */}
                <div className={styles.contenedor_registros}>
                    <table className="table table-striped table-responsive align-middle">
                        <thead className="table-dark">
                            <tr>
                                <th>Nombre Familia</th>
                                <th>Imagen</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {maestros.length === 0 ? (
                                <tr><td colSpan="3" className="text-center">No hay productos maestros</td></tr>
                            ) : (
                                maestros.map(m => (
                                    <tr key={m.id}>
                                        <TableData>{m.nombre}</TableData>
                                        <TableData image_src={getFullUrl(m.imagen_1)}>{m.nombre}</TableData>
                                        {/* CORRECCIÓN: Se agrega handleEditarFila */}
                                        <TableDataActions 
                                            item={m} 
                                            handleEdit={handleEdit} 
                                            handleEditarFila={() => {}} // <--- CORRECCIÓN: Función vacía para evitar el doble disparo
                                            handleDelete={handleDelete} 
                                            loading={loading} 
                                        />
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* === DERECHA: FORMULARIO === */}
                <div className={styles.contenedor_formulario}>
                    <h3 className="mt-3 text-primary">{editingMaestro ? 'Editar Familia' : 'Crear Nueva Familia'}</h3>
                    
                    <form onSubmit={handleSubmit} className="row g-3 my-3">
                        
                        {/* 1. DATOS GENERALES */}
                        <div className="col-12">
                            <label className="form-label fw-bold">Nombre</label>
                            <input 
                                type="text" name="nombre" className="form-control" required 
                                value={newMaestro.nombre} onChange={handleInputChange} 
                            />
                        </div>

                        <div className="col-12">
                            <label className="form-label">Categoría</label>
                            <select name="id_categoria" className="form-select" value={newMaestro.id_categoria} onChange={handleInputChange}>
                                <option value="">Seleccione...</option>
                                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </select>
                        </div>

                        <div className="col-12">
                            <label className="form-label">Imagen</label>
                            <input type="file" name="imagen_1" className="form-control" onChange={handleFileChange} ref={imagenInputRef} accept="image/*" />
                            {imagenPreview && <img src={imagenPreview} alt="Preview" className="mt-2" style={{height: 80}} />}
                        </div>

                        <hr />

                        {/* 2. ATRIBUTOS */}
                        <div className="col-12">
                            <label className="form-label fw-bold text-info">Definir Atributos (ADN)</label>
                            <div className="input-group">
                                <input 
                                    type="text" className="form-control" placeholder="Ej: Medida" 
                                    value={atributoInput} onChange={(e) => setAtributoInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarAtributo())}
                                />
                                <button type="button" className="btn btn-outline-info" onClick={agregarAtributo}>Agregar</button>
                            </div>
                            <div className="mt-2">
                                {atributos.map(attr => (
                                    <span key={attr} className="badge bg-light text-dark border me-2 p-2">
                                        {attr} <span style={{cursor:'pointer', color:'red', marginLeft:5}} onClick={() => eliminarAtributo(attr)}>×</span>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* 3. LISTA DE VARIANTES EXISTENTES (SOLO AL EDITAR) */}
                        {editingMaestro && variantesExistentes.length > 0 && (
                            <div className="col-12 mt-3">
                                <h6 className="fw-bold text-success">Variantes Registradas (En BD)</h6>
                                <div style={{maxHeight: '200px', overflowY: 'auto', border: '1px solid #c3e6cb', background: '#f0fff4'}}>
                                    <table className="table table-sm table-bordered mb-0" style={{fontSize: '0.8rem'}}>
                                        <thead className="table-light"><tr><th>Nombre</th><th>Código</th><th></th></tr></thead>
                                        <tbody>
                                            {variantesExistentes.map((v) => (
                                                <tr key={v.id}>
                                                    <td>{v.nombre_variante}</td>
                                                    <td>{v.codigo}</td>
                                                    <td className="text-center">
                                                        <button type="button" className="btn btn-sm btn-outline-danger py-0" onClick={() => handleDeleteHijo(v.id)}>🗑️</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* 4. GENERADOR (PARA CREAR NUEVAS) */}
                        {atributos.length > 0 && (
                            <div className="col-12 bg-light p-3 rounded border mt-3">
                                <h6 className="text-primary fw-bold">Generar NUEVAS Variantes</h6>
                                {atributos.map(attr => (
                                    <div className="mb-2" key={attr}>
                                        <label className="form-label small mb-0">Valores para <strong>{attr}</strong>:</label>
                                        <input 
                                            type="text" className="form-control form-control-sm"
                                            placeholder="Separados por coma..."
                                            value={valoresGenerador[attr] || ''}
                                            onChange={(e) => handleGeneradorChange(attr, e.target.value)}
                                        />
                                    </div>
                                ))}
                                <button type="button" className="btn btn-warning btn-sm w-100 mt-2 fw-bold" onClick={generarVariantes}>Generar</button>
                            </div>
                        )}

                        {/* 5. PREVIEW DE NUEVAS */}
                        {variantesGeneradas.length > 0 && (
                            <div className="col-12">
                                <h6 className="fw-bold small">Nuevas a guardar:</h6>
                                <div style={{maxHeight: '150px', overflowY: 'auto', border: '1px solid #ffeeba'}}>
                                    <table className="table table-sm table-bordered mb-0" style={{fontSize: '0.8rem'}}>
                                        <tbody>
                                            {variantesGeneradas.map((v, idx) => (
                                                <tr key={idx}>
                                                    <td>{v.nombre_variante}</td>
                                                    <td className="text-center">
                                                        <button type="button" className="btn btn-sm btn-danger py-0" onClick={() => eliminarVarianteGenerada(idx)}>×</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        <div className="col-12 mt-4 d-flex gap-2">
                            {editingMaestro && (
                                <button type="button" className="btn btn-danger w-50" onClick={handleCancelEdit} disabled={loading}>Cancelar</button>
                            )}
                            <button type="submit" className={`btn btn-primary ${editingMaestro ? 'w-50' : 'w-100'} fw-bold`} disabled={loading}>
                                {loading ? 'Procesando...' : 'Guardar Cambios'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </>
    );
};

export default AdminProductosMaestros;