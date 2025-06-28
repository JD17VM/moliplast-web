import styles from '../assets/styles/estilos_producto.module.scss';

import { SeccionProductosImportantes } from '../widgets/ProductosImportantes';

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import MetaData from '../widgets/Metadata'


const ProductoSkeleton = () => {

    return (
        <>
            <div className={styles.contenedor_producto}>
                <div className={styles.contenedor_imagenes}>
                    <div className={styles.cont_botones}>
                        <button>
                            <Skeleton height="100%" width="100%"/>
                        </button>
                        <button>
                            <Skeleton height="100%" width="100%"/>
                        </button>
                        <button>
                            <Skeleton height="100%" width="100%"/>
                        </button>
                    </div>
                    <div className={styles.cont_imagen}>
                        <Skeleton height="100%" width="100%"/>
                    </div>
                </div>
                <div className={styles.contenedor_datos}>
                    
                    <Skeleton height={40} width={400}/>

                    <Skeleton height={80} width={400}/>
                    <div>
                        <Skeleton height={40} width={250}/>
                        <Skeleton height={40} width={250}/>
                    </div>

                    <Skeleton height={50} width={200}/>

                </div>
            </div>

   
            {/*<SeccionProductosImportantes titulo='Productos Relacionados' data={productosRelacionados}/>*/}
        </>
    );
};

export default ProductoSkeleton;