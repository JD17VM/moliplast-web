
import styles from '../assets/styles/estilos_botones.module.scss'

export const BtnIconoTexto = ({children, Icono = false, colorPrincipal = 'var(--color_azul_1)', colorActivo = 'var(--color_azul_-2)', enlace = undefined, centrado = false, onClick = null}) => {
    
    const buttonStyles = {
        '--color_principal': colorPrincipal,
        '--color_activo': colorActivo,
    };

    
    if (enlace) {
        return (
            <a 
                href={enlace} 
                target="_blank" 
                className={styles.btn_icono_texto}
                style={buttonStyles}
            >
                {Icono && <Icono />}
                <p>{children}</p>
            </a>
        );
    } else {
        return (
            <button 
                onClick={onClick} 
                className={styles.btn_icono_texto}
                style={buttonStyles}
                type="button"
            >
                {Icono && <Icono />}
                <p>{children}</p>
            </button>
        );
    }
}