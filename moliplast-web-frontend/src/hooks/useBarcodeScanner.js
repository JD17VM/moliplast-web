import { useEffect, useRef } from 'react';

export const useScannerInput = (onScan) => {
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

            if (event.key === 'Enter' && chars.current.length > 0) {
                event.preventDefault();
                const scannedContent = chars.current.join('');
                onScan(scannedContent.trim()); // <-- APLICAR .trim() AQUÍ TAMBIÉN POR SEGURIDAD
                chars.current = [];
                clearTimeout(timerId.current);
                timerId.current = null;
                return;
            }

            if (event.key.length > 1 && event.key !== 'Enter') {
                return;
            }

            // Acumulamos el caracter presionado
            chars.current.push(event.key);

            // Limpiamos el timer anterior para reiniciarlo
            if (timerId.current) {
                clearTimeout(timerId.current);
            }

            // Aumentamos el tiempo de espera. 200ms o 300ms suelen ser más seguros.
            timerId.current = setTimeout(() => {
                chars.current = [];
                timerId.current = null;
            }, 200); // <-- AUMENTAR EL TIEMPO AQUÍ (ej. 200ms)
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