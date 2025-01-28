
import styles from '../assets/styles/estilos_botones.module.scss'

export const BtnIconoTexto = ({children, Icono = false, colorPrincipal = 'var(--color_azul_1)', colorActivo = 'var(--color_azul_-2)'}) => {
    
    const buttonStyles = {
        '--color_principal': colorPrincipal,
        '--color_activo': colorActivo,
    };

    
    return (
        <button className={styles.btn_icono_texto} style={buttonStyles}>
            {Icono && <Icono/>}
            <p>{children}</p>
        </button>
    )
}