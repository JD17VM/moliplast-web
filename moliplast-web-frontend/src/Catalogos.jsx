import styles from './assets/styles/estilos_catalogos.module.scss'

import imageHelper from './utils/imageHelper'

const Catalogos = () => {
    return (
        <>
        <div className={styles.cont_seccion_catalogos} data-aos="fade-up">
            <h1>Catálogos</h1>
            <div className={styles.cont_catalogos}>
                <a href=""><img src="https://www.imprentaonline.net/blog/wp-content/uploads/din-a4.png" alt="" /></a>
                <a href=""><img src="https://upload.wikimedia.org/wikipedia/commons/8/8a/Golden_Retriever_9-year_old.jpg" alt="" /></a>
                <a href=""><img src="https://cdn.royalcanin-weshare-online.io/zlY7qG0BBKJuub5q1Vk6/v1/59-es-l-golden-running-thinking-getting-dog-beneficios?w=1280&fm=jpg&auto=format%2Ccompress" alt="" /></a>
            </div>
        </div>
        </>
    )
}

export default Catalogos;