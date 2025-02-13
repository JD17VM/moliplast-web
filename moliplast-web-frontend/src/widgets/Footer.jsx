import React, { useState } from 'react';
import styled from 'styled-components'

import styles from '../assets/styles/estilos_footer.module.css'
import imageHelper from '../utils/imageHelper.js'
import mailTo from "../utils/utils.js"

import { Titulo_Lista, Titulo_Icono } from './IconoTexto';

import { Icono_Facebook } from '../assets/imgs/iconos/svg/Redes_Sociales';

import { FaKey } from "react-icons/fa";
import { FaSquarePhone } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { FaMapMarkerAlt} from "react-icons/fa";
import { InputButton } from './Form';




const Seccion_Hover_Footer = styled.div`
  .hovered{
    color:white;
  }
`;


const Footer = ({data}) => {

    const dataModificada = data.map(objeto => ({
        elemento: objeto.nombre, // Mapear "nombre" a "elemento"
        enlace: objeto.enlace,   // Conservar la propiedad "enlace"
    }));

    const [mostrarElement, setShowElement] = useState(false);
    const [timer, setTimer] = useState(null);

    const handleMouseDown = () => {
        // Iniciar un temporizador de 5 segundos
        const timeoutId = setTimeout(() => {
          setShowElement(true);
        }, 5000);
        setTimer(timeoutId);
      };
    
    const handleMouseUp = () => {
        // Si el usuario suelta antes de 5 segundos, se cancela el temporizador
        clearTimeout(timer);
        //setShowElement(false);
    };

    return (
        <footer>
            <div className={styles.cont_logo_blanco}>
                <img src={imageHelper.logo_moliplast_blanco} alt="logo moliplast blanco" />
            </div>

            <Seccion_Hover_Footer className={`${styles.cont_direccion_horarios} ${styles.hover_efect}`}>
                <Titulo_Lista 
                linkRouter
                react_icon
                Icono = {FaMapMarkerAlt}
                titulo = "Dirección"
                elementos_lista={[
                    {elemento: "Calle Chicago N° 403 Apima - Paucarpata", enlace: "/contacto"},
                ]}/>

                <Titulo_Lista
                linkRouter 
                react_icon
                Icono = {FaMapMarkerAlt}
                titulo = "Sucursal"
                elementos_lista={[
                    {elemento: "Calle Perimetral Norte Mz.U Lote 17 Pedregal - Majes", enlace: "/contacto"},
                ]}/>
            </Seccion_Hover_Footer>

            <Seccion_Hover_Footer className={`${styles.cont_secciones_importantes} ${styles.hover_efect}`}>
                <Titulo_Lista 
                titulo = "Secciones Importantes"
                elementos_lista={[
                    ...dataModificada,
                    {
                        elemento: "Administración", 
                        enlace: "#",
                        extra: {
                            onMouseDown: handleMouseDown,
                            onMouseUp: handleMouseUp,
                            onTouchStart: handleMouseDown,
                            onTouchEnd: handleMouseUp,
                        },
                    },
                ]}
                linkRouter
                />
                {mostrarElement ? (
                    <InputButton placeholder='Contraseña' type='password' Icono = {FaKey}/>
                ) : null}
            </Seccion_Hover_Footer>

            <Seccion_Hover_Footer className={`${styles.cont_canales_comunicacion} ${styles.hover_efect}`}>
                <Titulo_Lista 
                react_icon
                Icono = {MdEmail}
                titulo = "Correo"
                elementos_lista={[
                    {elemento: "ventas1@moliplast.com", enlace: mailTo("ventas1@moliplast.com")},
                    {elemento: "ventas09@moliplast.com", enlace: mailTo("ventas09@moliplast.com")},
                ]}/>

                <Titulo_Icono 
                react_icon
                Icono = {FaSquarePhone}
                titulo = "054-462917"
                enlace = "tel:054 462917"
                />
                <Titulo_Icono 
                Icono = {Icono_Facebook}
                titulo = "/moliplast.com.pe"
                enlace = "https://www.facebook.com/moliplast.com.pe"
                />
            </Seccion_Hover_Footer>

        </footer>
    );
}

export default Footer;