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

    useEffect(() => {
        loadCatalogos();
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
            <div className={styles.cont_catalogos}>
            {loading ? (
                <>
                    <a> <Skeleton height="100%"/> </a>
                    <a> <Skeleton height="100%"/> </a>
                    <a> <Skeleton height="100%"/> </a>
                </>
            ) : (
                <>
                    {catalogos.length === 0 ? (
                        <p>No hay catálogos disponibles</p>
                    ) : (
                        catalogos.map((catalogo) => (
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
                        ))
                    )}
                </>
            )}
            </div>
        </div>
        </>
    );
};

export default Catalogos;