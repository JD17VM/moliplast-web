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
                value={value}
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
    autocomplete = "on",
    onSearch = () => {}
}) => {
    const handleSubmit = (e) => {
        e.preventDefault(); // Evitar el comportamiento de envío predeterminado del formulario
        onSearch(); // Llamar a la función de búsqueda
    };

    return (
        <form className={styles.cont_input} onSubmit={handleSubmit}>
            <input
                type="text"
                id="search"
                name="search"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                autoComplete={autocomplete}
            />
            <button type="submit"> {/* Cambiar el tipo del botón a "submit" */}
                {Icono && <Icono />}
            </button>
        </form>
    );
};