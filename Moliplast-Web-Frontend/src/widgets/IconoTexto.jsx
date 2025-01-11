import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import styles from "../assets/styles/estilos_icono_texto.module.scss"

export const Titulo_Lista = ({ Icono = false, titulo, elementos_lista = false, linkRouter = false, react_icon = false}) => {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
        <div className={styles.cont_listados}>
            <div className={isHovered ? 'hovered' : ''}>
                {Icono ? (
                    react_icon ? 
                        <Icono className={styles.react_icon}/> 
                    : <Icono/> 
                ) : null}
                <h3>{titulo}</h3>
            </div>

            {elementos_lista ? 
            (<ul>
                {elementos_lista.map((item, index) => (
                    <li key={index} 
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    {...(item.extra || {})}
                    >
                        {linkRouter ? 
                        (<Link to={item.enlace}>{item.elemento}</Link>) : 
                        (<a href={item.enlace ? item.enlace : undefined} target="_blank">{item.elemento}</a>)}
                        
                    </li> 
                ))}
            </ul>) : (null)
            }
            
        </div>
    );
}


export const Titulo_Icono = ({ Icono, titulo, enlace = undefined, react_icon = false }) => {
    return (
        <a href={enlace} target="_blank" className={styles.cont_titulo_icono}>
            {react_icon ? 
                <Icono className={styles.react_icon}/> 
            : <Icono/> }
            <h3>{titulo}</h3>
        </a>
    );
}