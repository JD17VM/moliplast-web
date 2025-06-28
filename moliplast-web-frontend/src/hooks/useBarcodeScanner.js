import { useEffect, useRef } from 'react';

// Este hook escucha la entrada de teclado y trata de detectar un escaneo de código de barras.
export const useBarcodeScanner = (onScan) => {
    const chars = useRef([]);
    const timerId = useRef(null);

    useEffect(() => {
        const handleKeyDown = (event) => {
            // Ignoramos el listener si el usuario está escribiendo en un campo de texto,
            // textarea o un editor de contenido. ¡Esto resuelve el conflicto de foco!
            const isTypingInInput = ['INPUT', 'TEXTAREA'].includes(event.target.tagName) || event.target.isContentEditable;
            if (isTypingInInput) {
                return;
            }

            // Si se presiona 'Enter' y tenemos caracteres acumulados, es un escaneo.
            if (event.key === 'Enter' && chars.current.length > 0) {
                event.preventDefault(); // Evita que 'Enter' envíe un formulario
                const scannedCode = chars.current.join('');
                onScan(scannedCode); // Llama a la función que nos pasaron con el código
                chars.current = []; // Limpia el buffer para el siguiente escaneo
                return;
            }

            // Ignoramos teclas especiales que no son parte de un código de barras
            if (event.key.length > 1) {
                return;
            }

            // Acumulamos el caracter presionado
            chars.current.push(event.key);

            // Limpiamos el timer anterior para reiniciarlo
            if (timerId.current) {
                clearTimeout(timerId.current);
            }

            // Creamos un nuevo timer. Si no se presiona otra tecla en 100ms,
            // asumimos que no fue un escáner y limpiamos el buffer.
            timerId.current = setTimeout(() => {
                chars.current = [];
            }, 100);
        };

        // Añadimos el listener al documento completo
        document.addEventListener('keydown', handleKeyDown);

        // Limpiamos el listener cuando el componente se desmonta
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            if (timerId.current) {
                clearTimeout(timerId.current);
            }
        };
    }, [onScan]); // El efecto se vuelve a crear si la función onScan cambia
};