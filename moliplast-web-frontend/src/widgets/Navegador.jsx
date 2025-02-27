import { Link, useLocation } from 'react-router-dom';
import styles from '../assets/styles/estilos_navegador.module.scss'
import { Icono_Facebook_Colores, Icono_Whatsapp_Colores } from '../assets/imgs/iconos/svg/Redes_Sociales';

import React, { useState, useEffect } from 'react';

//import dataPaginas from '../data/data_paginas'
import { MdEmail } from "react-icons/md";
import { IoCall } from "react-icons/io5";
import { FaSearch } from "react-icons/fa";
import { TiThMenu } from "react-icons/ti";

import { Logo_Moliplast } from '../assets/imgs/iconos/svg/Logo_Moliplast';

import { InputButton } from './Form';

import axios from 'axios'; // Importar axios

// Definir dataPaginas directamente en el archivo
const dataPaginas = {
    data: [
        { 
            nombre: "Inicio", 
            enlace: "/"
        },
        { 
            nombre: "Nosotros", 
            enlace: "/nosotros"
        },
        { 
            nombre: "Productos", 
            subsecciones: [] 
        },
        { 
            nombre: "Servicios", 
            enlace: "/servicios",
        },
        { 
            nombre: "Catálogos", 
            enlace: "/catalogos"
        },
        { 
            nombre: "Contacto", 
            enlace: "/contacto"
        }
    ]
};


const Navegador = () => {

    const [data, setData] = useState(dataPaginas.data);

    // Consulta a la API para obtener las categorías
    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/categorias-con-subcategorias');
                const categorias = response.data; // Suponiendo que la API devuelve un array de categorías

                // Mapear las categorías para que coincidan con el formato de subsecciones
                const subsecciones = categorias.map(categoria => ({
                    nombre: categoria.nombre, // Nombre de la categoría
                    enlace: `/productos/${categoria.nombre}` // Enlace dinámico
                }));

                // Actualizar las subsecciones de "Productos"
                const newData = data.map(seccion => {
                    if (seccion.nombre === "Productos") {
                        return { ...seccion, subsecciones: subsecciones };
                    }
                    return seccion;
                });

                setData(newData); // Actualizar el estado con los nuevos datos
            } catch (error) {
                console.error("Error al obtener las categorías:", error);
            }
        };

        fetchCategorias(); // Llamar a la función para obtener los datos
    }, []); // El efecto se ejecuta solo una vez al montar el componente

    const [subseccion_abierta, setSubseccionAbierta] = useState(null);
    const toggleSubseccion = (index) => {
        setSubseccionAbierta(prevIndex => (prevIndex === index ? null : index));
    };

    const [navegador_movil_activo, setNavegadorMovilActivo] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setNavegadorMovilActivo(false)
    },[location]);

    const [scrolling, setScrolling] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 80) {
                setScrolling(true);
            } else {
                setScrolling(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        // Limpiar el evento cuando el componente se desmonte
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [location.pathname]); // El efecto solo se ejecuta una vez al montar el componente

    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    useEffect(() => {
        if (query.length > 2) { // Solo busca si el usuario ha escrito más de 2 caracteres
            axios.get(`http://127.0.0.1:8000/api/products/search?query=${query}`)
                .then(response => {
                    setResults(response.data);
                })
                .catch(error => {
                    console.error('Error fetching products', error);
                });
        } else {
            setResults([]); // Limpia los resultados si el query es muy corto
        }
    }, [query]);

    return (
        <>
            <div className={styles.cont_navegador}>
                <header className={scrolling ? styles['reducida'] : ''}>
                    <Link to='/' className={styles.cont_logo}>
                        <Logo_Moliplast logo="principal" className={styles.logo_front}/>
                        <Logo_Moliplast logo="secundario" className={styles.logo_back}/>
                    </Link>
                    <div className={styles.cont_contacto}>
                        <div>
                            <IoCall />
                            <p>Contáctanos</p>
                            <p>054 462917 | +51&nbsp;959&nbsp;600&nbsp;464</p>
                        </div>

                        <div>
                            <MdEmail/>
                            <p>Correo Electrónico</p>
                            <p>ventas1@moliplast.com</p>
                        </div>
                    </div>
                    <div className={styles.cont_redes_sociales}>
                        <a href="https://www.facebook.com/moliplast.com.pe" target="_blank" className={styles.facebook_enlace}>
                            <Icono_Facebook_Colores/>
                        </a>
                        <a href="https://api.whatsapp.com/send/?phone=%2B51959600464&text=Hola%2C+estoy+interesado+en+...&type=phone_number&app_absent=0" target="_blank" className={styles.whatsapp_enlace}>
                            <Icono_Whatsapp_Colores />
                        </a>
                    </div>
                    <button onClick={() => setNavegadorMovilActivo(!navegador_movil_activo)} className={styles.cont_boton_hamburguesa}>
                        <TiThMenu />
                    </button>
                </header>
                <nav>
                    {/* Este es el ul de una pantalla de monitor */}
                    <ul className={`${styles.cont_lista_enlaces}`}>
                        {data.map((seccion, index) => (
                            <li key={index}>
                                {!seccion.subsecciones ? (
                                    <Link to={seccion.enlace}>{seccion.nombre}</Link>
                                ) : (
                                    <>
                                    <Link 
                                        to={seccion.enlace}
                                        onMouseEnter={() => toggleSubseccion(index)}
                                        onMouseLeave={() => toggleSubseccion(index)}
                                    >
                                        {seccion.nombre} 
                                    </Link>
                                    <ul 
                                        className={`${subseccion_abierta === index ? styles.mostrar : styles.ocultar}`}
                                        onMouseEnter={() => toggleSubseccion(index)}
                                        onMouseLeave={() => toggleSubseccion(index)}
                                    >
                                        {seccion.subsecciones.map((subseccion,subIndex) => (
                                            <li key={subIndex}><Link to={subseccion.enlace} >{subseccion.nombre}</Link></li>
                                        ))}
                                    </ul>
                                    </>
                                )}
                                
                            </li>
                        ))}
                    </ul>

                    {/* Este es el ul responsivo */}
                    <ul className={`${styles.cont_lista_enlaces_movil} ${navegador_movil_activo ? styles.mostrar : styles.ocultar}`}>
                    {data.map((seccion, index) => (
                            <li key={index}>
                                {!seccion.subsecciones ? (
                                    <Link to={seccion.enlace}>{seccion.nombre}</Link>
                                ) : (
                                    <>
                                    <div>
                                        <Link 
                                            to={seccion.enlace}
                                            className={subseccion_abierta === index ? styles.flecha_despliegue_abierto : styles.flecha_despliegue_cerrado} 
                                        >
                                            {seccion.nombre} 
                                        </Link>
                                        <button onClick={() => toggleSubseccion(index)}>{subseccion_abierta === index ? "▲" : "▼"}</button>
                                    </div>
                                    
                                    <ul 
                                        className={`${subseccion_abierta === index ? styles.mostrar : styles.ocultar}`}
                                    >
                                        {seccion.subsecciones.map((subseccion,subIndex) => (
                                            <li key={subIndex}><Link to={subseccion.enlace}>{subseccion.nombre}</Link></li>
                                        ))}
                                    </ul>
                                    </>
                                )}
                                
                            </li>
                        ))}
                    </ul>

                    <div className={styles.cont_busqueda_tiempo_real}>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar productos..."
                    />
                        <ul>
                        {results.map(product => (
                            <li key={product.id}><Link to={`/productos/producto/${product.id}`}>{product.nombre}</Link></li>
                        ))}
                        </ul>
                    </div>
                </nav>
            </div>
    
            <div className={styles.espacio_nav}></div>
        </>
    );
}

export default Navegador;