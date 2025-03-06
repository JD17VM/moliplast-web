import showdown from "showdown";
import styles from '../assets/styles/estilos_markdown.module.scss';

const InterpreteMarkdownHTML = ({ texto_markdown }) => {
    const converter = new showdown.Converter({ tables: true });

    let markdownText = "";

    if (!texto_markdown) {
        markdownText = ``;
    } else {
        markdownText = texto_markdown;
    }

    const html = converter.makeHtml(markdownText);

    // Función para envolver las tablas en un div con la clase .table-wrapper
    const wrapTables = (htmlString) => {
        if (typeof htmlString !== 'string') {
            console.error('htmlString is not a string:', htmlString);
            return ''; // O un valor predeterminado
        }
        let modifiedHtml = htmlString.replace(/<table>/g, '<div class="table-wrapper"><table>');
        modifiedHtml = modifiedHtml.replace(/<\/table>/g, '</table></div>');
        return modifiedHtml;
    };

    let modifiedHtml = "";

    if (typeof html === 'string') {
        modifiedHtml = wrapTables(html);
    } else {
        modifiedHtml = "";
    }

    return (
        <div className={styles.cont_MD} dangerouslySetInnerHTML={{ __html: modifiedHtml }} />
    );
};

export default InterpreteMarkdownHTML;