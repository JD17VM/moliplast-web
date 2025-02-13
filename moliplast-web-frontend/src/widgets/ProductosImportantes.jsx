import styles from '../assets/styles/estilos_productos_importantes.module.scss'
import CartaProducto from './CartaProducto';
import imageHelper from '../utils/imageHelper.js'
import { ContenedorSeccion } from '../Inicio';


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

export const SoloProductosImportantes = () => {
    return(
        <div className={styles.contenedor_productos_destacados} data-aos="fade-up">
            <CartaProducto enlace_imagen={imageHelper.ImagenDemoProducto1} texto="ELECTROVANNE NAANDAN 2" />
            <CartaProducto enlace_imagen={imageHelper.ImagenDemoProducto2} texto="ELECTROBOMBA SUMERGIBLE FORAS" />
            <CartaProducto enlace_imagen={imageHelper.ImagenDemoProducto3} texto="Biodigestor Autolimpiable 1300 Litros" />
            <CartaProducto enlace_imagen={imageHelper.ImagenDemoProducto4} texto="GREENRAIN SYSTEM | VALVULA ELECTRICA SERIE DVF LINEAL 1” RH" />
        </div>
    )
}
