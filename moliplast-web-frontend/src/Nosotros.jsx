import styles from './assets/styles/estilos_nosotros.module.scss'
import {Marcas} from './Inicio'
import MetaData from './widgets/Metadata'

import imageHelper from './utils/imageHelper'

const Nosotros = () => {
    return (
        <>
        <MetaData title='Nosotros' canonical="/nosotros"
        jsonDataLD={[
            {
                "@type": "Organization",
                "url": "https://www.moliplast.com",
                "sameAs": [
                    "https://www.facebook.com/moliplast.com.pe/", 
                    "https://maps.app.goo.gl/LqhDf21idmFbZZRKA",
                ],
                "logo": "https://www.moliplast.com/moliplast_logo.png",
                "name": "Moliplast S.R.L.",
                "description": "es una empresa de comercialización y de servicios, 100% Peruana con un equipo de profesionales de primer nivel, con amplios conocimientos y experiencia en el tema de riego, ofrecemos Sistemas de Riego Tecnificado por Aspersión Agrícola, Riego por Goteo, Reservorios de alta calidad, tubos PVC, PE, PEAD, Tanques y Biodigestores; además cultivamos una estrecha relación con nuestros clientes y una atención personalizada en nuestras filiales de Arequipa, Pedregal y La Joya",
                "email": "ventas1@moliplast.com",
                "telephone": [
                    "+51 54 54 462917",
                    "+51 959-600-464",
                    "+51 987-790-419",
                    "+51 940-755-986",
                ],
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "Chicago 400",
                    "addressLocality": "Arequipa",
                    "addressCountry": "PE",
                    "addressRegion": "Arequipa",
                    "postalCode": "04007"
                },
                "vatID": "20130008322", // RUC
                //"iso6523Code": "0199:724500PMK2A2M1SQQ228" // ISO 6523 en el contexto de Peppol en Peru
            },
        ]}
        />
        <div className={styles.contenedor_nosotros} data-aos="fade-up">
            <h1>Nosotros</h1>
            <div>
                <p>MOLIPLAST S.R.L., es una empresa de comercialización y de servicios, 100% Peruana con un equipo de profesionales de primer nivel, con amplios conocimientos y experiencia en el tema de riego, ofrecemos Sistemas de Riego Tecnificado por Aspersión Agrícola, Riego por Goteo, Reservorios de alta calidad, tubos PVC, PE, PEAD, Tanques y Biodigestores; además cultivamos una estrecha relación con nuestros clientes y una atención personalizada en nuestras filiales de Arequipa, Pedregal y La Joya.
                <br/><br/>
                Los servicios prestados por Moliplast S.R.L., cumplen con los Requisitos de Calidad especificados por las normas técnicas Nacionales y sus labores se desarrollan dentro de un Sistema de Aseguramiento de la Calidad y Seguridad.</p>
                <img src={imageHelper.Fachada_Moliplast} alt="" />
            </div>
        </div>
        <Marcas/>
        </>
    )
}

export default Nosotros;