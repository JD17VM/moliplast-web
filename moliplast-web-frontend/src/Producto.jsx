import { useState } from 'react';
import styles from './assets/styles/estilos_producto.module.scss'
import imageHelper from './utils/imageHelper';
import { MdPictureAsPdf } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";

import { BtnIconoTexto } from './widgets/Botones';
import InterpreteMarkdownHTML from './widgets/InterpreteMarkdownHTML';


import { SeccionProductosImportantes } from './widgets/ProductosImportantes';


const Producto = () => {

    const [imagenActual, setImagenActual] = useState(imageHelper.ImagenDemoProducto1);
    const [botonActivo, setBotonActivo] = useState(1);


    const handleClick = (imagen, numButton) => {
        setImagenActual(imagen);
        setBotonActivo(numButton);
    }

    return (
        <>
            <div className={styles.contenedor_producto}>
                <div className={styles.contenedor_imagenes}>    
                    <div className={styles.cont_botones}>
                        <button onClick={() => handleClick(imageHelper.ImagenDemoProducto1,1)} className={botonActivo === 1 ? styles.activo : ''}><img src={imageHelper.ImagenDemoProducto1} alt="" /></button>
                        <button onClick={() => handleClick(imageHelper.ImagenDemoProducto2,2)} className={botonActivo === 2 ? styles.activo : ''}><img src={imageHelper.ImagenDemoProducto2} alt="" /></button>
                        <button onClick={() => handleClick(imageHelper.ImagenDemoProducto3,3)} className={botonActivo === 3 ? styles.activo : ''}><img src={imageHelper.ImagenDemoProducto3} alt="" /></button>
                    </div>
                    <div className={styles.cont_imagen}>
                        <img src={imagenActual} alt="" />
                    </div>
                </div>
                <div className={styles.contenedor_datos}>
                    <h1>Electrobomba Centrífuga De 0.85 Hp Pedrollo Al-redm 610-4</h1>
                    <p>Para bombear agua limpia, sin partículas abrasivas y líquidos químicamente no agresivos con los materiales que constituyen la bomba.</p>
                    <div>
                        <BtnIconoTexto Icono={MdPictureAsPdf}>Ficha Técnica</BtnIconoTexto >
                        <BtnIconoTexto Icono={FaWhatsapp} colorPrincipal="#075e54" colorActivo='#25d366'>Comprar por Whatsapp</BtnIconoTexto >
                    </div>
                </div>
            </div>
            <div className={styles.descripcion_extra}>
                <InterpreteMarkdownHTML/>
            </div>
            <SeccionProductosImportantes titulo='Productos Relacionados'/>

        </>
    )
}

export default Producto;