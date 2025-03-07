import styles from "../assets/styles/estilos_input.module.scss";

export const InputNormal = ({
    type = 'input',
    placeholder = '',
    Icono = false,
    value='',
    buttonType = 'submit',
    onChange = () => {},
    autocomplete = "on"
}) => {
    return (
        <div className={styles.cont_input}>
            <input
                type={type}
                id="fname"
                name="fname"
                placeholder={placeholder}
                onChange={onChange}  // Añade esta línea
                autoComplete={autocomplete}
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
    onChange = () => {},
    autocomplete = "on"
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
                autoComplete={autocomplete}
            />
            <button>
                {Icono && <Icono />}
            </button>
        </div>
    );
};