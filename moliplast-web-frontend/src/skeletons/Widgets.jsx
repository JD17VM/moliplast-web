import styles from '../assets/styles/estilos_carta_producto.module.scss'
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const CartaProductoSkeleton = () => {
    return (
        <div className={styles.carta_producto}>
            <div className={styles.cont_imagen_producto}>
                <Skeleton height="100%" width="100%" />
            </div>
            <div className={styles.cont_nombre_producto} style={{ display:'flex',flexDirection: 'column', rowGap: '3px' }}>
                <Skeleton height={15} width={190}/>
                <Skeleton height={15} width={190}/>
                <Skeleton height={15} width={190}/>
            </div>
        </div>
    )
}

export default CartaProductoSkeleton;