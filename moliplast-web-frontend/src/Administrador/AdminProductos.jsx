import React, { useState, useEffect, useRef } from 'react';
import styles from '../assets/styles/estilos_administradores.module.scss';
import { fetchData, deleteResource } from '../utils/api.js';
import { getFullUrl } from "../utils/utils.js"
import imageHelper from '../utils/imageHelper';
import { TableData, TableDataActions } from './widgets/Table';

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

const AdminProductos = () => {
    // Estado para el buscador
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [subcategorias, setSubcategorias] = useState([]);
    const [subsubcategorias, setSubsubcategorias] = useState([]);
    const [newProducto, setNewProducto] = useState({
        id_categoria: '',
        id_subcategoria: '',
        id_subsubcategoria: '',
        nombre: '',
        descripcion: '',
        imagen_1: '', // Estos se usarán para File objects en la carga
        imagen_2: '',
        imagen_3: '',
        imagen_4: '',
        enlace_ficha_tecnica: '',
        texto_markdown: '',
        destacados: false,
        enlace_imagen_qr: '',
        codigo: '',
    });

    // Estado para rastrear archivos marcados para eliminación
    const [filesToDelete, setFilesToDelete] = useState({}); // { imagen_1: boolean, ..., enlace_ficha_tecnica: boolean, enlace_imagen_qr: boolean }


    // Estado para la paginación
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        perPage: 50, // Puedes ajustar este valor según tus necesidades
    });

    // Estado para controlar el tiempo entre solicitudes (mantenido del código original)
    const [requestInProgress, setRequestInProgress] = useState(false); // Aunque no se usa directamente en este snippet, se mantiene por contexto
    const lastRequestTimeRef = useRef(0);
    const requestQueueRef = useRef([]); // Aunque no se usa directamente en este snippet, se mantiene por contexto
    const searchTimeoutRef = useRef(null);

    // Cargar datos al iniciar el componente
    useEffect(() => {
        if (!isSearching) {
            loadProductos(pagination.currentPage);
        }
        loadCategorias();

        // Limpieza del timeout al desmontar
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [isSearching, pagination.currentPage]); // Añadir pagination.currentPage como dependencia para recargar al cambiar de página si no busca

    const [editingProducto, setEditingProducto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Referencias a los inputs de archivo para poder resetearlos
    const imagen1InputRef = useRef(null);
    const imagen2InputRef = useRef(null);
    const imagen3InputRef = useRef(null);
    const imagen4InputRef = useRef(null);
    const fichaTecnicaInputRef = useRef(null);
    const imagenQRInputRef = useRef(null);

    // Estados para las previsualizaciones
    const [imagen1Preview, setImagen1Preview] = useState('');
    const [imagen2Preview, setImagen2Preview] = useState('');
    const [imagen3Preview, setImagen3Preview] = useState('');
    const [imagen4Preview, setImagen4Preview] = useState('');
    const [fichaTecnicaPreview, setFichaTecnicaPreview] = useState('');
    const [imagenQRPreview, setImagenQRPreview] = useState('');


    // Cargar subcategorías cuando se selecciona una categoría
    useEffect(() => {
        if (newProducto.id_categoria) {
            // Filtrar subcategorías basadas en la categoría seleccionada
            const filteredSubcategorias = categorias
                .find(cat => cat.id === parseInt(newProducto.id_categoria))?.subcategorias || [];

            setSubcategorias(filteredSubcategorias);

            // Resetear subcategoría y subsubcategoría si cambia la categoría
             // Solo resetear si la subcategoría/subsubcategoría actual no pertenece a la nueva categoría
            const currentSubcategoriaId = parseInt(newProducto.id_subcategoria);
            const currentSubsubcategoriaId = parseInt(newProducto.id_subsubcategoria);

            const subcategoriaExistsInNewCategory = filteredSubcategorias.some(subcat => subcat.id === currentSubcategoriaId);

            if (!subcategoriaExistsInNewCategory) {
                 setNewProducto(prev => ({
                    ...prev,
                    id_subcategoria: '',
                    id_subsubcategoria: ''
                }));
                setSubsubcategorias([]);
            } else {
                 // If subcategory exists, ensure subsubcategories are updated based on it
                 const selectedSubcategoria = filteredSubcategorias.find(subcat => subcat.id === currentSubcategoriaId);
                 const filteredSubsubcategoriasForSubcat = selectedSubcategoria?.subsubcategorias || [];
                 setSubsubcategorias(filteredSubsubcategoriasForSubcat);

                 const subsubcategoriaExistsInNewSubcategory = filteredSubsubcategoriasForSubcat.some(subsubcat => subsubcat.id === currentSubsubcategoriaId);

                 if (!subsubcategoriaExistsInNewSubcategory) {
                     setNewProducto(prev => ({
                        ...prev,
                        id_subsubcategoria: ''
                    }));
                 }
            }


        } else {
            setSubcategorias([]);
            setSubsubcategorias([]);
            setNewProducto(prev => ({ // Resetear si no hay categoría seleccionada
                ...prev,
                id_subcategoria: '',
                id_subsubcategoria: ''
            }));
        }
    }, [newProducto.id_categoria, categorias]); // Agregar categorias como dependencia

    // Cargar subsubcategorías cuando se selecciona una subcategoría
    useEffect(() => {
        if (newProducto.id_subcategoria) {
            // Buscar la subcategoría seleccionada y obtener sus subsubcategorías
            const selectedSubcategoria = subcategorias
                .find(subcat => subcat.id === parseInt(newProducto.id_subcategoria));

            const filteredSubsubcategorias = selectedSubcategoria?.subsubcategorias || [];

            setSubsubcategorias(filteredSubsubcategorias);

            // Resetear subsubcategoría si cambia la subcategoría
             // Solo resetear if the current subsubcategory doesn't belong to the new subcategory
            const currentSubsubcategoriaId = parseInt(newProducto.id_subsubcategoria);
            const subsubcategoriaExistsInNewSubcategory = filteredSubsubcategorias.some(subsubcat => subsubcat.id === currentSubsubcategoriaId);

            if (!subsubcategoriaExistsInNewSubcategory) {
                 setNewProducto(prev => ({
                    ...prev,
                    id_subsubcategoria: ''
                }));
            }

        } else {
            setSubsubcategorias([]);
             setNewProducto(prev => ({ // Reset if no subcategory selected
                ...prev,
                id_subsubcategoria: ''
            }));
        }
    }, [newProducto.id_subcategoria, subcategorias]); // Agregar subcategorias como dependencia


    // Carga de productos desde la API con paginación
    const loadProductos = async (page = 1) => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${BASE_URL_API}/api/productos?page=${page}&per_page=${pagination.perPage}`);

            if (response.status === 404) {
                console.log('No hay productos disponibles');
                setProductos([]);
                setLoading(false);
                // Reset pagination if no products are found
                setPagination({
                    ...pagination,
                    currentPage: 1,
                    totalPages: 1,
                });
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.errors) {
                    // Si hay errores de validación, mostrarlos
                    setError(`Errores de validación: ${JSON.stringify(errorData.errors)}`);
                } else {
                    setError(`Error: ${errorData.message}`);
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setProductos(data.data); // Accede a los datos paginados
            setPagination({
                ...pagination,
                currentPage: data.current_page,
                totalPages: data.last_page,
            });
        } catch (error) {
            console.error('Error fetching productos:', error);
            setError('Error al cargar los productos. Por favor, intenta nuevamente.');
            setProductos([]);
             setPagination({ // Reset pagination on error
                ...pagination,
                currentPage: 1,
                totalPages: 1,
            });
        } finally {
            setLoading(false);
        }
    };

    // Cambiar de página
    const handlePageChange = (newPage) => {
        // Prevenir cambios de página si ya hay una solicitud en curso
         if (requestInProgress) return;
        loadProductos(newPage);
    };

    const loadCategorias = async () => {
        // Note: Using fetchData helper here, ensure it handles loading/error states correctly
        // and sets the categories state. Assuming it works as intended from the import.
         await fetchData(`${BASE_URL_API}/api/categorias-con-subcategorias`, setCategorias, setLoading, setError);
    };

    // NO NECESITAS loadSubcategorias y loadSubsubcategorias AQUI
    // Ya se cargan a través del useEffect que filtra las categorías/subcategorías existentes.
    // const loadSubcategorias = async (categoriaId) => {
    // fetchData(`${BASE_URL_API}/api/subcategorias?categoria_id=${categoriaId}`,setSubcategorias,setLoading,setError);
    // };

    // const loadSubsubcategorias = async (subcategoriaId) => {
    // fetchData(`${BASE_URL_API}/api/subsubcategorias?subcategoria_id=${subcategoriaId}`,setSubsubcategorias,setLoading,setError);
    // };


    // Manejo de cambios en los inputs de texto y select
    const handleInputChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setNewProducto({ ...newProducto, [e.target.name]: value });
    };

    // Manejo de cambios en los inputs de archivo
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const fieldName = e.target.name;

        if (file) {
            // Si se selecciona un nuevo archivo, agregarlo al estado del producto
            setNewProducto({ ...newProducto, [fieldName]: file });

            // Si se selecciona un nuevo archivo, asegúrate de que NO esté marcado para eliminación
            setFilesToDelete(prev => ({ ...prev, [fieldName]: false }));

            // Actualizar la previsualización
            const reader = new FileReader();
            reader.onload = () => {
                switch(fieldName) {
                    case 'imagen_1': setImagen1Preview(reader.result); break;
                    case 'imagen_2': setImagen2Preview(reader.result); break;
                    case 'imagen_3': setImagen3Preview(reader.result); break;
                    case 'imagen_4': setImagen4Preview(reader.result); break;
                    case 'enlace_imagen_qr': setImagenQRPreview(reader.result); break;
                    case 'enlace_ficha_tecnica': setFichaTecnicaPreview(file.name); break; // Para documentos mostramos el nombre
                    default: break;
                }
            };
             if (fieldName === 'enlace_ficha_tecnica') {
                // For non-image files, just set the name as preview
                 setFichaTecnicaPreview(file.name);
            } else {
                 reader.readAsDataURL(file);
            }

        } else {
            // Si el input de archivo se vacía (ej. al arrastrar y soltar y luego cancelar),
            // reseteamos el valor en newProducto y la previsualización
            setNewProducto({ ...newProducto, [fieldName]: '' });
            setFilesToDelete(prev => ({ ...prev, [fieldName]: false })); // No está marcado para eliminar explícitamente

             switch(fieldName) {
                    case 'imagen_1': setImagen1Preview(''); break;
                    case 'imagen_2': setImagen2Preview(''); break;
                    case 'imagen_3': setImagen3Preview(''); break;
                    case 'imagen_4': setImagen4Preview(''); break;
                    case 'enlace_imagen_qr': setImagenQRPreview(''); break;
                    case 'enlace_ficha_tecnica': setFichaTecnicaPreview(''); break;
                    default: break;
                }
        }
    };

     // Función para manejar la eliminación de un archivo existente
    const handleDeleteFile = (fieldName) => {
        // Marcar el archivo para eliminación en el estado filesToDelete
        setFilesToDelete(prev => ({ ...prev, [fieldName]: true }));

        // Limpiar la previsualización
        switch(fieldName) {
            case 'imagen_1': setImagen1Preview(''); break;
            case 'imagen_2': setImagen2Preview(''); break;
            case 'imagen_3': setImagen3Preview(''); break;
            case 'imagen_4': setImagen4Preview(''); break;
             // La imagen QR se regenera al guardar, así que eliminarla no tiene sentido persistente,
             // a menos que la API permita eliminarla sin regenerar.
             // Si la API regenera al guardar, solo limpiamos la preview aquí.
             // Si la API NO regenera al actualizar, debemos permitir eliminarla permanentemente.
             // Asumiremos que se puede eliminar permanentemente si el usuario la borra.
            case 'enlace_imagen_qr': setImagenQRPreview(''); break;
            case 'enlace_ficha_tecnica': setFichaTecnicaPreview(''); break; // Limpiar previsualización de ficha técnica
            default: break;
        }

        // Limpiar el input de archivo asociado usando la ref
        const inputRef = {
            imagen_1: imagen1InputRef,
            imagen_2: imagen2InputRef,
            imagen_3: imagen3InputRef,
            imagen_4: imagen4InputRef,
            enlace_imagen_qr: imagenQRInputRef,
            enlace_ficha_tecnica: fichaTecnicaInputRef,
        }[fieldName];

        if (inputRef && inputRef.current) {
            inputRef.current.value = ""; // Limpiar el input file
        }

        // Opcional: Si el campo es requerido en la creación pero no en la edición sin archivo,
        // puede que necesites ajustar validaciones frontend. Para la edición, no es necesario
        // tener un archivo si se está eliminando uno existente. La validación backend es clave aquí.
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const formData = new FormData();

        // Agregar campos de texto y select al FormData
        Object.keys(newProducto).forEach(key => {
             // No agregar archivos File object aquí, se manejan por separado
            if (['imagen_1', 'imagen_2', 'imagen_3', 'imagen_4', 'enlace_ficha_tecnica', 'enlace_imagen_qr'].includes(key)) {
                 // Archivos se añaden más abajo si son nuevos o se marca para eliminar
                 return;
            }

            // Si el campo es nulo o indefinido Y NO es uno de los campos de archivo, omitirlo
            // OJO: Dependiendo de tu API, puede que quieras enviar null explícitamente.
            // Mantenemos la lógica actual que omite null/undefined para otros campos.
            if (newProducto[key] !== null && newProducto[key] !== undefined) {
                if (key === 'destacados') {
                    formData.append(key, newProducto[key] ? 1 : 0);
                } else {
                    formData.append(key, newProducto[key]);
                }
            }
        });

         // Agregar archivos si son nuevos (File objects)
         ['imagen_1', 'imagen_2', 'imagen_3', 'imagen_4', 'enlace_ficha_tecnica', 'enlace_imagen_qr'].forEach(fieldName => {
            const file = newProducto[fieldName];
            if (file instanceof File) {
                formData.append(fieldName, file);
            }
         });

         // Agregar indicadores para archivos a eliminar si estamos editando
         if (editingProducto) {
            Object.keys(filesToDelete).forEach(fieldName => {
                if (filesToDelete[fieldName]) {
                    // *** MODIFICACIÓN AQUÍ ***
                    formData.append(`delete_${fieldName}`, '1'); // Enviar '1' en lugar de 'true'
                }
            });
         }

         
        try {
            let url, method;

            if (editingProducto) {
                url = `${BASE_URL_API}/api/productos/${editingProducto.id}`;
                method = 'POST'; // Laravel acepta `POST` para actualizaciones con archivos + _method
                formData.append('_method', 'PUT'); // Necesario para simular PUT en FormData
            } else {
                url = `${BASE_URL_API}/api/productos`;
                method = 'POST';
            }

            const response = await fetch(url, {
                method: method,
                body: formData,
            });

            // Intenta parsear JSON incluso si response.ok es false para obtener mensajes de error detallados
             let responseData = null;
             try {
                 responseData = await response.json();
             } catch (jsonError) {
                 console.error('Error al parsear respuesta como JSON:', jsonError);
                 // Si falla el parseo, la respuesta podría ser HTML u otro formato de error.
                 // Intentamos leerla como texto para el mensaje de error general.
                 const textError = await response.text();
                 console.error('Respuesta no-JSON:', textError);
             }


            if (!response.ok) {
                // Usa responseData si está disponible y tiene un mensaje, de lo contrario usa el estado HTTP
                 const errorMsg = responseData?.message || `HTTP error! status: ${response.status}`;
                 // Intenta mostrar errores de validación si existen
                 if (responseData?.errors) {
                     // Si hay errores de validación, úsalos directamente para el estado de error
                     // stringify con null, 2 para formato legible
                     setError(`Errores de validación: ${JSON.stringify(responseData.errors, null, 2)}`);
                 } else {
                      setError(`Error: ${errorMsg}`);
                 }
                throw new Error(`Request failed with status ${response.status}`); // Lanza un error para el catch
            }

            console.log(editingProducto ? 'Producto actualizado:' : 'Producto guardado:', responseData);

            // Limpiar el formulario y estados
            resetForm();

            setSuccess(editingProducto ? 'Producto actualizado exitosamente!' : 'Producto guardado exitosamente!');
            loadProductos(pagination.currentPage); // Recargar la página actual después de guardar/actualizar
        } catch (error) {
             // Si el error ya se estableció en el bloque if(!response.ok), no lo sobrescribimos
            // Esto ocurre cuando el error proviene del throw new Error dentro del try por un !response.ok
            // Si el error no se estableció (ej. error de red antes de la respuesta), lo establecemos aquí.
            if (!error.message || !error.message.startsWith('HTTP error! status:')) { // Verifica si el error no fue el que lanzamos nosotros
                 console.error(editingProducto ? 'Error actualizando producto (catch general):' : 'Error guardando producto (catch general):', error);
                 setError(`Error: ${error.message || 'Ocurrió un error inesperado.'}`);
             } else {
                 console.error(editingProducto ? 'Error actualizando producto (error HTTP manejado):' : 'Error guardando producto (error HTTP manejado):', error.message);
                 // El error ya fue establecido en el if(!response.ok)
             }
        } finally {
            setLoading(false);
        }
    };

    // Resetear el formulario y todos los estados relacionados
    const resetForm = () => {
        setNewProducto({
            id_categoria: '',
            id_subcategoria: '',
            id_subsubcategoria: '',
            nombre: '',
            descripcion: '',
            imagen_1: '',
            imagen_2: '',
            imagen_3: '',
            imagen_4: '',
            enlace_ficha_tecnica: '',
            texto_markdown: '',
            destacados: false,
            enlace_imagen_qr: '',
            codigo: '',
        });

        // Resetear previsualizaciones
        setImagen1Preview('');
        setImagen2Preview('');
        setImagen3Preview('');
        setImagen4Preview('');
        setFichaTecnicaPreview('');
        setImagenQRPreview('');

        // Resetear estado de archivos a eliminar
        setFilesToDelete({});

        // Limpiar la referencia al producto en edición
        setEditingProducto(null);

        // Limpiar los inputs de archivo usando las refs
        if (imagen1InputRef.current) imagen1InputRef.current.value = "";
        if (imagen2InputRef.current) imagen2InputRef.current.value = "";
        if (imagen3InputRef.current) imagen3InputRef.current.value = "";
        if (imagen4InputRef.current) imagen4InputRef.current.value = "";
        if (fichaTecnicaInputRef.current) fichaTecnicaInputRef.current.value = "";
        if (imagenQRInputRef.current) imagenQRInputRef.current.value = "";
    };

    // Editar un producto existente
    const handleEdit = (producto) => {
        setEditingProducto(producto);
        setError('');
        setSuccess('');
        setFilesToDelete({}); // IMPORTANTE: Limpiar el estado de archivos a eliminar al empezar a editar

        // Al editar, configuramos la información del producto a editar.
        // Mantenemos los campos de archivo vacíos en newProducto, las previews se llenan aparte.
        setNewProducto({
            id_categoria: producto.id_categoria || '',
            id_subcategoria: producto.id_subcategoria || '',
            id_subsubcategoria: producto.id_subsubcategoria || '',
            nombre: producto.nombre || '',
            descripcion: producto.descripcion || '',
            // Dejar los campos de archivo como string vacío o null, no como File objects
            imagen_1: '',
            imagen_2: '',
            imagen_3: '',
            imagen_4: '',
             // Si enlace_ficha_tecnica puede ser null en DB, inicializar con null
            enlace_ficha_tecnica: null, // O producto.enlace_ficha_tecnica si prefieres mantener la URL en el estado temporalmente, pero generalmente no es necesario si la preview ya la muestra. Dejar null/'' es más simple para el form data.
            texto_markdown: producto.texto_markdown || '',
            destacados: producto.destacados || false,
             // Si enlace_imagen_qr puede ser null en DB, inicializar con null
            enlace_imagen_qr: null, // Similar a ficha tecnica
            codigo: producto.codigo || '',
        });

        // **Carga las URLs de las imágenes existentes para las previsualizaciones.**
        // Asegúrate de que las URLs se construyan correctamente si son relativas.
        const buildImageUrl = (url) => url ? (url.startsWith('http') ? url : `${BASE_URL_API}${url}`) : '';

        setImagen1Preview(producto.imagen_1);
        setImagen2Preview(producto.imagen_2);
        setImagen3Preview(producto.imagen_3);
        setImagen4Preview(producto.imagen_4);
        setImagenQRPreview(producto.enlace_imagen_qr); 
        setFichaTecnicaPreview(producto.enlace_ficha_tecnica); // Mostrar URL o nombre si aplica
    };

    // Cancelar la edición
    const handleCancelEdit = () => {
        resetForm();
        setError('');
        setSuccess('');
         setFilesToDelete({}); // Asegurarse de limpiar también al cancelar
    };

    const handleDelete = async (id) => {
        await deleteResource(`${BASE_URL_API}/api/productos`,id,setLoading,setError,setSuccess,loadProductos);
        // Si el producto eliminado era el que se estaba editando, limpiar el formulario
        if(editingProducto && editingProducto.id === id){
            resetForm();
        }
    };

    // Función para manejar solicitudes con control de tasa (mantenido del código original)
    const makeRateLimitedRequest = async (url, options = {}) => {
        // Asegurarse de que hay al menos 300ms entre solicitudes
        const now = Date.now();
        const timeSinceLastRequest = now - lastRequestTimeRef.current;

        if (timeSinceLastRequest < 300) {
            await new Promise(resolve => setTimeout(resolve, 300 - timeSinceLastRequest));
        }

        lastRequestTimeRef.current = Date.now();

        try {
            const response = await fetch(url, options);

            if (response.status === 429) {
                // Extraer el tiempo de espera del encabezado Retry-After si está disponible
                const retryAfter = response.headers.get('Retry-After');
                const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 2000; // Esperar 2 segundos por defecto

                console.log(`Rate limit alcanzado. Esperando ${waitTime}ms antes de reintentar...`);

                // Esperar el tiempo indicado
                await new Promise(resolve => setTimeout(resolve, waitTime));

                // Reintentar la solicitud
                return makeRateLimitedRequest(url, options);
            }

            if (!response.ok) {
                // Intenta obtener el error del JSON response si existe
                let errorDetail = await response.text();
                 try {
                     const errorJson = JSON.parse(errorDetail);
                     if(errorJson.message) errorDetail = errorJson.message;
                     else if (errorJson.errors) errorDetail = JSON.stringify(errorJson.errors);
                 } catch(e) {
                      // Ignore JSON parsing error, use text
                 }

                throw new Error(`HTTP error! status: ${response.status} - ${errorDetail}`);
            }

            return response.json();
        } catch (error) {
            console.error('Error en la solicitud rate-limited:', error);
            throw error; // Re-lanzar para que el llamador pueda manejarlo
        }
    };

    // Efecto para manejar la búsqueda con debounce (mantenido del código original)
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        const delayDebounceFn = setTimeout(() => {
            if (searchTerm) {
                searchProductos(searchTerm);
            } else if (isSearching) {
                // Si el término de búsqueda se vacía después de buscar, recargar productos paginados
                setIsSearching(false);
                 loadProductos(pagination.currentPage); // Recargar productos normales al borrar la búsqueda
            }
             // Si searchTerm está vacío y no estábamos buscando, no hacemos nada
        }, 500);

        searchTimeoutRef.current = delayDebounceFn; // Guardar la referencia del timeout

        return () => {
             // Limpiar el timeout anterior si el searchTerm cambia antes de que se dispare
             if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchTerm, isSearching]); // Agregar isSearching como dependencia

    // Obtener el nombre de la categoría por ID
    const getCategoriaName = (id) => {
        const categoria = categorias.find(cat => cat.id === id);
        return categoria ? categoria.nombre : 'No asignada'; // Default text
    };

    // Obtener el nombre de la subcategoría por ID
    const getSubcategoriaName = (id) => {
         // Debemos buscar la subcategoría dentro de las subcategorías de la categoría seleccionada
         const selectedCategoria = categorias.find(cat => cat.id === parseInt(newProducto.id_categoria));
         const subcategoria = selectedCategoria?.subcategorias.find(subcat => subcat.id === id);
         return subcategoria ? subcategoria.nombre : ''; // Empty string if not found or no category selected
    };

    // Obtener el nombre de la subsubcategoría por ID
    const getSubsubcategoriaName = (id) => {
         // Debemos buscar la subsubcategoría dentro de las subsubcategorías de la subcategoría seleccionada
         const selectedCategoria = categorias.find(cat => cat.id === parseInt(newProducto.id_categoria));
         const selectedSubcategoria = selectedCategoria?.subcategorias.find(subcat => subcat.id === parseInt(newProducto.id_subcategoria));
         const subsubcategoria = selectedSubcategoria?.subsubcategorias.find(subsubcat => subsubcat.id === id);
         return subsubcategoria ? subsubcategoria.nombre : ''; // Empty string if not found or no subcategory selected
    };


    // Función mejorada para buscar productos
    const searchProductos = async (query) => {
        if (!query.trim() || query.trim().length < 3) {
             // Si la búsqueda se limpia o es muy corta, volver a cargar los productos paginados normales
             if(isSearching) { // Solo si estábamos buscando
                 setIsSearching(false);
                 loadProductos(pagination.currentPage);
             }
            return;
        }

        setLoading(true);
        setIsSearching(true);
        setError('');

        try {
            // Usamos makeRateLimitedRequest para la búsqueda también
            const data = await makeRateLimitedRequest(`${BASE_URL_API}/api/products/complete-search?query=${encodeURIComponent(query)}`);

            if (data && Array.isArray(data)) {
                setProductos(data);
            } else {
                 // Si la API no devuelve un array, considera que no hay resultados
                setProductos([]);
            }

            // Reseteamos la paginación durante la búsqueda (no aplica paginación a los resultados de búsqueda)
            setPagination({
                ...pagination,
                currentPage: 1, // La búsqueda no tiene páginas en esta implementación
                totalPages: 1,
            });
        } catch (error) {
            console.error('Error searching productos:', error);
            setError('Error al buscar productos. Por favor, intenta nuevamente en unos momentos.');
             setProductos([]); // Limpiar productos en caso de error de búsqueda
              setPagination({ // Reset pagination on search error
                ...pagination,
                currentPage: 1,
                totalPages: 1,
            });
        } finally {
            setLoading(false);
        }
    };

    // Función para manejar el cambio en el input de búsqueda
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Función para limpiar la búsqueda
    const clearSearch = () => {
        setSearchTerm('');
        // El useEffect dependiente de searchTerm y isSearching manejará la recarga de productos paginados
    };

    const [selectedRowId, setSelectedRowId] = useState(null);

    const handleEditarFilaEstilo = (idFila, item) => {
         // Si la fila seleccionada es la misma, la deseleccionamos
        if (selectedRowId === idFila) {
            setSelectedRowId(null);
             resetForm(); // Resetear el formulario si se deselecciona la fila
        } else {
             window.scrollTo({ top: 0, behavior: 'smooth' });
             setSelectedRowId(idFila);
             handleEdit(item); // Cargar los datos del producto en el formulario
        }
    };

    // Array de campos de archivo para iterar fácilmente
    const fileFields = [
        { name: 'imagen_1', preview: imagen1Preview, setPreview: setImagen1Preview, ref: imagen1InputRef, label: 'Imagen 1' },
        { name: 'imagen_2', preview: imagen2Preview, setPreview: setImagen2Preview, ref: imagen2InputRef, label: 'Imagen 2' },
        { name: 'imagen_3', preview: imagen3Preview, setPreview: setImagen3Preview, ref: imagen3InputRef, label: 'Imagen 3' },
        { name: 'imagen_4', preview: imagen4Preview, setPreview: setImagen4Preview, ref: imagen4InputRef, label: 'Imagen 4' },
        { name: 'enlace_ficha_tecnica', preview: fichaTecnicaPreview, setPreview: setFichaTecnicaPreview, ref: fichaTecnicaInputRef, label: 'Ficha técnica (PDF/DOC)', isFile: true },
        { name: 'enlace_imagen_qr', preview: imagenQRPreview, setPreview: setImagenQRPreview, ref: imagenQRInputRef, label: 'Imagen QR', isQR: true, isHidden: true }, // Ocultamos este campo
    ];


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
        <h2 className='mt-4 mb-3'>Administrador Productos</h2>
        {/* Buscador de productos */}
        <div className="mb-4">
            <div className="input-group">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar producto por nombre..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    aria-label="Buscar producto"
                />
                {/* Mostrar botón de limpiar solo si hay término de búsqueda */}
                {searchTerm && (
                    <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={clearSearch}
                        disabled={loading} // Deshabilitar durante la carga si aplica a la búsqueda
                    >
                        Limpiar
                    </button>
                )}
            </div>
            {isSearching && <small className="text-muted">Mostrando resultados para: "{searchTerm}"</small>}
        </div>

        {loading && <p>Cargando...</p>}
        <div className={styles.contenedor_total_administrador}>
        <div className={styles.contenedor_registros}>
                <table className="table table-striped table-responsive align-midle">
                    <thead className="table-dark">
                        <tr>
                            <th scope="col" style={{width: "50px"}}>Código</th>
                            <th scope="col" style={{width: "150px"}}>Nombre</th>
                            <th scope="col" style={{width: "50px"}}>Categoría</th>
                            <th scope="col" style={{width: "80px"}}>Imagen</th>
                            <th scope="col" style={{width: "10px"}}>Dest</th>
                            <th scope="col" style={{width: "50px"}}>Acciones</th>
                            <th scope="col" style={{width: "80px"}}>QR</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productos.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ border: '1px solid #ddd', textAlign: 'center' }}>
                                    {isSearching
                                         ? `No se encontraron productos con el término "${searchTerm}"`
                                         : 'No hay productos disponibles'}
                                </td>
                            </tr>
                        ) : (
                            productos.map((producto) => (
                            <tr key={producto.id}
                                className={`${selectedRowId === producto.id ? styles.selected : ''} ${loading ? styles.disabled_row : ''}`} // Deshabilitar clics si está cargando
                                onClick={() => !loading && handleEditarFilaEstilo(producto.id, producto)} // Deshabilitar clic si está cargando
                                style={{ cursor: loading ? 'not-allowed' : 'pointer' }} // Cambiar cursor
                            > {/* Aplica la clase condicionalmente */}
                                <TableData>{producto.codigo}</TableData>
                                {/* Usar el link_to solo si el producto tiene id, y si no estamos editando/cargando */}
                                <TableData link_to={!editingProducto && !loading && producto.id ? `/productos/producto/${producto.id}` : null}>
                                     {producto.nombre}
                                </TableData>
                                <TableData list={[
                                    producto.id_categoria ? getCategoriaName(producto.id_categoria) : 'No asignada',
                                    producto.id_subcategoria ? getSubcategoriaName(producto.id_subcategoria) : '',
                                    producto.id_subsubcategoria ? getSubsubcategoriaName(producto.id_subsubcategoria) : '',
                                ]}/>
                                <TableData image_src={getFullUrl(producto.imagen_1)}>{producto.nombre}</TableData> 
                                <TableData>{producto.destacados ? '✓' : '✗'}</TableData>
                                <TableDataActions item={producto} handleEdit={handleEdit} handleDelete={handleDelete} loading={loading} handleEditarFila={handleEditarFilaEstilo} />
                                <TableData image_src={producto.enlace_imagen_qr}>{producto.nombre}</TableData>
                            </tr>
                            ))
                        )}
                        </tbody>
                </table>

                {/* Componente de paginación (solo se muestra cuando no estamos buscando y hay más de una página) */}
                {!isSearching && pagination.totalPages > 1 && (
                    <div className="pagination d-flex justify-content-center my-4">
                        {/* Botón para ir a la primera página */}
                         <button
                            onClick={() => handlePageChange(1)}
                            className={`btn btn-outline-primary mx-1`}
                            disabled={pagination.currentPage === 1 || loading}
                         >
                            Primera
                        </button>
                         {/* Botón para ir a la página anterior */}
                         <button
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            className={`btn btn-outline-primary mx-1`}
                            disabled={pagination.currentPage <= 1 || loading}
                         >
                            Anterior
                        </button>

                        {/* Mostrar hasta 5 páginas centradas alrededor de la página actual */}
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                             .filter(page => page >= Math.max(1, pagination.currentPage - 2) && page <= Math.min(pagination.totalPages, pagination.currentPage + 2))
                             .map(page => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`btn ${pagination.currentPage === page ? 'btn-primary' : 'btn-outline-primary'} mx-1`}
                                disabled={loading}
                            >
                                {page}
                            </button>
                        ))}

                         {/* Botón para ir a la página siguiente */}
                         <button
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            className={`btn btn-outline-primary mx-1`}
                            disabled={pagination.currentPage >= pagination.totalPages || loading}
                         >
                            Siguiente
                        </button>
                         {/* Botón para ir a la última página */}
                         <button
                            onClick={() => handlePageChange(pagination.totalPages)}
                            className={`btn btn-outline-primary mx-1`}
                            disabled={pagination.currentPage === pagination.totalPages || loading}
                         >
                            Última
                        </button>
                    </div>
                )}
            </div>
            <div className={styles.contenedor_formulario}>
                 {/* Título del formulario basado en si se está editando o creando */}
                <h3 className="mt-3">{editingProducto ? 'Editar Producto' : 'Crear Nuevo Producto'}</h3>

                <form className="row grid gap-0 row-gap-3 my-3" onSubmit={handleSubmit} encType="multipart/form-data">

                    <h3 className="mt-3">Información</h3>

                    <div className="col-12">
                        <div className="input-group">
                            <span className="input-group-text" id="nombre-label">Nombre</span>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={newProducto.nombre}
                                onChange={handleInputChange}
                                required
                                disabled={loading} // Deshabilitar inputs mientras carga/procesa

                                className="form-control"
                                placeholder="Nombre del producto"
                                aria-label="Nombre"
                                aria-describedby="nombre-label"
                            />
                        </div>
                    </div>

                    <div className="col-12">
                        <div className="input-group">
                            <span className="input-group-text" id="codigo-label">Código</span>
                            <input
                                id="codigo"
                                name="codigo"
                                value={newProducto.codigo || ''}
                                onChange={handleInputChange}
                                disabled={loading}

                                className="form-control"
                                placeholder="Código único"
                                aria-label="Código"
                                aria-describedby="codigo-label"
                            />
                        </div>
                    </div>

                    <div className="col-12 fw-bold">
                        <label htmlFor="descripcion" className="form-label">Descripción</label><br />
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            value={newProducto.descripcion || ''}
                            onChange={handleInputChange}
                            disabled={loading}

                            className="form-control"
                            rows="4"
                            placeholder="Descripción del producto"
                        />
                    </div>

                    <h3 className="mt-3">Imágenes</h3>

                    {/* Mapeo de campos de archivo para generar dinámicamente */}
                     {fileFields.map(field => (
                        // Ocultar campos marcados como hidden (como el QR)
                        !field.isHidden && (
                            <div className={`col-${field.isFile ? '12' : '6'}`} key={field.name}> {/* Ficha técnica ocupa ancho completo */}
                                <div className="mb-3"> {/* Añadir margen inferior */}
                                     <label htmlFor={field.name} className="form-label fw-bold">{field.label}</label>
                                     <div className="input-group">
                                        <input
                                            type="file"
                                            id={field.name}
                                            name={field.name}
                                            onChange={handleFileChange}
                                            disabled={loading || filesToDelete[field.name]} // Deshabilitar si está cargando o marcado para eliminar
                                            accept={field.isFile ? ".pdf,.doc,.docx" : "image/*"} // Aceptar tipos de archivo específicos
                                            ref={field.ref} // Asociar la referencia

                                            className="form-control"
                                            aria-describedby={`${field.name}-addon`}
                                            aria-label={`Subir ${field.label}`}
                                        />
                                         {/* Botón de eliminar - Mostrar solo si hay preview Y no está ya marcado para borrar */}
                                         {field.preview && !filesToDelete[field.name] && editingProducto && (
                                             <button
                                                 className="btn btn-outline-danger"
                                                 type="button"
                                                 onClick={() => handleDeleteFile(field.name)}
                                                 disabled={loading}
                                                 title={`Eliminar ${field.label}`} // Añadir tooltip
                                             >
                                                Eliminar
                                             </button>
                                         )}
                                    </div>
                                    {/* Área de previsualización */}
                                    {field.preview && (
                                        <div className="mt-2"> {/* Añadir margen superior */}
                                             {field.isFile ? (
                                                 // Previsualización para archivos (link)
                                                <div>
                                                     Documento actual: <a href={field.preview} target="_blank" rel="noopener noreferrer">{field.preview.split('/').pop()}</a> {/* Mostrar solo el nombre del archivo si es URL */}
                                                </div>
                                            ) : (
                                                 // Previsualización para imágenes
                                                <div>
                                                    <p>Imagen actual:</p>
                                                    <img
                                                        src={field.preview}
                                                        alt={`Vista previa ${field.label}`}
                                                        style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain' }} // Usar object-fit para mantener aspecto
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {/* Mostrar mensaje si marcado para eliminar */}
                                     {filesToDelete[field.name] && (
                                        <div className="mt-2 text-danger">
                                             Archivo marcado para eliminar. Guarde para confirmar.
                                        </div>
                                     )}
                                </div>
                            </div>
                        )
                     ))}


                    <h3 className="mt-3">Sección</h3>

                    <div className="col-12">
                        <div className="input-group">
                            <label htmlFor="id_categoria" className="input-group-text">Categoría</label>
                            <select
                                id="id_categoria"
                                name="id_categoria"
                                value={newProducto.id_categoria}
                                onChange={handleInputChange}
                                disabled={loading} // Deshabilitar mientras carga/procesa

                                className="form-select"
                                required // Asumiendo que la categoría es requerida
                            >
                                <option value="">Seleccione una categoría</option>
                                {categorias.map(categoria => (
                                    <option key={categoria.id} value={categoria.id}>
                                        {categoria.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="col-12">
                        <div className="input-group">
                            <label htmlFor="id_subcategoria" className="input-group-text" >Subcategoría</label>
                            <select
                                id="id_subcategoria"
                                name="id_subcategoria"
                                value={newProducto.id_subcategoria}
                                onChange={handleInputChange}
                                disabled={loading || !newProducto.id_categoria} // Deshabilitar si carga o no hay categoría seleccionada

                                className="form-select"
                            >
                                <option value="">Seleccione una subcategoría</option>
                                {subcategorias.map(subcategoria => (
                                    <option key={subcategoria.id} value={subcategoria.id}>
                                        {subcategoria.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="col-12">
                        <div className="input-group">
                            <label htmlFor="id_subsubcategoria" className="input-group-text" >Subsubcategoría</label>

                            <select
                            id="id_subsubcategoria"
                            name="id_subsubcategoria"
                            value={newProducto.id_subsubcategoria}
                            onChange={handleInputChange}
                            disabled={loading || !newProducto.id_subcategoria} // Deshabilitar si carga o no hay subcategoría seleccionada

                            className="form-select"
                            >
                                <option value="">Seleccione una subsubcategoría</option>
                                {subsubcategorias.map(subsubcategoria => (
                                    <option key={subsubcategoria.id} value={subsubcategoria.id}>
                                        {subsubcategoria.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <h3 className="mt-3">Otros</h3>

                    <div className="col-12 fw-bold">
                        <label htmlFor="texto_markdown" className="form-label">Texto Markdown (opcional):</label><br />
                        <textarea
                            id="texto_markdown"
                            name="texto_markdown"
                            value={newProducto.texto_markdown || ''}
                            onChange={handleInputChange}
                            disabled={loading}

                            className="form-control"
                            rows="6"
                            placeholder="Contenido en formato Markdown"
                        />
                    </div>

                    <div className="col-3">
                        <div className="form-check">
                            <input
                                type="checkbox"
                                id="destacados"
                                name="destacados"
                                checked={newProducto.destacados}
                                onChange={handleInputChange}
                                disabled={loading}

                                className="form-check-input"
                            />
                            <label className="form-check-label" htmlFor="destacados"> {/* Usar htmlFor */}
                                Destacado
                            </label>
                        </div>
                    </div>


                    {/* Botones de acción */}
                    <div className="col-4 me-3">
                        {editingProducto && ( // Mostrar "Cancelar Edición" solo si se está editando
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                disabled={loading} // Deshabilitar mientras carga/procesa
                                className="btn btn-danger w-100 "
                            >
                                Cancelar Edición
                            </button>
                        )}
                    </div>

                    <div className="col-4">
                        <button
                            type="submit"
                            disabled={loading} // Deshabilitar mientras carga/procesa
                            className="btn btn-primary w-100"
                        >
                            {loading ? 'Procesando...' : (editingProducto ? 'Actualizar Producto' : 'Crear Producto')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
        </>
    );
};

export default AdminProductos;