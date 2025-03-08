export function mailTo(correo) {
    return `mailto:${correo}?subject=Consulta&body=Hola,%20tengo%20una%20pregunta%20sobre...`;
}
  
export function convertirATitulo(texto) {
    if (!texto) return '';
    return texto.toLowerCase().replace(/\b\w/g, letra => letra.toUpperCase());
}