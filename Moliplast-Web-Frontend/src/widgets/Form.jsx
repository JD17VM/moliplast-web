import styles from "../assets/styles/estilos_input.module.scss"



export const InputButton = ({type = 'input', placeholder = '', Icono = false}) => {
    return (
        <div className={styles.cont_input}>
            <input type={type} id="fname" name="fname" placeholder={placeholder}/>
            <button>
                {
                    Icono && <Icono/> 
                }
                
            </button>
        </div>
    )
}