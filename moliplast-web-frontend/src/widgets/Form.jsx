import styles from "../assets/styles/estilos_input.module.scss";

export const InputNormal = ({
    type = 'input',
    placeholder = '',
    Icono = false,
    value='',
    buttonType = 'submit',
    onChange = () => {},
}) => {
    return (
        <div className={styles.cont_input}>
            <input
                type={type}
                id="fname"
                name="fname"
                placeholder={placeholder}
                value={value}
                onChange={onChange}  // Añade esta línea
            />
            <button type={buttonType}>
                {Icono && <Icono />}
            </button>
        </div>
    );
};


export const InputBuscador = ({
    placeholder = '',
    Icono = false,
    value = '',
    onChange = () => {}
}) => {
    return (
        <div className={styles.cont_input}>
            <input
                type="text" // Siempre será un input de texto
                id="search"
                name="search"
                placeholder={placeholder}
                value={value}
                onChange={onChange} // Actualización en tiempo real
            />
            <button>
                {Icono && <Icono />}
            </button>
        </div>
    );
};