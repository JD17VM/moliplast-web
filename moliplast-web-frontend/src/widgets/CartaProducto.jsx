import styles from '../assets/styles/estilos_carta_producto.module.scss'

const CartaProducto = ({enlace_imagen, texto}) => {
    return (
        <a className={styles.carta_producto}>
            <div className={styles.cont_imagen_producto}>
                <img src={enlace_imagen} alt="" />
            </div>
            <div className={styles.cont_nombre_producto}>
                <p>{texto}</p>
            </div>
        </a>
    )
}

export default CartaProducto;