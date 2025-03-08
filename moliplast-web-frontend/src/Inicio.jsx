import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

import styles from './assets/styles/estilos_inicio.module.scss'
import imageHelper from './utils/imageHelper.js'

import SliderImgs from './widgets/SliderImgs';

import CarruselImgs from './widgets/CarruselImgs';
import { convertirATitulo } from "./utils/utils.js"

import SliderProductos from './widgets/SliderProductos';

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

export const ContenedorSeccion = (props) => {
    let claseFondo = ""
    if(props.color_fondo === "negro"){
        claseFondo = styles.fondo_negro;
    }else if(props.color_fondo === "blanco"){
        claseFondo = styles.fondo_blanco;
    }
    return(
        <div className={`${styles.contenedor_seccion} ${claseFondo}`}>
            <h2>{props.titulo}</h2>
            {props.children}
        </div>
    )
}


const TipoProducto = ({imagen, texto}) => {
    return (
        <Link to={`/productos/${texto}`}
            className={styles.cont_tipo_producto} 
            style={{
                backgroundImage: `url(${imagen})`,
            }}
        >
            <p>{texto}</p>
        </Link>
    )
}

const LineaDeProductos = () => {

    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadCategorias();
    }, []);

    // Función para construir la URL completa
    const getFullUrl = (path) => {
        if (!path) return '';
        return path.startsWith('http') ? path : `${BASE_URL_API}${path}`;
    };

    const loadCategorias = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${BASE_URL_API}/api/categorias`);
            
            if (response.status === 404) {
                console.log('No hay categorias disponibles');
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
            console.error('Error fetching data:', error);
            setError('Error al cargar los categorias. Por favor, intenta nuevamente.');
            setCategorias([]);
        } finally {
            setLoading(false);
        }
    };

    // Función para construir la URL completa de la imagen
    const getFullImageUrl = (path) => {
        if (!path) return '';
        return path.startsWith('http') ? path : `${BASE_URL_API}${path}`;
    };

    return (
        <ContenedorSeccion titulo="Línea de Productos" color_fondo="blanco">
            <div className={styles.contenedor_linea_productos} data-aos="fade-up">
                {categorias.map((categoria,index) => (
                    <TipoProducto imagen={getFullUrl(categoria.enlace_imagen) || imageHelper.defaultImg} texto={convertirATitulo(categoria.nombre)} key={index}/>
                ))}   
            </div>
        </ContenedorSeccion>
    )
}



export const Marcas = () => {

    const data = [
        {enlace: imageHelper.Marca_Basa},
        {enlace: imageHelper.Marca_Caliplast},
        {enlace: imageHelper.Marca_Era},
        {enlace: imageHelper.Marca_Irritec},
        {enlace: imageHelper.Marca_Netafim},
        {enlace: imageHelper.Marca_Pedrolio},
        {enlace: imageHelper.Marca_Pentax},
        {enlace: imageHelper.Marca_Rain},
        {enlace: imageHelper.Marca_Rey},
        {enlace: imageHelper.Marca_Rivulis},
        {enlace: imageHelper.Marca_Rotoplast},
        {enlace: imageHelper.Marca_SAB},
        {enlace: imageHelper.Marca_Senkron},
        {enlace: imageHelper.Marca_Turboplast},
        {enlace: imageHelper.Marca_Turboplus},
        {enlace: imageHelper.Marca_Vyrsa},
        
    ]

    return (
        <ContenedorSeccion titulo="Marcas" color_fondo="blanco">
            <CarruselImgs data={data}/>
        </ContenedorSeccion>
    )
}

export const Inicio = () => {

    const items = [
        { name: 'Item 1', enlace_imagen: imageHelper.Macetas },
        { name: 'Item 2', enlace_imagen: imageHelper.Tachos },
        { name: 'Item 3', enlace_imagen: imageHelper.Agri },
        { name: 'Item 4', enlace_imagen: imageHelper.Tapers },
        { name: 'Item 5', enlace_imagen: imageHelper.Tanques },
        { name: 'Item 6', enlace_imagen: imageHelper.Tubos },
    ];

    return(
        <>
            <div data-aos="fade-up">
                <SliderImgs images={items}/>
            </div>
            <LineaDeProductos/>
            <SliderProductos/>
            <Marcas/>
        </>
    )
}

export default Inicio; 