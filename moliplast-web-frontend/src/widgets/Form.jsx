import styles from "../assets/styles/estilos_input.module.scss";

export const InputButton = ({
    type = 'input',
    placeholder = '',
    Icono = false,
    value = '', // Nueva prop: valor del input
    onChange = () => {} // Nueva prop: función para manejar cambios
}) => {
    return (
        <div className={styles.cont_input}>
            <input
                type={type}
                id="fname"
                name="fname"
                placeholder={placeholder}
                value={value} // Aplicar el valor
                onChange={onChange} // Manejar cambios
            />
            <button>
                {Icono && <Icono />}
            </button>
        </div>
    );
};