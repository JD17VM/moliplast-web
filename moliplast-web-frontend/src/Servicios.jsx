import React, { useState, useEffect } from 'react';
import styles from './assets/styles/estilos_servicios.module.scss';
import { getFullUrl } from "./utils/utils.js"
import MetaData from './widgets/Metadata'

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

const Servicio = ({ titulo, descripcion, imagen }) => {
    return (
        <article>
            <div>
                <h2>{titulo}</h2>
                <p>{descripcion}</p>
            </div>
            <img src={imagen} alt={titulo} />
        </article>
    );
};

const Servicios = () => {
    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadServicios();
    }, []);

    const loadServicios = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${BASE_URL_API}/api/servicios`);
            
            // Esta única comprobación maneja TODOS los errores HTTP (404, 500, 401, etc.)  
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setServicios(data);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Error al cargar los servicios. Por favor, intenta nuevamente.');
            setServicios([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        <MetaData title='Servicios' canonical="/servicios"/>
        <div className={styles.contenedor_servicios} data-aos="fade-up">
            <h1>Servicios</h1>
            
            {error && (
                <div style={{ background: '#ffebee', color: '#c62828', padding: '10px', marginBottom: '15px', borderRadius: '4px' }}>
                    {error}
                </div>
            )}
            
            {loading ? (
                <p>Cargando servicios...</p>
            ) : (
                servicios.length === 0 ? (
                    <p>No hay servicios disponibles</p>
                ) : (
                    servicios.map((servicio) => (
                        <Servicio 
                            key={servicio.id}
                            titulo={servicio.titulo}
                            descripcion={servicio.descripcion}
                            imagen={getFullUrl(servicio.enlace_imagen)}
                        />
                    ))
                )
            )}
        </div>
        </>
    );
};

export default Servicios;