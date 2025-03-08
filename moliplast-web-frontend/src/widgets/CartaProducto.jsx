import { Link } from 'react-router-dom';
import styles from '../assets/styles/estilos_carta_producto.module.scss'
import { convertirATitulo } from "../utils/utils.js"

const CartaProducto = ({enlace_imagen, texto, id}) => {
    return (
        <Link to={`/productos/producto/${id}`} className={styles.carta_producto}>
            <div className={styles.cont_imagen_producto}>
                <img src={enlace_imagen} alt="" />
            </div>
            <div className={styles.cont_nombre_producto}>
                <p>{convertirATitulo(texto)}</p>
            </div>
        </Link>
    )
}

export default CartaProducto;