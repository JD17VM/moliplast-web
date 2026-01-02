import React from 'react';
import styles from '../assets/styles/estilos_tabla_variantes.module.scss';
import { completarConCeros } from "../utils/utils.js";

export const RegistroVariante = ({ variante, atributos_division, esActiva, onClick }) => {
    return (
        <tr 
            onClick={onClick} 
            className={`${styles.registro} ${esActiva ? styles.activo : ''}`}
        >
            <td style={{ fontWeight: esActiva ? 'bold' : 'normal' }}>
                {completarConCeros(variante.codigo)}
            </td>

            {/* --- NUEVA COLUMNA: NOMBRE --- */}
            <td style={{ fontWeight: esActiva ? 'bold' : 'normal' }}>
                {variante.nombre}
            </td>

            {/* Celdas dinámicas (Atributos) */}
            {atributos_division ? (
                atributos_division.map((attr, index) => (
                    <td key={index}>{variante.atributos_json?.[attr] || '-'}</td>
                ))
            ) : (
                /* Si no hay atributos definidos, mostramos la variante o guión */
                <td>{variante.nombre_variante || '-'}</td>
            )}
        </tr>
    );
};

export const TablaVariantes = ({ variantes, atributos_division, variantId, handleVariantClick }) => {
    if (!variantes || variantes.length === 0) return null;

    return (
        <div className={styles.cont_tabla}>
            <table>
                <thead>
                    <tr>
                        <th>Codigo</th>
                        {/* --- NUEVO ENCABEZADO --- */}
                        <th>Nombre</th>
                        
                        {/* Encabezados dinámicos */}
                        {atributos_division ? (
                            atributos_division.map((attr, index) => <th key={index}>{attr}</th>)
                        ) : (
                            <th>Variante</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {variantes.map((variante) => (
                        <RegistroVariante
                            key={variante.id}
                            variante={variante}
                            atributos_division={atributos_division}
                            esActiva={variante.id == variantId}
                            onClick={() => handleVariantClick(variante.id)}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};