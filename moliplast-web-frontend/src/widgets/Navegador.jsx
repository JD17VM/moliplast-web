import { Link, useLocation } from 'react-router-dom';
import styles from '../assets/styles/estilos_navegador.module.scss'
import { Icono_Facebook_Colores, Icono_Whatsapp_Colores } from '../assets/imgs/iconos/svg/Redes_Sociales';

import { convertirATitulo } from "../utils/utils.js"

import React, { useState, useEffect } from 'react';

//import dataPaginas from '../data/data_paginas'
import { MdEmail } from "react-icons/md";
import { IoCall } from "react-icons/io5";
import { FaSearch } from "react-icons/fa";
import { TiThMenu } from "react-icons/ti";

import { Logo_Moliplast } from '../assets/imgs/iconos/svg/Logo_Moliplast';
import { debounce } from 'lodash';

import { InputBuscador } from './Form';
import LogoutButton  from '../Administrador/LogoutButton'

import axios from 'axios'; // Importar axios

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;
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
        },
    ]
};


const Navegador = ({ isAdmin, setIsAdmin }) => {

    const dataAdmin = [
        { nombre: "Admin Productos", enlace: "/administrador/productos" },
        { nombre: "Admin Catalogos", enlace: "/administrador/catalogos" },
        { nombre: "Admin Servicios", enlace: "/administrador/servicios" },
        {
            nombre: "Admin Categorías",
            subsecciones: [
                { nombre: "Categorias", enlace: "/administrador/categorias" },
                { nombre: "Subcategorias", enlace: "/administrador/subcategorias" },
                { nombre: "Subsubcategorias", enlace: "/administrador/subsubcategorias" },
            ]
        },
    ];

    const location = useLocation();
    const [data, setData] = useState(isAdmin ? dataAdmin : dataPaginas.data);

    // Definiendo dataAdmin antes de usarlo.
    
    useEffect(() => {
        if (isAdmin) {
            setData(dataAdmin);
        } else {
            const fetchCategorias = async () => {
                try {
                    const response = await axios.get(`${BASE_URL_API}/api/categorias-con-subcategorias`);
                    const categorias = response.data;
                    const subsecciones = categorias.map(categoria => ({
                        nombre: categoria.nombre,
                        enlace: `/productos/${categoria.nombre}`
                    }));
                    const newData = dataPaginas.data.map(seccion => {
                        if (seccion.nombre === "Productos") {
                            return { ...seccion, subsecciones: subsecciones };
                        }
                        return seccion;
                    });
                    setData(newData);
                } catch (error) {
                    console.error("Error al obtener las categorías:", error);
                }
            };
            fetchCategorias();
        }
    }, [isAdmin]);

    const [subseccion_abierta, setSubseccionAbierta] = useState(null);
    const toggleSubseccion = (index) => {
        setSubseccionAbierta(prevIndex => (prevIndex === index ? null : index));
    };

    const [navegador_movil_activo, setNavegadorMovilActivo] = useState(false);

    useEffect(() => {
        setNavegadorMovilActivo(false);
    }, [location]);

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
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [location.pathname]);

    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    useEffect(() => {
        // Limpiar el input cuando la ruta cambia
        setQuery('');
        setResults([]);
    }, [location.pathname])

    const debouncedSearch = debounce((searchQuery) => {
        if (searchQuery.length > 2) {
            axios.get(`${BASE_URL_API}/api/products/search?query=${searchQuery}`)
                .then(response => {
                    setResults(response.data);
                })
                .catch(error => {
                    console.error('Error fetching products', error);
                });
        } else {
            setResults([]);
        }
    }, 300);

    useEffect(() => {
        debouncedSearch(query);
        return () => debouncedSearch.cancel();
    }, [query]);

    return (
        <>
            <div className={`${styles.cont_navegador} ${isAdmin? styles.admin : ''}`}>
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
                            <ul>
                                <li>ventas1@moliplast.com</li>
                                <li>ventas09@moliplast.com</li>
                            </ul>
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
                <nav className=''>
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
                                            <li key={subIndex}><Link to={subseccion.enlace} >{convertirATitulo(subseccion.nombre)}</Link></li>
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
                    
                    {!isAdmin? (
                        <div className={styles.cont_busqueda_tiempo_real}>
                        <InputBuscador
                            placeholder="Buscar productos"
                            Icono={FaSearch}
                            value={query} // Pasar el valor del estado `query`
                            onChange={(e) => setQuery(e.target.value)} // Manejar cambios
                            autocomplete="off"
                        />
                            <ul>
                                {Array.isArray(results) && results.length > 0 ? (
                                    results.map(product => (
                                        <li key={product.id}>
                                            <Link to={`/productos/producto/${product.id}`}>{product.nombre}</Link>
                                        </li>
                                    ))
                                ) : (
                                    query.length > 2 && <li><p>No se encontraron productos</p></li>
                                )}
                            </ul>
                        </div>
                    ):(
                        <div>
                            <LogoutButton setIsAdmin={setIsAdmin} />
                        </div>
                    )
                    }
                </nav>
            </div>
    
            <div className={styles.espacio_nav}></div>
        </>
    );
}

export default Navegador;