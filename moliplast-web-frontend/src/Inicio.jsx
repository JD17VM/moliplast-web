import { Link } from 'react-router-dom';

import styles from './assets/styles/estilos_inicio.module.scss'
import imageHelper from './utils/imageHelper.js'

import SliderImgs from './widgets/SliderImgs';

import CarruselImgs from './widgets/CarruselImgs';


import SliderProductos from './widgets/SliderProductos';

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
        <Link 
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
    return (
        <ContenedorSeccion titulo="Línea de Productos" color_fondo="blanco">
            <div className={styles.contenedor_linea_productos} data-aos="fade-up">
                <TipoProducto imagen={imageHelper.background_Riego_Residencial_Municipal} texto="Riego Residencial Municipal"/>
                <TipoProducto imagen={imageHelper.background_Riego_Agricultura} texto="Riego para Agricultura"/>
                <TipoProducto imagen={imageHelper.background_Otros} texto="Otros"/>
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