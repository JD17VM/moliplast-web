import styles from './assets/styles/estilos_servicios.module.scss'

import imageHelper from './utils/imageHelper'

const Servicio = ({ titulo, descripcion, imagen }) => {
    return (
        <article>
            <div>
                <h2>{titulo}</h2>
                <p>{descripcion}</p>
            </div>
            <img src={imagen} alt="" />
        </article>
    )
}


const Servicios = () => {
    return (
        <>
        <div className={styles.contenedor_servicios} data-aos="fade-up">
            <h1>Servicios</h1>
            <Servicio titulo='Este es el subtitulo 1' descripcion='MOLIPLAST S.R.L., es una empresa de comercialización y de servicios, 100% Peruana con un equipo de profesionales de primer nivel, con amplios conocimientos y experiencia en el tema de riego; ofrecemos Sistemas de Riego Tecnificado por Aspersión Agrícola, Riego por Goteo, Reservorios alta calidad, tubos PVC, PE, PEAD, Tanques y Biodigestores; además cultivamos una estrecha relación con nuestros clientes y una atención personalizada en nuestras filiales de Arequipa, Pedregal y La Joya.' imagen={imageHelper.Fachada_Moliplast}/>
            
            <Servicio titulo='Este es el subtitulo 1' descripcion='MOLIPLAST S.R.L., es una empresa de comercialización y de servicios, 100% Peruana con un equipo de profesionales de primer nivel, con amplios conocimientos y experiencia en el tema de riego; ofrecemos Sistemas de Riego Tecnificado por Aspersión Agrícola, Riego por Goteo, Reservorios alta calidad, tubos PVC, PE, PEAD, Tanques y Biodigestores; además cultivamos una estrecha relación con nuestros clientes y una atención personalizada en nuestras filiales de Arequipa, Pedregal y La Joya.' imagen={imageHelper.Fachada_Moliplast}/>
            
            <Servicio titulo='Este es el subtitulo 1' descripcion='MOLIPLAST S.R.L., es una empresa de comercialización y de servicios, 100% Peruana con un equipo de profesionales de primer nivel, con amplios conocimientos y experiencia en el tema de riego; ofrecemos Sistemas de Riego Tecnificado por Aspersión Agrícola, Riego por Goteo, Reservorios alta calidad, tubos PVC, PE, PEAD, Tanques y Biodigestores; además cultivamos una estrecha relación con nuestros clientes y una atención personalizada en nuestras filiales de Arequipa, Pedregal y La Joya.' imagen={imageHelper.Fachada_Moliplast}/>
            
        </div>

        </>
    )
}

export default Servicios;