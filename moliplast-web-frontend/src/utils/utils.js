const BASE_URL_API = "https://moliplast.com/api"

export function mailTo(correo) {
    return `mailto:${correo}?subject=Consulta&body=Hola,%20tengo%20una%20pregunta%20sobre...`;
}
  
export function convertirATitulo(texto) {
    if (!texto) return '';
    return texto.toLowerCase().replace(/\b\w/g, letra => letra.toUpperCase());
}

// Función para construir la URL completa
export const getFullUrl = (path) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `${BASE_URL_API}${path}`;
};

export function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Agrega un desplazamiento suave
    });
}

export function completarConCeros(numero) {
    let numeroComoCadena = String(numero);
    return numeroComoCadena.padStart(6, '0');
  }