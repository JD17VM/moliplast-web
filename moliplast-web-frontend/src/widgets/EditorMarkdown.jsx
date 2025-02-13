import React, { useRef } from 'react';
import '@dile/editor/editor.js';
import styles from "../assets/styles/estilos_editor_markdown.module.scss"
import { FaTable } from "react-icons/fa";

const EditorMarkdown = () => {

    const editorRef = useRef(null);

    const handleSave = () => {
        if (editorRef.current) {
        const markdownContent = editorRef.current.value;
        console.log('Contenido en Markdown:', markdownContent);
        }
    };

    

    return (
        <div className={styles.cont_editor_markdown}>
        <dile-editor
            ref={editorRef}
            viewSelected="editor"
            disableToolbarItems="code_mark|link|h2|h3|h4|code|image|ordered_list|lift|removeLink"
        >
        </dile-editor>
        <a href="https://www.tablesgenerator.com/markdown_tables" target='_blank'><FaTable /></a>
        <button onClick={handleSave}>Guardar</button>
        </div>
    )
}

export default EditorMarkdown;