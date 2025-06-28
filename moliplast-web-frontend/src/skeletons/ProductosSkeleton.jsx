import styles from '../assets/styles/estilos_productos.module.scss';
import CartaProductoSkeleton from './Widgets';
import { useParams } from 'react-router-dom';

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import MetaData from '../widgets/Metadata'

const ProductosSkeleton = () => {

    const { categoria, subcategoria, subsubcategoria } = useParams();

    return (
        <>
        <MetaData title={`${categoria}`} canonical={`/productos/${categoria}`}/>
        <div className={styles.seccion_productos}>
            <div className={`${styles.cont_panel_filtros_busqueda} ${styles.ocultar}`}>
                <div className={styles.panel_filtros}>
                    <h2>Panel de Filtros</h2>
                    <ul>
                        <li><Skeleton height={20} width={190}/></li>
                        <li><Skeleton height={20} width={190}/></li>
                        <li><Skeleton height={20} width={190}/></li>
                        <li><Skeleton height={20} width={190}/></li>
                        <li><Skeleton height={20} width={190}/></li>
                    </ul>
                </div>
            </div>
            <div className={styles.titulo_boton_menu}>
                <h1>{categoria ? categoria : 'Elementos'}</h1>
            </div>
            <div className={styles.contenedor_productos}>
                <CartaProductoSkeleton />
                <CartaProductoSkeleton />
                <CartaProductoSkeleton />
                <CartaProductoSkeleton />
                <CartaProductoSkeleton />
                <CartaProductoSkeleton />
                <CartaProductoSkeleton />
                <CartaProductoSkeleton />
                <CartaProductoSkeleton />
                <CartaProductoSkeleton />
                <CartaProductoSkeleton />
                <CartaProductoSkeleton />
            </div>
            <div className={styles.pagination}>
            </div>
        </div>
        </>
    );
};

export default ProductosSkeleton;