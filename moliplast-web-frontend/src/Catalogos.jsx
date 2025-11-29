import React, { useState, useEffect } from 'react';
import styles from './assets/styles/estilos_catalogos.module.scss';
import { getFullUrl } from "./utils/utils.js"
import MetaData from './widgets/Metadata'

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

const Catalogos = () => {
    const [catalogos, setCatalogos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [categorias, setCategorias] = useState([]);

    useEffect(() => {
        loadCatalogos();
        loadCategorias();
    }, []);

    const loadCatalogos = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${BASE_URL_API}/api/catalogos`);
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setCatalogos(data);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Error al cargar los catálogos. Por favor, intenta nuevamente.');
            setCatalogos([]);
        } finally {
            setLoading(false);
        }
    };

    const loadCategorias = async () => {
        try {
            const response = await fetch(`${BASE_URL_API}/api/categorias`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setCategorias(data);
        } catch (error) {
            console.error('Error fetching categorias:', error);
        }
    };

    const getCatalogosPorCategoria = () => {
        const grupos = {};
        
        // Crear grupo por cada categoría
        categorias.forEach(categoria => {
            grupos[categoria.id] = {
                nombre: categoria.nombre,
                catalogos: []
            };
        });
        
        // Grupo especial para sin categoría
        grupos['sin_categoria'] = {
            nombre: 'Sin categoría',
            catalogos: []
        };
        
        // Distribuir catálogos
        catalogos.forEach(catalogo => {
            if (catalogo.id_categoria && grupos[catalogo.id_categoria]) {
                grupos[catalogo.id_categoria].catalogos.push(catalogo);
            } else {
                grupos['sin_categoria'].catalogos.push(catalogo);
            }
        });
        
        return grupos;
    };

    const gruposCatalogos = getCatalogosPorCategoria();

    return (
        <>
        <MetaData title='Catálogos' canonical="/catalogos"/>
        <div className={styles.cont_seccion_catalogos} data-aos="fade-up">
            <h1>Catálogos</h1>
            
            {error && (
                <div style={{ background: '#ffebee', color: '#c62828', padding: '10px', marginBottom: '15px', borderRadius: '4px' }}>
                    {error}
                </div>
            )}

            {/* Mostrar grupos de categorías */}
            {categorias.map(categoria => {
                const grupo = gruposCatalogos[categoria.id];
                
                // Solo mostrar si tiene catálogos
                if (!grupo || grupo.catalogos.length === 0) return null;
                
                return (
                    <div key={categoria.id} className={styles.cont_categoria_catalogo}>
                        <h2>{grupo.nombre}</h2>
                        <div>
                            {grupo.catalogos.map((catalogo) => (
                                <a 
                                    key={catalogo.id}
                                    href={getFullUrl(catalogo.enlace_documento)} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                >
                                    <img 
                                        src={getFullUrl(catalogo.enlace_imagen_portada)} 
                                        alt={catalogo.nombre} 
                                        title={catalogo.nombre}
                                    />
                                </a>
                            ))}
                        </div>
                    </div>
                );
            })}

            {/* Mostrar catálogos sin categoría al final */}
            {gruposCatalogos['sin_categoria'] && gruposCatalogos['sin_categoria'].catalogos.length > 0 && (
                <div className={styles.cont_categoria_catalogo}>
                    <h2>Sin categoría</h2>
                    <div>
                        {gruposCatalogos['sin_categoria'].catalogos.map((catalogo) => (
                            <a 
                                key={catalogo.id}
                                href={getFullUrl(catalogo.enlace_documento)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                            >
                                <img 
                                    src={getFullUrl(catalogo.enlace_imagen_portada)} 
                                    alt={catalogo.nombre} 
                                    title={catalogo.nombre}
                                />
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
        </>
    );
};

export default Catalogos;