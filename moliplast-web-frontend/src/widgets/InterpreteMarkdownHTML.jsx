import showdown from "showdown";
import styles from '../assets/styles/estilos_markdown.module.scss'

const InterpreteMarkdownHTML = () => {
    const converter = new showdown.Converter({ tables: true });

    const markdownText = `
# Mi tabla con texto

Este es un párrafo de texto antes de la tabla.  Puede incluir **negritas**, *cursivas* y otros elementos Markdown.

| Plugin | README | Descripción |
|---|---|---|
| Dropbox | [plugins/dropbox/README.md][PlDb] | Sincroniza archivos con Dropbox. |
| GitHub | [plugins/github/README.md][PlGh] | Gestiona proyectos en GitHub. |
| Google Drive | [plugins/googledrive/README.md][PlGd] | Almacena y comparte archivos en Google Drive. |
| OneDrive | [plugins/onedrive/README.md][PlOd] | Sincroniza archivos con OneDrive. |
| Medium | [plugins/medium/README.md][PlMe] | Publica artículos en Medium. |
| Google Analytics | [plugins/googleanalytics/README.md][PlGa] | Analiza el tráfico de tu sitio web. Analiza el tráfico de tu sitio web. Analiza el tráfico de tu sitio web. |

Este es otro *párrafo* de **texto** después de la tabla.  También puede incluir enlaces como [este](https://www.ejemplo.com).

- Esta esla opcion 1
- Esta esla opcion 1
- Esta esla opcion 1
- Esta esla opcion 1
- Esta esla opcion 1


# Más texto

Incluso puedes tener más encabezados y contenido Markdown después de la tabla.
    `;

    const html = converter.makeHtml(markdownText);

    // Función para envolver las tablas en un div con la clase .table-wrapper
    const wrapTables = (htmlString) => {
        // Reemplazar <table> con <div class="table-wrapper"><table>
        let modifiedHtml = htmlString.replace(/<table>/g, '<div class="table-wrapper"><table>');
        // Reemplazar </table> con </table></div>
        modifiedHtml = modifiedHtml.replace(/<\/table>/g, '</table></div>');
        return modifiedHtml;
    };

    const modifiedHtml = wrapTables(html);

    return (
            <div className={styles.cont_MD} dangerouslySetInnerHTML={{ __html: modifiedHtml }} />
    );
};

export default InterpreteMarkdownHTML;