import styles from '../assets/styles/estilos_productos_importantes.module.scss'
import CartaProducto from './CartaProducto';
import imageHelper from '../utils/imageHelper.js'
import { ContenedorSeccion } from '../Inicio';

export const SeccionProductosImportantes = ({titulo = "Productos Importantes", data}) => {
    return(
        <ContenedorSeccion titulo={titulo} color_fondo="negro">
            <div className={styles.contenedor_productos_destacados} data-aos="fade-up">
            {data.map((producto, index) => (
                <CartaProducto key={index} enlace_imagen={producto.enlace_imagen || imageHelper.defaultImg} texto={producto.nombre} id={producto.id}/>
            ))} 
            </div>
        </ContenedorSeccion>
    )
}
//
export const SoloProductosImportantes = ({data}) => {
    return(
        <div className={styles.contenedor_productos_destacados} data-aos="fade-up">
            {data.map((producto, index) => (
                <CartaProducto key={index} enlace_imagen={producto.enlace_imagen || imageHelper.defaultImg} texto={producto.nombre} id={producto.id}/>
            ))} 
        </div>
    )
}
