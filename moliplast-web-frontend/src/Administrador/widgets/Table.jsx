import { Link } from 'react-router-dom';
import { getFullUrl, scrollToTop } from "../../utils/utils.js"

export const TableData = ({image_src = false, link_to = false, children = false, list = false, a_href = false}) => {
    if(image_src){
        return (
        <td>
            {image_src ? (
                <img
                    src={getFullUrl(image_src)}
                    alt={`Imagen de ${children}`}
                />
            ) : 'No disponible'}
        </td>
        )
    }else if(link_to){
        return (
        <td>
            <Link Link to={link_to}>{children}</Link>
        </td>
        )
    }else if(list){
        return (
        <td>
            <ul>
                {list.map((elemento, index) => (
                    <li key={index}>▪︎ {elemento}</li>
                ))}
            </ul>
        </td>
        )
    }else if(a_href){
        return (
            <td>
            {a_href ? (
                <a href={a_href} target="_blank" rel="noopener noreferrer">
                    {children}
                </a>
            ) : 'No disponible'}
            </td>
        )
    }else if(children){
        return (
        <td>
            {children}
        </td>
        )
    }
    
}

export const TableDataActions = ({ item, handleEdit, handleEditarFila, handleDelete, loading }) => {
    return (
        <td>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <button
                onClick={() => {
                    handleEdit(item); // Primero ejecuta la función handleEdit
                    scrollToTop();    // Luego ejecuta la función scrollToTop
                    handleEditarFila(item.id, item); // Llama a handleEditarFila con la información del item
                }}
                disabled={loading}
                className="btn btn-primary mb-1 w-50"
                >
                Editar
                </button>

                <button
                onClick={() => handleDelete(item.id)}
                disabled={loading}
                className="btn btn-danger w-50"
                >
                Eliminar
                </button>
            </div>
        </td>
    )
}