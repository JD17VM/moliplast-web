import styles from './assets/styles/estilos_contacto.module.scss'
import React, { useState } from 'react';
import { mailTo } from "./utils/utils.js"
import {
    APIProvider,
    Map,
    AdvancedMarker,
    Marker,
    Pin,
    InfoWindow,
  } from "@vis.gl/react-google-maps";

import {Titulo_Lista, Titulo_Icono} from "./widgets/IconoTexto"
import { Icono_Facebook, Icono_Whatsapp } from './assets/imgs/iconos/svg/Redes_Sociales';

import { FaMapMarkerAlt} from "react-icons/fa";
import { FaSquarePhone } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";

import MetaData from './widgets/Metadata'


const Mapa = ({ latitud, longitud, defaultZoom }) => {
    const position = { lat: latitud, lng: longitud };
    const mapId = "95c21fb5525f022a";
  
    return (
      <APIProvider apiKey="AIzaSyCqQf88JpLyIpTf_fC2nXhGpaWPMUb25NY">
        <Map
          // zoom={17}
          //center={position}
          defaultZoom={17}
          //defaultCenter = {position}
          center={position}
          //zoom={17}
          mapId={mapId}
          style={{
            width: "100%",
            height: "100%",
          }}
          gestureHandling="cooperative"
          disableDefaultUI={true}
          zoomControl= {true}

        >
          <Marker 
            position={position}
            icon={{
                url:"/icono_maps.png",
                scaledSize: {width:11 * 3, height:16 * 3}
            }}
          />
        </Map>
      </APIProvider>
    );
};


const Contacto = () => {

    const [laDireccion, setDireccion] = useState(1);

    let mapa;

    if (laDireccion === 1){
        mapa = <Mapa latitud={-16.4144553} longitud={-71.5060859}/>;
    }else if(laDireccion === 2){
        mapa = <Mapa latitud={-16.3608825} longitud={-72.1980104}/>;
    }


    return (
        <>
        <MetaData title='Contacto' canonical="/contacto"/>
        <div className={styles.contenedor_contacto} data-aos="fade-up">
            <h1>Contacto</h1>
            <div>
                <div className={styles.contenedor_direcciones}>
                    <div className={styles.contenedor_map}>
                    {mapa}
                    </div>
                    
                    <div className={styles.direcciones}>
                        <button onClick={() => setDireccion(1)} className={laDireccion === 1 ? styles.seleccionado : styles.no_seleccionado}>
                            <Titulo_Lista 
                            react_icon
                            Icono = { FaMapMarkerAlt }
                            titulo = "Dirección"
                            elementos_lista={[
                                {elemento: "Calle Chicago N° 403 Apima - Paucarpata", enlace: ""},
                            ]}/>
                        </button>

                        <button onClick={() => setDireccion(2)} className={laDireccion === 2 ? styles.seleccionado : styles.no_seleccionado}>
                            <Titulo_Lista
                            react_icon
                            Icono = { FaMapMarkerAlt }
                            titulo = "Sucursal"
                            elementos_lista={[
                                {elemento: "Calle Perimetral Norte Mz.U Lote 17 Pedregal - Majes", enlace: ""},
                                
                            ]}/>
                        </button>
                    </div>
                </div>
                <div className={styles.contenedor_redes_contacto}>
                        <Titulo_Lista 
                        react_icon
                        Icono = { FaSquarePhone }
                        titulo = "Teléfono"
                        elementos_lista={[
                            {elemento: "054-462917", enlace: "tel:054 462917"},
                        ]}/>

                        <Titulo_Icono 
                        Icono = { Icono_Whatsapp }
                        titulo = "959-600-464"
                        enlace = "https://wa.me/+51959600464?text=Hola,%20estoy%20interesado%20en%20..."
                        />
                        <Titulo_Icono  
                        Icono = { Icono_Whatsapp }
                        titulo = "987-790-419"
                        enlace = "https://wa.me/+51987790419?text=Hola,%20estoy%20interesado%20en%20..."
                        />

                        <Titulo_Lista 
                        react_icon
                        Icono = { FaSquarePhone }
                        titulo = "Pedregal"
                        elementos_lista={[
                            {elemento: "940-755-986", enlace: "https://wa.me/+51940755986?text=Hola,%20estoy%20interesado%20en%20..."},
                        ]}/>



                        <Titulo_Lista 
                        react_icon
                        Icono = { MdEmail }
                        titulo = "Ventas"
                        elementos_lista={[
                            {elemento: "ventas1@moliplast.com", enlace: mailTo("ventas1@moliplast.com")},
                            {elemento: "ventas09@moliplast.com", enlace: mailTo("ventas09@moliplast.com")},
                        ]}/>

                        <Titulo_Lista 
                        react_icon
                        Icono = { MdEmail }
                        titulo = "Correo"
                        elementos_lista={[
                            {elemento: "jose.ramos@moliplast.com", enlace: mailTo("jose.ramos@moliplast.com")},
                            {elemento: "jose1112ramos@gmail.com", enlace: mailTo("jose112ramos@gmail.com")},
                        ]}/>

                        <Titulo_Lista 
                        Icono = { Icono_Facebook }
                        titulo = "Facebook"
                        elementos_lista={[
                            {elemento: "/moliplast.com.pe", enlace: "https://www.facebook.com/moliplast.com.pe"},
                        ]}/>

                </div>
            </div>
        </div>
        </>

    )
}

export default Contacto;