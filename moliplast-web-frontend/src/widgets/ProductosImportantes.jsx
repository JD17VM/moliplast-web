import styles from '../assets/styles/estilos_productos_importantes.module.scss'
import CartaProducto from './CartaProducto';
import imageHelper from '../utils/imageHelper.js'
import { ContenedorSeccion } from '../Inicio';

// Función para construir la URL completa de la imagen
const getFullImageUrl = (path) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `${BASE_URL_API}${path}`;
};  

export const SeccionProductosImportantes = ({titulo = "Productos Importantes"}) => {
    return(
        <ContenedorSeccion titulo={titulo} color_fondo="negro">
            <div className={styles.contenedor_productos_destacados} data-aos="fade-up">
                <CartaProducto enlace_imagen={imageHelper.ImagenDemoProducto1} texto="ELECTROVANNE NAANDAN 2" />
                <CartaProducto enlace_imagen={imageHelper.ImagenDemoProducto2} texto="ELECTROBOMBA SUMERGIBLE FORAS" />
                <CartaProducto enlace_imagen={imageHelper.ImagenDemoProducto3} texto="Biodigestor Autolimpiable 1300 Litros" />
                <CartaProducto enlace_imagen={imageHelper.ImagenDemoProducto4} texto="GREENRAIN SYSTEM | VALVULA ELECTRICA SERIE DVF LINEAL 1” RH" />
            </div>
        </ContenedorSeccion>
    )
}
//
export const SoloProductosImportantes = ({data}) => {
    return(
        <div className={styles.contenedor_productos_destacados} data-aos="fade-up">
            {data.map((producto, index) => (
                <CartaProducto key={index} enlace_imagen={producto.img || imageHelper.defaultImg} texto={producto.nombre} id={producto.id}/>
            ))} 
        </div>
    )
}
